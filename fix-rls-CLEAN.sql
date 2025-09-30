-- =====================================================
-- RLS FIX FOR EXAM_RESULTS TABLE ONLY
-- Run this AFTER schema-updates-for-rls.sql
-- =====================================================

-- Drop all existing exam_results policies
DROP POLICY IF EXISTS "Users can read own exam_results" ON public.exam_results;
DROP POLICY IF EXISTS "Users can create own exam_results" ON public.exam_results;
DROP POLICY IF EXISTS "Users can update own exam_results" ON public.exam_results;
DROP POLICY IF EXISTS "Trainers can read all exam_results" ON public.exam_results;
DROP POLICY IF EXISTS "Trainers can read company exam_results" ON public.exam_results;

-- Enable RLS
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- Create clean policies
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

-- Verification
SELECT 'RLS policies for exam_results created successfully!' AS status;

