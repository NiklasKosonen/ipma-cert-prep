-- ============================================================
-- STEP 1: CREATE ENGLISH DATABASE TABLES
-- ============================================================
-- Run this entire script in Supabase SQL Editor
-- Execution time: ~30 seconds
-- ============================================================

-- 1. Create English Topics Table
CREATE TABLE IF NOT EXISTS public.topics_en (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create English Subtopics Table
CREATE TABLE IF NOT EXISTS public.subtopics_en (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  topic_id TEXT NOT NULL REFERENCES public.topics_en(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create English KPIs Table
CREATE TABLE IF NOT EXISTS public.kpis_en (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_essential BOOLEAN DEFAULT true,
  topic_id TEXT NOT NULL REFERENCES public.topics_en(id) ON DELETE CASCADE,
  subtopic_id TEXT NOT NULL REFERENCES public.subtopics_en(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create English Questions Table
CREATE TABLE IF NOT EXISTS public.questions_en (
  id TEXT PRIMARY KEY,
  prompt TEXT NOT NULL,
  topic_id TEXT NOT NULL REFERENCES public.topics_en(id) ON DELETE CASCADE,
  subtopic_id TEXT NOT NULL REFERENCES public.subtopics_en(id) ON DELETE CASCADE,
  connectedkpis JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable RLS on all English tables
ALTER TABLE public.topics_en ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtopics_en ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis_en ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions_en ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for Topics_EN
DROP POLICY IF EXISTS "Allow all users to read topics_en" ON public.topics_en;
CREATE POLICY "Allow all users to read topics_en" ON public.topics_en
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admins to manage topics_en" ON public.topics_en;
CREATE POLICY "Allow admins to manage topics_en" ON public.topics_en
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'trainer')
    )
  );

-- 7. Create RLS Policies for Subtopics_EN
DROP POLICY IF EXISTS "Allow all users to read subtopics_en" ON public.subtopics_en;
CREATE POLICY "Allow all users to read subtopics_en" ON public.subtopics_en
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admins to manage subtopics_en" ON public.subtopics_en;
CREATE POLICY "Allow admins to manage subtopics_en" ON public.subtopics_en
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'trainer')
    )
  );

-- 8. Create RLS Policies for KPIs_EN
DROP POLICY IF EXISTS "Allow all users to read kpis_en" ON public.kpis_en;
CREATE POLICY "Allow all users to read kpis_en" ON public.kpis_en
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admins to manage kpis_en" ON public.kpis_en;
CREATE POLICY "Allow admins to manage kpis_en" ON public.kpis_en
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'trainer')
    )
  );

-- 9. Create RLS Policies for Questions_EN
DROP POLICY IF EXISTS "Allow all users to read questions_en" ON public.questions_en;
CREATE POLICY "Allow all users to read questions_en" ON public.questions_en
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admins to manage questions_en" ON public.questions_en;
CREATE POLICY "Allow admins to manage questions_en" ON public.questions_en
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'trainer')
    )
  );

-- ============================================================
-- VERIFICATION: Check that all tables were created
-- ============================================================
SELECT 
  'Tables Created' as status,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('topics_en', 'subtopics_en', 'kpis_en', 'questions_en');

-- Expected result: table_count = 4
-- ============================================================
-- ✅ STEP 1 COMPLETE - Proceed to STEP 2
-- ============================================================
