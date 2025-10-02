-- =====================================================
-- EXAM DATA PERSISTENCE SYSTEM - NO RLS VERSION
-- Create tables first, add RLS later if needed
-- =====================================================

-- Step 1: Create tables WITHOUT RLS policies
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

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_exam_results_user_id ON public.exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_attempt_id ON public.exam_results(attempt_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_submitted_at ON public.exam_results(submitted_at);

CREATE INDEX IF NOT EXISTS idx_attempt_items_user_id ON public.attempt_items(user_id);
CREATE INDEX IF NOT EXISTS idx_attempt_items_attempt_id ON public.attempt_items(attempt_id);
CREATE INDEX IF NOT EXISTS idx_attempt_items_question_id ON public.attempt_items(question_id);

CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON public.attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_topic_id ON public.attempts(topic_id);
CREATE INDEX IF NOT EXISTS idx_attempts_status ON public.attempts(status);

-- Step 3: Verification
SELECT 'Exam data persistence tables created successfully!' AS status;
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('exam_results', 'attempt_items', 'attempts')
ORDER BY table_name, ordinal_position;
