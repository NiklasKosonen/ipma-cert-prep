-- ============================================================
-- CREATE AI EVALUATION CRITERIA TABLE
-- ============================================================
-- This script creates a table to store AI evaluation tips and criteria
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create AI Evaluation Criteria Table
CREATE TABLE IF NOT EXISTS public.ai_evaluation_criteria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tip_text TEXT NOT NULL,
  language VARCHAR(2) NOT NULL DEFAULT 'fi' CHECK (language IN ('fi', 'en')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- 2. Enable RLS
ALTER TABLE public.ai_evaluation_criteria ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Allow all users to read AI evaluation criteria
DROP POLICY IF EXISTS "Allow all users to read ai_evaluation_criteria" ON public.ai_evaluation_criteria;
CREATE POLICY "Allow all users to read ai_evaluation_criteria" ON public.ai_evaluation_criteria
  FOR SELECT USING (true);

-- Allow admins and trainers to manage AI evaluation criteria
DROP POLICY IF EXISTS "Allow admins to manage ai_evaluation_criteria" ON public.ai_evaluation_criteria;
CREATE POLICY "Allow admins to manage ai_evaluation_criteria" ON public.ai_evaluation_criteria
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'trainer')
    )
  );

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_evaluation_criteria_language ON public.ai_evaluation_criteria(language);
CREATE INDEX IF NOT EXISTS idx_ai_evaluation_criteria_active ON public.ai_evaluation_criteria(is_active);

-- 5. Insert default Finnish evaluation tips
INSERT INTO public.ai_evaluation_criteria (tip_text, language) VALUES
  ('KPI:t eivät tarvitse olla kirjoitettu sanatarkasti - AI ymmärtää niiden olemassaolon vastauksen kontekstista', 'fi'),
  ('Synonyymit ja liittyvät käsitteet lasketaan KPI:ksi jos ne liittyvät aiheeseen', 'fi'),
  ('Implisiittiset viittaukset ovat yhtä arvokkaita kuin suorat maininnat', 'fi'),
  ('Vastauksen laadun arviointi perustuu kokonaisuuteen, ei vain KPI-määrään', 'fi'),
  ('Ymmärryksen taso näkyy vastauksen syvyydessä ja perustelujen laadussa', 'fi')
ON CONFLICT DO NOTHING;

-- 6. Insert default English evaluation tips
INSERT INTO public.ai_evaluation_criteria (tip_text, language) VALUES
  ('KPIs do not need to be written verbatim - AI understands their existence from the context of the answer', 'en'),
  ('Synonyms and related concepts are counted as KPIs if they relate to the topic', 'en'),
  ('Implicit references are as valuable as direct mentions', 'en'),
  ('Answer quality evaluation is based on the overall context, not just the number of KPIs', 'en'),
  ('Level of understanding is reflected in the depth of the answer and the quality of justifications', 'en')
ON CONFLICT DO NOTHING;

-- ============================================================
-- VERIFICATION: Check that table was created and populated
-- ============================================================
SELECT 
  'AI Evaluation Criteria' as table_name,
  COUNT(*) as total_tips,
  COUNT(*) FILTER (WHERE language = 'fi') as finnish_tips,
  COUNT(*) FILTER (WHERE language = 'en') as english_tips
FROM public.ai_evaluation_criteria;

-- ============================================================
-- ✅ AI EVALUATION CRITERIA TABLE CREATED
-- ============================================================
