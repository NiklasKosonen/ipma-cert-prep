-- =====================================================
-- ADD MISSING INSERT/UPDATE POLICIES
-- Add policies for subtopics, questions, kpis, company_codes, sample_answers
-- =====================================================

-- Step 1: Add INSERT policies for content tables
CREATE POLICY "Authenticated users can insert subtopics"
ON public.subtopics FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can insert questions"
ON public.questions FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can insert kpis"
ON public.kpis FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can insert company_codes"
ON public.company_codes FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can insert sample_answers"
ON public.sample_answers FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can insert training_examples"
ON public.training_examples FOR INSERT
TO authenticated
WITH CHECK (true);

-- Step 2: Add UPDATE policies for content tables
CREATE POLICY "Authenticated users can update subtopics"
ON public.subtopics FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can update questions"
ON public.questions FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can update kpis"
ON public.kpis FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can update company_codes"
ON public.company_codes FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can update sample_answers"
ON public.sample_answers FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can update training_examples"
ON public.training_examples FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Step 3: Add DELETE policies for content tables
CREATE POLICY "Authenticated users can delete subtopics"
ON public.subtopics FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete questions"
ON public.questions FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete kpis"
ON public.kpis FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete company_codes"
ON public.company_codes FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete sample_answers"
ON public.sample_answers FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete training_examples"
ON public.training_examples FOR DELETE
TO authenticated
USING (true);

-- Step 4: Verification
SELECT 'INSERT/UPDATE/DELETE policies added for all content tables!' AS status;
SELECT 'All authenticated users can now create, update, and delete content.' AS note;
