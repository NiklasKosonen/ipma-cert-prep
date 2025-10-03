-- Create attempts table for exam attempts
CREATE TABLE IF NOT EXISTS public.attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  selected_question_ids JSONB NOT NULL,
  status TEXT CHECK (status IN ('in_progress', 'submitted', 'completed')) DEFAULT 'in_progress',
  start_time TIMESTAMPTZ DEFAULT NOW(),
  total_time INTEGER NOT NULL,
  time_remaining INTEGER NOT NULL,
  score INTEGER DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attempt_items table for individual question answers
CREATE TABLE IF NOT EXISTS public.attempt_items (
  id TEXT PRIMARY KEY,
  attempt_id TEXT NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  answer TEXT DEFAULT '',
  score INTEGER DEFAULT 0,
  feedback TEXT DEFAULT '',
  is_evaluated BOOLEAN DEFAULT FALSE,
  duration_sec INTEGER DEFAULT 0,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON public.attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_topic_id ON public.attempts(topic_id);
CREATE INDEX IF NOT EXISTS idx_attempts_status ON public.attempts(status);
CREATE INDEX IF NOT EXISTS idx_attempt_items_attempt_id ON public.attempt_items(attempt_id);
CREATE INDEX IF NOT EXISTS idx_attempt_items_question_id ON public.attempt_items(question_id);

-- Enable RLS
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attempts
DROP POLICY IF EXISTS "Users can view their own attempts" ON public.attempts;
CREATE POLICY "Users can view their own attempts"
ON public.attempts FOR SELECT
TO authenticated
USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert their own attempts" ON public.attempts;
CREATE POLICY "Users can insert their own attempts"
ON public.attempts FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own attempts" ON public.attempts;
CREATE POLICY "Users can update their own attempts"
ON public.attempts FOR UPDATE
TO authenticated
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their own attempts" ON public.attempts;
CREATE POLICY "Users can delete their own attempts"
ON public.attempts FOR DELETE
TO authenticated
USING (user_id = auth.uid()::text);

-- RLS Policies for attempt_items
DROP POLICY IF EXISTS "Users can view their own attempt items" ON public.attempt_items;
CREATE POLICY "Users can view their own attempt items"
ON public.attempt_items FOR SELECT
TO authenticated
USING (
  attempt_id IN (
    SELECT id FROM public.attempts WHERE user_id = auth.uid()::text
  )
);

DROP POLICY IF EXISTS "Users can insert their own attempt items" ON public.attempt_items;
CREATE POLICY "Users can insert their own attempt items"
ON public.attempt_items FOR INSERT
TO authenticated
WITH CHECK (
  attempt_id IN (
    SELECT id FROM public.attempts WHERE user_id = auth.uid()::text
  )
);

DROP POLICY IF EXISTS "Users can update their own attempt items" ON public.attempt_items;
CREATE POLICY "Users can update their own attempt items"
ON public.attempt_items FOR UPDATE
TO authenticated
USING (
  attempt_id IN (
    SELECT id FROM public.attempts WHERE user_id = auth.uid()::text
  )
)
WITH CHECK (
  attempt_id IN (
    SELECT id FROM public.attempts WHERE user_id = auth.uid()::text
  )
);

DROP POLICY IF EXISTS "Users can delete their own attempt items" ON public.attempt_items;
CREATE POLICY "Users can delete their own attempt items"
ON public.attempt_items FOR DELETE
TO authenticated
USING (
  attempt_id IN (
    SELECT id FROM public.attempts WHERE user_id = auth.uid()::text
  )
);

-- Grant permissions
GRANT ALL ON public.attempts TO authenticated;
GRANT ALL ON public.attempt_items TO authenticated;

-- Verify tables were created
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('attempts', 'attempt_items')
ORDER BY table_name, ordinal_position;
