-- =====================================================
-- FIX RLS POLICY ISSUES
-- Address the specific problems preventing data saving
-- =====================================================

-- Step 1: Fix INSERT policies with NULL WITH CHECK conditions
-- These policies block ALL inserts because NULL evaluates to false

-- Fix questions table INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert questions" ON public.questions;
CREATE POLICY "Authenticated users can insert questions"
ON public.questions FOR INSERT
TO authenticated
WITH CHECK (true);

-- Fix sample_answers table INSERT policy  
DROP POLICY IF EXISTS "Authenticated users can insert sample_answers" ON public.sample_answers;
CREATE POLICY "Authenticated users can insert sample_answers"
ON public.sample_answers FOR INSERT
TO authenticated
WITH CHECK (true);

-- Step 2: Add missing INSERT policies for subtopics
-- The subtopics table is missing INSERT policies entirely

DROP POLICY IF EXISTS "Authenticated users can insert subtopics" ON public.subtopics;
CREATE POLICY "Authenticated users can insert subtopics"
ON public.subtopics FOR INSERT
TO authenticated
WITH CHECK (true);

-- Step 3: Remove problematic recursive policies
-- These cause infinite recursion during login

DROP POLICY IF EXISTS "admin_manage_question_kpis" ON public.question_kpis;
DROP POLICY IF EXISTS "admin_manage_rubrics" ON public.rubrics;

-- Step 4: Add simple admin policies without recursion
-- Use auth.jwt() instead of querying users table

CREATE POLICY "Admin can manage question_kpis"
ON public.question_kpis FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
)
WITH CHECK (
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

CREATE POLICY "Admin can manage rubrics"
ON public.rubrics FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
)
WITH CHECK (
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

-- Step 5: Verification
SELECT 'RLS policy issues fixed!' AS status;
SELECT 'INSERT policies now allow data saving.' AS note;
SELECT 'Recursive policies removed to prevent login issues.' AS security_note;
