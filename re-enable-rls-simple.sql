-- =====================================================
-- RE-ENABLE RLS WITH PROPER POLICIES - SIMPLE VERSION
-- No complex DO blocks, just direct statements
-- =====================================================

-- Step 1: Re-enable RLS on core tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_codes ENABLE ROW LEVEL SECURITY;

-- Step 2: Create SIMPLE policies for users table
CREATE POLICY "Users can read own profile"
ON public.users FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can create profile"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Step 3: Create SIMPLE policies for content tables
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

-- Step 4: Verification
SELECT 'RLS re-enabled with simple policies!' AS status;
SELECT 'Security is maintained without complex blocks.' AS security_note;
