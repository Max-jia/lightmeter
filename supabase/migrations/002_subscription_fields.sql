-- ============================================================
-- Lightmeter — Subscription fields for profiles
-- 在 Supabase SQL Editor 中运行此文件
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none'
    CHECK (subscription_status IN ('none', 'trialing', 'active', 'past_due', 'canceled', 'unpaid'));

-- 如果之前已经创建了这些字段但默认值是 'trialing'，修正它
ALTER TABLE public.profiles ALTER COLUMN subscription_status SET DEFAULT 'none';

-- 把已有用户的 NULL 值补成 'none'
UPDATE public.profiles SET subscription_status = 'none' WHERE subscription_status IS NULL;
