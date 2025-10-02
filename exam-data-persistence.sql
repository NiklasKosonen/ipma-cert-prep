-- =====================================================
-- EXAM DATA PERSISTENCE SYSTEM
-- Creates tables and RLS policies for exam tracking
-- =====================================================

-- Step 1: Create exam_results table if it doesn't exist
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

-- Step 2: Create attempt_items table if it doesn't exist
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

-- Step 3: Create attempts table if it doesn't exist
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

-- Step 4: Enable RLS on all tables
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for exam_results
DROP POLICY IF EXISTS "Users can read own exam_results" ON public.exam_results;
DROP POLICY IF EXISTS "Users can create own exam_results" ON public.exam_results;
DROP POLICY IF EXISTS "Trainers can read company exam_results" ON public.exam_results;
DROP POLICY IF EXISTS "Admins can read all exam_results" ON public.exam_results;

CREATE POLICY "Users can read own exam_results"
ON public.exam_results FOR SELECT
TO authenticated
USING (user_id = (auth.uid())::text);

CREATE POLICY "Users can create own exam_results"
ON public.exam_results FOR INSERT
TO authenticated
WITH CHECK (user_id = (auth.uid())::text);

CREATE POLICY "Trainers can read company exam_results"
ON public.exam_results FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'trainer'
    AND users.company_code = (
      SELECT company_code FROM public.users 
      WHERE users.id::text = exam_results.user_id
    )
  )
);

CREATE POLICY "Admins can read all exam_results"
ON public.exam_results FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Step 6: Create RLS policies for attempt_items
DROP POLICY IF EXISTS "Users can read own attempt_items" ON public.attempt_items;
DROP POLICY IF EXISTS "Users can create own attempt_items" ON public.attempt_items;
DROP POLICY IF EXISTS "Users can update own attempt_items" ON public.attempt_items;
DROP POLICY IF EXISTS "Trainers can read company attempt_items" ON public.attempt_items;
DROP POLICY IF EXISTS "Admins can read all attempt_items" ON public.attempt_items;

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

CREATE POLICY "Trainers can read company attempt_items"
ON public.attempt_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'trainer'
    AND users.company_code = (
      SELECT company_code FROM public.users 
      WHERE users.id::text = attempt_items.user_id
    )
  )
);

CREATE POLICY "Admins can read all attempt_items"
ON public.attempt_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Step 7: Create RLS policies for attempts
DROP POLICY IF EXISTS "Users can read own attempts" ON public.attempts;
DROP POLICY IF EXISTS "Users can create own attempts" ON public.attempts;
DROP POLICY IF EXISTS "Users can update own attempts" ON public.attempts;
DROP POLICY IF EXISTS "Trainers can read company attempts" ON public.attempts;
DROP POLICY IF EXISTS "Admins can read all attempts" ON public.attempts;

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

CREATE POLICY "Trainers can read company attempts"
ON public.attempts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'trainer'
    AND users.company_code = (
      SELECT company_code FROM public.users 
      WHERE users.id::text = attempts.user_id
    )
  )
);

CREATE POLICY "Admins can read all attempts"
ON public.attempts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Step 8: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exam_results_user_id ON public.exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_attempt_id ON public.exam_results(attempt_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_submitted_at ON public.exam_results(submitted_at);

CREATE INDEX IF NOT EXISTS idx_attempt_items_user_id ON public.attempt_items(user_id);
CREATE INDEX IF NOT EXISTS idx_attempt_items_attempt_id ON public.attempt_items(attempt_id);
CREATE INDEX IF NOT EXISTS idx_attempt_items_question_id ON public.attempt_items(question_id);

CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON public.attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_topic_id ON public.attempts(topic_id);
CREATE INDEX IF NOT EXISTS idx_attempts_status ON public.attempts(status);

-- Step 9: Verification
SELECT 'Exam data persistence system created successfully!' AS status;
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('exam_results', 'attempt_items', 'attempts')
ORDER BY table_name, ordinal_position;
