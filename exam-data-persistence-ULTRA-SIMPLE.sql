-- =====================================================
-- EXAM DATA PERSISTENCE SYSTEM - ULTRA SIMPLE VERSION
-- =====================================================

-- Step 1: Create tables
CREATE TABLE IF NOT EXISTS public.exam_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  attempt_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  total_kpis INTEGER NOT NULL,
  kpis_detected INTEGER NOT NULL,
  kpis_missing INTEGER NOT NULL,
  total_score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  kpi_percentage DECIMAL(5,2) NOT NULL,
  score_percentage DECIMAL(5,2) NOT NULL,
  passed BOOLEAN NOT NULL,
  feedback TEXT,
  exam_duration_minutes INTEGER,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.attempt_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  attempt_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  answer TEXT NOT NULL,
  kpis_detected TEXT[] DEFAULT '{}',
  kpis_missing TEXT[] DEFAULT '{}',
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 3,
  feedback TEXT,
  is_evaluated BOOLEAN DEFAULT FALSE,
  evaluation_json JSONB,
  duration_sec INTEGER DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  selected_question_ids TEXT[] NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'in_progress',
  total_time INTEGER NOT NULL,
  time_remaining INTEGER NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable RLS
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop ALL existing policies first
DROP POLICY IF EXISTS "Users can read own exam_results" ON public.exam_results;
DROP POLICY IF EXISTS "Users can create own exam_results" ON public.exam_results;
DROP POLICY IF EXISTS "Users can read own attempt_items" ON public.attempt_items;
DROP POLICY IF EXISTS "Users can create own attempt_items" ON public.attempt_items;
DROP POLICY IF EXISTS "Users can update own attempt_items" ON public.attempt_items;
DROP POLICY IF EXISTS "Users can read own attempts" ON public.attempts;
DROP POLICY IF EXISTS "Users can create own attempts" ON public.attempts;
DROP POLICY IF EXISTS "Users can update own attempts" ON public.attempts;

-- Step 4: Create VERY SIMPLE policies (no complex joins)
CREATE POLICY "Users can read own exam_results"
ON public.exam_results FOR SELECT
TO authenticated
USING (user_id = (auth.uid())::text);

CREATE POLICY "Users can create own exam_results"
ON public.exam_results FOR INSERT
TO authenticated
WITH CHECK (user_id = (auth.uid())::text);

CREATE POLICY "Users can read own attempt_items"
ON public.attempt_items FOR SELECT
TO authenticated
USING (user_id = (auth.uid())::text);

CREATE POLICY "Users can create own attempt_items"
ON public.attempt_items FOR INSERT
TO authenticated
WITH CHECK (user_id = (auth.uid())::text);

CREATE POLICY "Users can update own attempt_items"
ON public.attempt_items FOR UPDATE
TO authenticated
USING (user_id = (auth.uid())::text);

CREATE POLICY "Users can read own attempts"
ON public.attempts FOR SELECT
TO authenticated
USING (user_id = (auth.uid())::text);

CREATE POLICY "Users can create own attempts"
ON public.attempts FOR INSERT
TO authenticated
WITH CHECK (user_id = (auth.uid())::text);

CREATE POLICY "Users can update own attempts"
ON public.attempts FOR UPDATE
TO authenticated
USING (user_id = (auth.uid())::text);

-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS idx_exam_results_user_id ON public.exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_attempt_id ON public.exam_results(attempt_id);
CREATE INDEX IF NOT EXISTS idx_attempt_items_user_id ON public.attempt_items(user_id);
CREATE INDEX IF NOT EXISTS idx_attempt_items_attempt_id ON public.attempt_items(attempt_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON public.attempts(user_id);

-- Step 6: Verification
SELECT 'Exam data persistence system created successfully!' AS status;
