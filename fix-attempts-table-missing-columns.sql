-- Fix attempts table to add missing columns that the application expects
-- The table has 'started_at' but the app expects 'start_time'

-- Add missing columns that the application expects
DO $$ 
BEGIN
  -- Add start_time column if it doesn't exist (app expects this, table has started_at)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'attempts' 
    AND column_name = 'start_time'
  ) THEN
    ALTER TABLE public.attempts ADD COLUMN start_time TIMESTAMPTZ;
  END IF;

  -- Add topic_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'attempts' 
    AND column_name = 'topic_id'
  ) THEN
    ALTER TABLE public.attempts ADD COLUMN topic_id TEXT;
  END IF;

  -- Add created_at column if it doesn't exist (app expects this format)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'attempts' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.attempts ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add updated_at column if it doesn't exist (app expects this format)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'attempts' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.attempts ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
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
