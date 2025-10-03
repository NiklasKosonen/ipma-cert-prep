-- Fix exam schema issues

-- 1. Add missing endTime column to attempts table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'attempts' 
    AND column_name = 'end_time'
  ) THEN
    ALTER TABLE public.attempts ADD COLUMN end_time TIMESTAMPTZ;
  END IF;
END $$;

-- 2. Check if question_id in attempt_items is UUID or TEXT
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'attempt_items'
  AND column_name = 'question_id';

-- 3. If question_id is UUID but app sends TEXT, we need to either:
--    a) Change column to TEXT, or
--    b) Change app to generate UUIDs for questions

-- For now, let's change question_id to TEXT to match app
ALTER TABLE public.attempt_items ALTER COLUMN question_id TYPE TEXT;

-- 4. Also check topic_id in attempts table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'attempts'
  AND column_name = 'topic_id';

-- Change topic_id to TEXT if it's UUID
ALTER TABLE public.attempts ALTER COLUMN topic_id TYPE TEXT;

-- 5. Verify the changes
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('attempts', 'attempt_items')
  AND column_name IN ('topic_id', 'question_id', 'end_time')
ORDER BY table_name, column_name;
