-- ============================================================
-- Lightmeter — 客户联系方式扩展
-- 在 Supabase SQL Editor 中运行
-- ============================================================

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS instagram TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT;
