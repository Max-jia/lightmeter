# CRM 实战手册

> 基于 Lightmeter 项目的全栈 CRM 开发经验。下次开新 CRM 项目，照这份文档走。

---

## 1. 技术选型

| 层 | 选型 | 为什么 |
|----|------|--------|
| 框架 | Next.js 16 (App Router) | 服务端渲染 + API 路由一体 |
| 认证 | Supabase Auth | 邮箱 + Google OAuth 开箱即用，自带 PKCE |
| 数据库 | Supabase PostgreSQL | Auth 和 Data 在同一个项目，RLS 天然安全 |
| 支付 | Stripe Checkout + Webhook | 订阅 + Connect 收款，托管页面零 PCI 合规负担 |
| AI | DeepSeek / OpenAI | 邮件分类和草稿生成 |
| 部署 | Vercel | Push 即部署，静态页 CDN，预览环境 |
| 邮件 | Gmail API | 读发邮件，无需自建邮件服务器 |

**选择原则**：每层只用 1 个服务。Supabase 同时解决 Auth + DB + RLS，Stripe 同时解决订阅 + 收款 + 发票。不要为同一个问题引入 2 个服务。

---

## 2. 认证系统

### 2.1 架构

```
邮箱注册 → Supabase signUp → 写 user_metadata → DB trigger 创建 profile
Google 登录 → Supabase signInWithOAuth → callback 交换 code → session
登录 → signInWithPassword → cookie → middleware 验证
```

### 2.2 两条铁律

**铁律 1：所有 Auth 操作必须走服务端**

不要在前端直接调 `supabase.auth.signUp()`。前端表单通过 `<form action="/api/auth/signup" method="POST">` 提交，服务端负责注册 + 写入 cookie + 302 跳转。原因：浏览器直连 Supabase 会让 session cookie 延迟生效，中间件读到空 cookie 把用户踢回登录页。

**铁律 2：所有 Auth 路由必须 `createClient(true)`**

```ts
// ✅ 正确：PKCE cookie 会写回浏览器
const { supabase, responseCookies } = await createClient(true);
const res = NextResponse.redirect(url, 303);
responseCookies.forEach(c => res.cookies.set(c.name, c.value, c.options));
return res;

// ❌ 错误：PKCE cookie 丢失 → callback 找不到 code_verifier → session 创建失败
const supabase = await createClient();
return NextResponse.redirect(data.url);
```

这个 bug 极难排查——Google 登录流程全走完了，callback 也返回 303，但中间件把 `/dashboard` 又踢回 `/login`。根因就是 Google 路由里 `createClient()` 没加 `true`。

### 2.3 中间件性能

```ts
// 只在对 auth 有需求的页面调 getUser()
const needsAuth = pathname.startsWith("/dashboard") || pathname === "/login";
if (needsAuth) {
  const { data } = await supabase.auth.getUser();
  user = data.user;
}
// 首页、注册页、静态页 → 跳过 Supabase API 调用
```

错误做法：中间件里无条件 `getUser()`。每页都白交 200-500ms Supabase API 延迟。

### 2.4 数据库触发器

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, plan, trial_ends_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'plan', 'standard'),
    COALESCE((NEW.raw_user_meta_data->>'trial_ends_at')::TIMESTAMPTZ, now() + INTERVAL '14 days')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

好处：无论是邮箱注册还是 Google OAuth，`profiles` 表自动创建。不需要在注册 API 和 Google callback 里分别写 INSERT。

### 2.5 Google OAuth 验证

完整流程见 `docs/google-oauth-verification.md`。关键点：
- 敏感 scope（gmail.readonly/gmail.send）需要视频审核
- 审核 2-4 周，期间可以用 Production 模式（100 用户限额）
- 开发期间用 Testing 模式 + Test users，无用户数限制

---

## 3. 订阅扣款

### 3.1 方案选择

| 方案 | 适合场景 | Lightmeter 选择 |
|------|---------|----------------|
| 免卡试用 14 天 | C 端、低价位、低信任门槛 | ✅ 现在的方案 |
| 注册就绑卡 | 高客单价、需要过滤低意向用户 | ❌ |
| Freemium + Soft Paywall | 想积累大量免费用户 | ✅ 结合了试用期 + 过期后限功能 |

### 3.2 流程

```
注册 → profiles.trial_ends_at = now+14天 → 免卡进 Dashboard
   ↓
Dashboard 顶部倒计时横幅
   ↓
14 天到期 → 中间件检查:
   ├─ 有 active 订阅 → 正常进入
   └─ 无 active 订阅 → 301 跳 /subscribe
   ↓
/subscribe → Stripe Checkout (mode: "subscription", trial_period_days: 14)
   ↓
Stripe 到期自动扣款 → Webhook 同步 profiles.subscription_status
   ↓
Settings → Stripe Customer Portal → 用户自行管理/取消
```

### 3.3 核心代码

**Checkout API**（`/api/stripe/checkout`）：

```ts
// 关键：创建 Stripe Customer + 计算剩余试用天数
const session = await stripe.checkout.sessions.create({
  mode: "subscription",
  line_items: [{ price: PRICE_ID, quantity: 1 }],
  customer: customerId,
  subscription_data: { trial_period_days: daysLeft }, // 剩余试用天数
  success_url, cancel_url,
});
```

**Webhook**（`/api/stripe/webhook`）：

```ts
// 订阅生命周期：创建 → 续费成功 → 欠费 → 取消 → 过期
if (event.type === "customer.subscription.updated") {
  const sub = event.data.object;
  await supabase.from("profiles").update({ subscription_status: sub.status }).eq("id", userId);
}
if (event.type === "customer.subscription.deleted") {
  await supabase.from("profiles").update({ subscription_status: "canceled", stripe_subscription_id: null }).eq("id", userId);
}
```

### 3.4 中间件付墙

```ts
// 在 middleware 里：试用过期 + 无订阅 → 302 跳 /subscribe
if (trialEnded && !hasActiveSub) {
  return NextResponse.redirect(new URL("/subscribe", request.url));
}
```

---

## 4. 数据库设计

### 4.1 核心表

| 表 | 用途 | 关键字段 |
|----|------|---------|
| `profiles` | 用户扩展信息 | plan, trial_ends_at, stripe_customer_id, subscription_status |
| `clients` | 客户管理 | name, email, phone, instagram, whatsapp, event_type, event_date, status |
| `emails` | 邮件处理 | gmail_id, from_address, subject, ai_classification, ai_draft_body, status |
| `links` | 提案链接 | slug, proposal_amount, contract_template, stripe_session_id, status |
| `payments` | 支付记录 | amount, stripe_payment_intent_id, status, paid_at |
| `webhook_logs` | 调试用 | source, event_type, payload |

### 4.2 RLS（Row Level Security）

```sql
-- 用户只能读写自己的数据
CREATE POLICY "Users can CRUD own clients" ON public.clients
  FOR ALL USING (auth.uid() = user_id);

-- Webhook 服务端写入不需要用户身份
CREATE POLICY "Service can insert payments" ON public.payments
  FOR INSERT WITH CHECK (true);
```

### 4.3 客户端联系方式设计

`clients` 表用扁平的 4 个 TEXT 列（email, phone, instagram, whatsapp），不用 JSONB。理由：
- 查询和筛选简单（不需要 `->>` 语法）
- 索引友好
- 前端 UI 用「默认显示 Email + 点 + 号添加其他」的交互，一个 `contacts` 对象映射到 4 个列

---

## 5. UI 设计系统骨架

### 5.1 CSS Token 模板

```css
:root {
  /* ── 品牌色（换行业改这里）── */
  --color-brand-primary: #YOUR_BRAND;
  --color-brand-glow: rgba(YOUR_BRAND_RGB, 0.18);
  
  /* ── 表面系统（深色/浅色调这里）── */
  --color-bg-base: #121212;
  --color-bg-surface: #1E1E1E;
  --color-bg-elevated: #2C2C2C;
  --color-bg-overlay: #3A3A3A;
  
  /* ── 文字 ── */
  --color-text-primary: #F0F0F0;
  --color-text-secondary: #A0A0A0;
  --color-text-disabled: #666;

  /* ── 语义色 ── */
  --color-success: #5EA880;
  --color-warning: #D4A045;
  --color-error: #D4736A;

  /* ── 动效（Apple 风格，不随行业变）── */
  --spring-ios: cubic-bezier(0.17, 0.17, 0.32, 1.05);
  --spring-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;

  /* ── 圆角 ── */
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 20px; --radius-2xl: 24px;
  
  /* ── 阴影（4 级）── */
  --elevation-1: 0 1px 3px rgba(0,0,0,0.4);
  --elevation-2: 0 4px 14px rgba(0,0,0,0.4);
  --elevation-3: 0 10px 30px rgba(0,0,0,0.5);
  --elevation-4: 0 20px 50px rgba(0,0,0,0.55);
}
```

### 5.2 三套行业配色

**摄影/创意（Lightmeter）— 暖金 + 暗棕**：
```
--color-brand-primary: #D4A045;
--color-bg-base: #1A1816;
```

**金融/法律 — 冷蓝 + 深灰**：
```
--color-brand-primary: #4A90D9;
--color-bg-base: #0F1419;
```

**医疗/健康 — 青绿 + 软白**：
```
--color-brand-primary: #2DAA9E;
--color-bg-base: #F8FAFB;  /* 浅色主题 */
```

### 5.3 全局 CSS 工具类（行业无关）

```css
/* 按压反馈 */
.spring-press { transition: transform var(--duration-fast) var(--spring-ios); }
.spring-press:active { transform: scale(0.96); }

/* 卡片深度 */
.card-depth {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  box-shadow: var(--elevation-1);
  transition: box-shadow var(--duration-normal) var(--spring-ios),
              transform var(--duration-normal) var(--spring-ios);
}
.card-depth:hover { box-shadow: var(--elevation-2); transform: translateY(-2px); }
.card-depth:active { transform: scale(0.98); }

/* 玻璃效果 */
.glass {
  background: rgba(surface-rgb, 0.75);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.06);
}

/* 骨架屏 */
.animate-shimmer {
  background: linear-gradient(90deg, var(--color-bg-elevated) 25%, var(--color-bg-overlay) 50%, var(--color-bg-elevated) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

/* 入场动画 */
.animate-fade-in-up { animation: fadeInUp var(--duration-normal) var(--spring-ios) forwards; }

/* 逐级入场 */
.stagger > * { opacity: 0; animation: fadeInUp var(--duration-normal) var(--spring-ios) forwards; }
.stagger > *:nth-child(1) { animation-delay: 0ms; }
.stagger > *:nth-child(2) { animation-delay: 40ms; }
/* ... 最多 8 个 */

/* 无障碍 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 5.4 组件接口规范

```tsx
// Button — 所有交互按钮统一用这个
<Button variant="primary" | "secondary" | "ghost" | "danger" | "gold"
        size="sm" | "md" | "lg"
        loading={boolean}
        onClick={handler} />

// Card — 所有卡片容器统一用这个
<Card depth={0|1|2|3} glass={boolean} gradient={boolean} goldBorder={boolean}
      padding="none"|"sm"|"md"|"lg" />

// Input — 所有表单输入统一用这个
<Input label="Field name" type="text" name="field" value={val}
       onChange={fn} placeholder="..." helperText="..." error="..." />

// Badge — 状态标签
<Badge variant="default"|"success"|"warning"|"error"|"gold" />

// Avatar — 客户头像（取名字首字母）
<Avatar name="Sarah Johnson" size="sm"|"md"|"lg" />
```

### 5.5 Landing 页面布局模板

```
<nav> Logo + 登录/注册 </nav>
<Hero> 大标题 + 副标题 + 金色 CTA + 信任标签（免卡/取消/分钟） </Hero>
<Features> 3-4 个核心功能卡片（用 stagger 逐级入场） </Features>
<HowItWorks> 3 步流程 </HowItWorks>
<Pricing> Standard / Pro 双列 </Pricing>
<BottomCTA> 复用 Hero 样式，防止滚到底没出口 </BottomCTA>
<Footer> Logo + 版权 </Footer>
```

### 5.6 Apple 动效参数（行业无关，直接复制）

```css
/* 交互按压：hover 微浮 + active 弹簧缩回 */
button, .card-depth { transition: transform var(--duration-fast) var(--spring-ios); }
button:hover, .card-depth:hover { transform: translateY(-1px); }
button:active { transform: scale(0.96); }
.card-depth:active { transform: scale(0.98); }

/* 入场：从下往上淡入 */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 模态弹窗：缩放淡入 */
@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
```

---

## 6. 部署上线

### 6.1 部署架构

```
GitHub repo → Vercel (自动部署)
Supabase (DB + Auth + RLS)
Stripe (支付 + 订阅 + Webhook)
Google Cloud (Gmail API OAuth)
```

### 6.2 环境变量清单

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STANDARD_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...

# AI
DEEPSEEK_API_KEY=sk-...

# Gmail OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...

# App
NEXT_PUBLIC_APP_URL=https://lightmeter.tech
```

### 6.3 Stripe Webhook 配置

```bash
# 在 Stripe Dashboard 创建 webhook endpoint
https://yourdomain.com/api/stripe/webhook

# 需要监听的事件：
checkout.session.completed
customer.subscription.updated
customer.subscription.deleted
```

### 6.4 常见部署坑

- **Vercel 自动部署偶尔不触发**：`git push` 后手动 `vercel --prod --yes` 补一发
- **环境变量改了不生效**：Vercel 需要 Redeploy（不是新 commit）
- **Stripe Webhook 收不到**：检查 Stripe Dashboard → Webhooks → 有没有 `200 OK`
- **email rate limit exceeded**：Supabase 免费版每小时限额，多注册几次就触发

---

## 7. 常见 Bug 速查表

| 现象 | 根因 | 修复 |
|------|------|------|
| 注册后跳回登录页 | 前端直连 Supabase → cookie 延迟 → 中间件踢回 | 改用服务端 API（§2.2） |
| Google 登录不跳转 | `createClient()` 没加 `true` → PKCE cookie 丢失 | §2.2 铁律 2 |
| 登录页按钮没反应 | `<a>` 包 `<button>` 非法嵌套 → 浏览器不认 | 纯 `<a>` 标签 + CSS 样式 |
| 中间件拖慢所有页面 | 无条件 `getUser()` → 每页白等 200ms Supabase API | 只在 dashboard/login 调 §2.3 |
| 名字改了不生效 | Dashboard 读 `user_metadata`，Settings 改的是 `profiles` | 统一从 `profiles` 表读 |
| Mark complete 没效果 | PATCH API 的 `fields` 白名单没包含 `status` | 加 `status` 到允许字段 |
| email rate limit exceeded | Supabase 限流 | 等 5 分钟，或用 Admin API 创建用户 |
| 页面打开慢 (2s+ TTFB) | Vercel 免费版部署在美国东部 | 升级 Pro 选亚洲节点 |

---

## 8. 决策日志

| 日期 | 决策 | 讨论过的替代方案 |
|------|------|----------------|
| 2026-07 | 免卡试用 14 天 | 注册就绑卡（被你否决：转化率杀手） |
| 2026-07 | Freemium + Soft Paywall | 纯 14 天硬截止（用户体验差） |
| 2026-07 | Supabase Auth 而非 Auth0/Clerk | Auth0 太贵，Clerk 绑定太深 |
| 2026-07 | Stripe Checkout 而非自建支付 | 自建要 PCI 合规，不值得 |
| 2026-07 | Gmail API 而非自建邮件 | 自建邮件要维护 IP 信誉，Gmail 直接集成 |
| 2026-07 | 客户端联系用 4 个 TEXT 列而非 JSONB | JSONB 难筛选，TEXT 简单直接 |
| 2026-07 | Apple 弹簧动效 | 线性动效太僵硬，弹跳过猛不专业 |
| 2026-07 | `profiles.full_name` 作为名字来源 | 只读 `user_metadata` 导致修改不生效 |
