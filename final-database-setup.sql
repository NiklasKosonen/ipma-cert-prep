-- =====================================================
-- FINAL DATABASE SETUP - IPMA CERTIFICATION PLATFORM
-- Run this script in Supabase SQL Editor
-- =====================================================

-- Step 1: Add authorized_emails column to company_codes table
ALTER TABLE public.company_codes 
ADD COLUMN IF NOT EXISTS authorized_emails TEXT[] DEFAULT '{}';

-- Step 2: Update existing company codes to have empty authorized_emails array
UPDATE public.company_codes 
SET authorized_emails = '{}' 
WHERE authorized_emails IS NULL;

-- Step 3: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_company_codes_authorized_emails 
ON public.company_codes USING GIN (authorized_emails);

-- Step 4: Create admin user if not exists
INSERT INTO public.users (
  id,
  email,
  name,
  role,
  company_code,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'niklas.kosonen@talentnetwork.fi',
  'Niklas Kosonen',
  'admin',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET 
  role = 'admin',
  name = 'Niklas Kosonen',
  updated_at = NOW();

-- Step 5: Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_codes ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can create profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can read topics" ON public.topics;
DROP POLICY IF EXISTS "Authenticated users can read subtopics" ON public.subtopics;
DROP POLICY IF EXISTS "Authenticated users can read kpis" ON public.kpis;
DROP POLICY IF EXISTS "Authenticated users can read questions" ON public.questions;
DROP POLICY IF EXISTS "Authenticated users can read sample_answers" ON public.sample_answers;
DROP POLICY IF EXISTS "Authenticated users can read training_examples" ON public.training_examples;
DROP POLICY IF EXISTS "Authenticated users can read company_codes" ON public.company_codes;

-- Step 7: Create simple, non-recursive policies
-- Users table policies
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

-- Content tables policies (read-only for authenticated users)
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

-- Step 8: Add INSERT/UPDATE/DELETE policies for content management
CREATE POLICY "Authenticated users can insert topics"
ON public.topics FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update topics"
ON public.topics FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete topics"
ON public.topics FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert subtopics"
ON public.subtopics FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update subtopics"
ON public.subtopics FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete subtopics"
ON public.subtopics FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert kpis"
ON public.kpis FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update kpis"
ON public.kpis FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete kpis"
ON public.kpis FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert questions"
ON public.questions FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update questions"
ON public.questions FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete questions"
ON public.questions FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert sample_answers"
ON public.sample_answers FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update sample_answers"
ON public.sample_answers FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sample_answers"
ON public.sample_answers FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert training_examples"
ON public.training_examples FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update training_examples"
ON public.training_examples FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete training_examples"
ON public.training_examples FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert company_codes"
ON public.company_codes FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update company_codes"
ON public.company_codes FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete company_codes"
ON public.company_codes FOR DELETE
TO authenticated
USING (true);

-- Step 9: Verification
SELECT 'Database setup completed successfully!' AS status;
SELECT 'Admin user created/updated: niklas.kosonen@talentnetwork.fi' AS admin_note;
SELECT 'Authorized emails column added to company_codes table' AS feature_note;
SELECT 'RLS policies enabled with proper security' AS security_note;
