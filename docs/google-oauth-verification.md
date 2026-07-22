# Google OAuth 验证流程

## 0. 前置知识

### OAuth 同意屏幕是什么
当用户用 Google/GitHub/微信等第三方账号登录你的 App 时，弹出来请求授权的那个页面。

### 它告诉用户三件事
- **谁**在请求数据（你的 App 名称、Logo）
- **要什么**权限（读邮件？看联系人？）
- **同不同意**— 用户自己决定

### 为什么必须配置
- 不配 → 用户看到「未经验证的应用」红色警告，不敢点
- 配了但没提交审核 → 最多 100 个用户，每个人都会看到警告
- 提交审核通过 → 无限用户，无警告

---

## 第一步：配置品牌信息

**入口**：Google Cloud Console → 左侧菜单 **Branding**

| 字段 | 值 |
|------|-----|
| App name | 你的应用名 |
| User support email | 用户能联系到你的邮箱 |
| App logo | 上传 logo（建议 120x120 PNG） |
| App home page | `https://你的域名` |
| Privacy policy | `https://你的域名/privacy` |
| Terms of service | `https://你的域名/terms` |
| Authorized domains | 添加你的域名（如 `example.com`） |

---

## 第二步：配置 Scopes（权限）

**入口**：Google Cloud Console → 左侧菜单 **Data Access**（旧版叫 OAuth consent screen）

### 1. 搞清楚你要哪些权限
只申请最少、最窄的权限。权限越少，审核越快，用户越敢点。

| 类型 | 审核难度 | 举例 |
|------|---------|------|
| 非敏感 (Non-Sensitive) | 不需要审核 | `openid`, `profile`, `email` |
| 敏感 (Sensitive) | 需要审核，1-2 周 | `gmail.readonly`, `calendar.events` |
| 受限 (Restricted) | 最严，可能要求安全审计 | `gmail.send`, `drive` |

### 2. 添加 Scopes
- 点 **Add or remove scopes**
- 搜索你需要的权限，勾选
- 如果列表里找不到，滑到底部 **Manually add scopes** 手动粘贴 Scope URL → Add to table
- 点 **Update** 保存

### 3. 为每个敏感/受限 Scope 填写使用理由
保存后每个敏感 scope 下方会出现 **Justification** 填写框。

怎么写：**实话实说，三个要点**
1. 你的 App 用这个权限做什么
2. 什么情况下才会触发（用户主动操作还是后台自动）
3. 你的 App 不会做什么

**示例**：
```
We use gmail.readonly to scan incoming photography inquiries and display them in the CRM dashboard. The AI then drafts a reply for the photographer's review. We never read emails outside of photography-related inquiries, and never without the user being logged in.
```

---

## 第三步：准备视频 Demo

必需要求：一个 YouTube 视频，展示：
1. 用户如何登录 OAuth（从你的 App 跳 Google 授权页 → 点允许）
2. 授权后你的 App 如何使用这些 Scopes（实际操作演示）

要求：
- YouTube 链接，可以设 **Unlisted（不公开）**
- 2-3 分钟即可
- 不需要配音，加字幕更好

---

## 第四步：补充信息

### Verification Questionnaire
答案通常全部 **No** + 最后一条 **Acknowledge** 勾上。除非你的 App 真的只是个人使用/内网使用/WordPress 插件。

### Additional Info（测试账号）
```
Test account:
- URL: https://你的域名
- Email: test@example.com
- Password: xxxxxxxx
Hint: 提供测试账号可以大幅加快审核速度
```

---

## 第五步：提交审核

### 操作顺序
1. **Branding** → 确认所有字段已填 → Save
2. **Data Access** → 确认 Scopes 已添加 → 每个敏感 scope 的 Justification 已填 → Save
3. **Verification Center** → 页面会汇总你的一切
4. 确认三个绿灯：Branding ✅、Scopes ✅、Demo Video ✅
5. 点 **Submit for Verification**

### 审核时间
- 敏感 Scopes：3-7 个工作日
- 受限 Scopes：2-4 周（可能要求安全审计 CASA）

### 审核通过后
Google 会发邮件到你填的 Developer Contact Email。审核通过后无用户上限，无警告页面。

---

## 常见坑

| 问题 | 解决方法 |
|------|---------|
| 找不到 Submit for verification 按钮 | 必须先 Publish App，再 Prepare for Verification |
| 提示「branding needs to be verified」 | Branding 页面里所有字段都必须填完保存 |
| 提示「scope justification missing」 | 回到 Data Access 页面，每个敏感 scope 下面都填使用理由 |
| 提示「domain not verified」 | 去 Google Search Console 验证你的域名 |
| 审核被退回 | 看邮件里 Google 的要求，一般是视频没展示完整流程或隐私政策不够清晰 |
| Publishing status 找不到改 Production | 在 OAuth consent screen 页面顶部 |

---

## 测试 vs 生产

| 状态 | 谁能用 | 有没有警告 | 审核 |
|------|--------|-----------|------|
| Testing | 只有手动添加的 Test users | 无 | 不需要 |
| Production（未审核） | 最多 100 人 | 有警告，用户可点跳过 | 不需要 |
| Production（已审核） | 无限 | 无 | 需要提交并等审核通过 |

开发期间用 Testing + 添加测试用户。准备上线时切 Production，审核期间 100 人配额够早期用户用。
