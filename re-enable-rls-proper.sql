-- =====================================================
-- RE-ENABLE RLS WITH PROPER POLICIES
-- Simple, non-recursive policies for security
-- =====================================================

-- Step 1: Re-enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- Step 2: Create SIMPLE, NON-RECURSIVE policies for users table
-- Users can read their own profile (direct comparison, no joins)
CREATE POLICY "Users can read own profile"
ON public.users FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "Users can create profile"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Step 3: Create SIMPLE policies for content tables (read-only for authenticated users)
CREATE POLICY "Authenticated users can read topics"
ON public.topics FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can read subtopics"
ON public.subtopics FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can read kpis"
ON public.kpis FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can read questions"
ON public.questions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can read sample_answers"
ON public.sample_answers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can read training_examples"
ON public.training_examples FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can read company_codes"
ON public.company_codes FOR SELECT
TO authenticated
USING (true);

-- Step 4: Create policies for user-specific data tables
CREATE POLICY "Users can read own attempts"
ON public.attempts FOR SELECT
TO authenticated
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own attempts"
ON public.attempts FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own attempts"
ON public.attempts FOR UPDATE
TO authenticated
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can read own attempt_items"
ON public.attempt_items FOR SELECT
TO authenticated
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own attempt_items"
ON public.attempt_items FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own attempt_items"
ON public.attempt_items FOR UPDATE
TO authenticated
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can read own exam_results"
ON public.exam_results FOR SELECT
TO authenticated
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own exam_results"
ON public.exam_results FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid()::text);

-- Step 5: Verification
SELECT 'RLS re-enabled with proper, simple policies!' AS status;
SELECT 'Security is maintained without infinite recursion.' AS security_note;
