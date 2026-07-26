-- 提案模板
CREATE TABLE IF NOT EXISTS public.link_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  proposal_amount INTEGER,
  proposal_description TEXT,
  contract_template TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.link_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own templates" ON public.link_templates FOR ALL USING (auth.uid() = user_id);
