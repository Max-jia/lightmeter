-- ============================================================
-- Darkroom — Initial Database Schema
-- 在 Supabase SQL Editor 中运行此文件
-- ============================================================

-- ── 1. Profiles (extends auth.users) ──
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  studio_name TEXT DEFAULT 'My Photo Studio',
  plan TEXT DEFAULT 'standard' CHECK (plan IN ('standard', 'pro')),
  trial_ends_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '14 days'),
  reply_tone TEXT DEFAULT 'professional' CHECK (reply_tone IN ('professional', 'friendly', 'minimal')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 2. Gmail Tokens ──
CREATE TABLE IF NOT EXISTS public.gmail_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  gmail_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 3. Clients ──
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  partner_name TEXT,
  event_type TEXT DEFAULT 'other' CHECK (event_type IN ('wedding', 'portrait', 'event', 'engagement', 'other')),
  event_date DATE,
  location TEXT,
  budget TEXT,
  referral_source TEXT,
  status TEXT DEFAULT 'lead' CHECK (status IN ('lead', 'active', 'pending', 'completed', 'archived')),
  contract_status TEXT DEFAULT 'none' CHECK (contract_status IN ('none', 'draft', 'sent', 'signed')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'deposit_paid', 'paid_full', 'refunded')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 4. Emails ──
CREATE TABLE IF NOT EXISTS public.emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  gmail_id TEXT NOT NULL,
  thread_id TEXT,
  from_address TEXT NOT NULL,
  to_address TEXT,
  subject TEXT NOT NULL,
  body_text TEXT,
  snippet TEXT,
  received_at TIMESTAMPTZ,
  -- AI processing
  ai_classification TEXT CHECK (ai_classification IN ('new_inquiry', 'client_reply', 'spam', 'unknown')),
  ai_confidence INTEGER CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
  ai_draft_subject TEXT,
  ai_draft_body TEXT,
  ai_extracted_info JSONB,
  -- Status
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'draft_ready', 'sent', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, gmail_id)
);

CREATE INDEX IF NOT EXISTS idx_emails_user_status ON public.emails(user_id, status);
CREATE INDEX IF NOT EXISTS idx_emails_user_received ON public.emails(user_id, received_at DESC);

-- ── 5. Links (One-Link proposals) ──
CREATE TABLE IF NOT EXISTS public.links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  -- Proposal data
  proposal_title TEXT DEFAULT 'Photography Proposal',
  proposal_amount INTEGER, -- in cents
  proposal_description TEXT,
  proposal_items JSONB DEFAULT '[]', -- [{name, amount, quantity}]
  -- Contract
  contract_template TEXT,
  contract_signed_at TIMESTAMPTZ,
  -- Stripe
  stripe_price_id TEXT,
  stripe_session_id TEXT,
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'signed', 'paid', 'expired')),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_links_user ON public.links(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_links_slug ON public.links(slug);

-- ── 6. Payments ──
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  link_id UUID REFERENCES public.links(id) ON DELETE SET NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  description TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id, created_at DESC);

-- ── 7. Webhook logs (for debugging Stripe/Gmail) ──
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL, -- 'stripe' | 'gmail'
  event_type TEXT,
  payload JSONB,
  received_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmail_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Profiles: 用户只能读写自己的资料
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Gmail Tokens: 用户只能读写自己的 token
CREATE POLICY "Users can read own gmail tokens" ON public.gmail_tokens
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gmail tokens" ON public.gmail_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gmail tokens" ON public.gmail_tokens
  FOR UPDATE USING (auth.uid() = user_id);

-- Clients
CREATE POLICY "Users can CRUD own clients" ON public.clients
  FOR ALL USING (auth.uid() = user_id);

-- Emails
CREATE POLICY "Users can CRUD own emails" ON public.emails
  FOR ALL USING (auth.uid() = user_id);

-- Links
CREATE POLICY "Users can CRUD own links" ON public.links
  FOR ALL USING (auth.uid() = user_id);

-- Payments: 用户可读，服务端写入
CREATE POLICY "Users can read own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can insert payments" ON public.payments
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, plan, trial_ends_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'plan', 'standard'),
    COALESCE(
      (NEW.raw_user_meta_data->>'trial_ends_at')::TIMESTAMPTZ,
      now() + INTERVAL '14 days'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
