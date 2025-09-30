-- =====================================================
-- COMPLETE FIX - Run this ONE script in Supabase
-- This checks your schema and fixes everything
-- =====================================================

-- Step 1: Add missing user_id columns if they don't exist
DO $$ 
BEGIN
    -- Add user_id to attempts table if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attempts' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.attempts ADD COLUMN user_id TEXT;
        RAISE NOTICE 'Added user_id column to attempts table';
    END IF;

    -- Add user_id to exam_results table if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exam_results' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.exam_results ADD COLUMN user_id TEXT;
        RAISE NOTICE 'Added user_id column to exam_results table';
    END IF;
END $$;

-- Step 2: Drop all existing exam_results policies
DROP POLICY IF EXISTS "Users can read own exam_results" ON public.exam_results;
DROP POLICY IF EXISTS "Users can create own exam_results" ON public.exam_results;
DROP POLICY IF EXISTS "Users can update own exam_results" ON public.exam_results;
DROP POLICY IF EXISTS "Trainers can read all exam_results" ON public.exam_results;
DROP POLICY IF EXISTS "Trainers can read company exam_results" ON public.exam_results;
DROP POLICY IF EXISTS "Admins and trainers can read all exam_results" ON public.exam_results;

-- Step 3: Enable RLS
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- Step 4: Create clean policies with proper casting
CREATE POLICY "Users can read own exam_results"
ON public.exam_results FOR SELECT
TO authenticated
USING (user_id = (auth.uid())::text);

CREATE POLICY "Users can create own exam_results"
ON public.exam_results FOR INSERT
TO authenticated
WITH CHECK (user_id = (auth.uid())::text);

CREATE POLICY "Users can update own exam_results"
ON public.exam_results FOR UPDATE
TO authenticated
USING (user_id = (auth.uid())::text);

CREATE POLICY "Admins and trainers can read all exam_results"
ON public.exam_results FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role IN ('trainer', 'admin')
  )
);

-- Step 5: Verification
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('attempts', 'exam_results')
    AND column_name = 'user_id';

SELECT 'RLS policies created successfully!' AS status;

