-- Fix attempts table schema to match application expectations
-- Add missing columns to existing attempts table

-- Check current table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'attempts'
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add selected_question_ids column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'attempts' 
    AND column_name = 'selected_question_ids'
  ) THEN
    ALTER TABLE public.attempts ADD COLUMN selected_question_ids JSONB;
  END IF;

  -- Add score column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'attempts' 
    AND column_name = 'score'
  ) THEN
    ALTER TABLE public.attempts ADD COLUMN score INTEGER DEFAULT 0;
  END IF;

  -- Add passed column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'attempts' 
    AND column_name = 'passed'
  ) THEN
    ALTER TABLE public.attempts ADD COLUMN passed BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add submitted_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'attempts' 
    AND column_name = 'submitted_at'
  ) THEN
    ALTER TABLE public.attempts ADD COLUMN submitted_at TIMESTAMPTZ;
  END IF;

  -- Add end_time column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'attempts' 
    AND column_name = 'end_time'
  ) THEN
    ALTER TABLE public.attempts ADD COLUMN end_time TIMESTAMPTZ;
  END IF;

END $$;

-- Verify the updated table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'attempts'
ORDER BY ordinal_position;

-- Check if attempt_items table exists and has correct structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'attempt_items'
ORDER BY ordinal_position;
