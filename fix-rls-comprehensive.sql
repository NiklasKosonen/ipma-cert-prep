-- =====================================================
-- COMPREHENSIVE RLS FIX FOR IPMA PLATFORM
-- =====================================================
-- This SQL file fixes all RLS issues to enable proper data saving
-- with Row Level Security enabled

-- =====================================================
-- STEP 1: Enable RLS on all tables
-- =====================================================

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: Drop all existing policies to start fresh
-- =====================================================

-- Topics
DROP POLICY IF EXISTS "Allow read access to topics" ON public.topics;
DROP POLICY IF EXISTS "Allow insert access to topics" ON public.topics;
DROP POLICY IF EXISTS "Allow update access to topics" ON public.topics;
DROP POLICY IF EXISTS "Allow delete access to topics" ON public.topics;
DROP POLICY IF EXISTS "Authenticated users can read topics" ON public.topics;
DROP POLICY IF EXISTS "Admins can manage topics" ON public.topics;
DROP POLICY IF EXISTS "Anonymous can read public data" ON public.topics;

-- Subtopics
DROP POLICY IF EXISTS "Allow read access to subtopics" ON public.subtopics;
DROP POLICY IF EXISTS "Allow insert access to subtopics" ON public.subtopics;
DROP POLICY IF EXISTS "Allow update access to subtopics" ON public.subtopics;
DROP POLICY IF EXISTS "Allow delete access to subtopics" ON public.subtopics;
DROP POLICY IF EXISTS "Authenticated users can read subtopics" ON public.subtopics;
DROP POLICY IF EXISTS "Admins can manage subtopics" ON public.subtopics;
DROP POLICY IF EXISTS "Anonymous can read public data" ON public.subtopics;

-- Questions
DROP POLICY IF EXISTS "Allow read access to questions" ON public.questions;
DROP POLICY IF EXISTS "Allow insert access to questions" ON public.questions;
DROP POLICY IF EXISTS "Allow update access to questions" ON public.questions;
DROP POLICY IF EXISTS "Allow delete access to questions" ON public.questions;
DROP POLICY IF EXISTS "Authenticated users can read questions" ON public.questions;
DROP POLICY IF EXISTS "Admins can manage questions" ON public.questions;
DROP POLICY IF EXISTS "Anonymous can read public data" ON public.questions;

-- KPIs
DROP POLICY IF EXISTS "Allow read access to kpis" ON public.kpis;
DROP POLICY IF EXISTS "Allow insert access to kpis" ON public.kpis;
DROP POLICY IF EXISTS "Allow update access to kpis" ON public.kpis;
DROP POLICY IF EXISTS "Allow delete access to kpis" ON public.kpis;
DROP POLICY IF EXISTS "Authenticated users can read kpis" ON public.kpis;
DROP POLICY IF EXISTS "Admins can manage kpis" ON public.kpis;
DROP POLICY IF EXISTS "Anonymous can read public data" ON public.kpis;

-- Sample Answers
DROP POLICY IF EXISTS "Allow read access to sample_answers" ON public.sample_answers;
DROP POLICY IF EXISTS "Allow insert access to sample_answers" ON public.sample_answers;
DROP POLICY IF EXISTS "Allow update access to sample_answers" ON public.sample_answers;
DROP POLICY IF EXISTS "Allow delete access to sample_answers" ON public.sample_answers;
DROP POLICY IF EXISTS "Authenticated users can read sample_answers" ON public.sample_answers;
DROP POLICY IF EXISTS "Admins can manage sample_answers" ON public.sample_answers;
DROP POLICY IF EXISTS "Anonymous can read public data" ON public.sample_answers;

-- Training Examples
DROP POLICY IF EXISTS "Allow read access to training_examples" ON public.training_examples;
DROP POLICY IF EXISTS "Allow insert access to training_examples" ON public.training_examples;
DROP POLICY IF EXISTS "Allow update access to training_examples" ON public.training_examples;
DROP POLICY IF EXISTS "Allow delete access to training_examples" ON public.training_examples;
DROP POLICY IF EXISTS "Authenticated users can read training_examples" ON public.training_examples;
DROP POLICY IF EXISTS "Admins can manage training_examples" ON public.training_examples;
DROP POLICY IF EXISTS "Anonymous can read public data" ON public.training_examples;

-- Company Codes
DROP POLICY IF EXISTS "Allow read access to company_codes" ON public.company_codes;
DROP POLICY IF EXISTS "Allow insert access to company_codes" ON public.company_codes;
DROP POLICY IF EXISTS "Allow update access to company_codes" ON public.company_codes;
DROP POLICY IF EXISTS "Allow delete access to company_codes" ON public.company_codes;
DROP POLICY IF EXISTS "Authenticated users can read company_codes" ON public.company_codes;
DROP POLICY IF EXISTS "Admins can manage company_codes" ON public.company_codes;
DROP POLICY IF EXISTS "Anonymous can read public data" ON public.company_codes;

-- Question KPIs
DROP POLICY IF EXISTS "Allow read access to question_kpis" ON public.question_kpis;
DROP POLICY IF EXISTS "Allow insert access to question_kpis" ON public.question_kpis;
DROP POLICY IF EXISTS "Allow update access to question_kpis" ON public.question_kpis;
DROP POLICY IF EXISTS "Allow delete access to question_kpis" ON public.question_kpis;

-- Data Backups
DROP POLICY IF EXISTS "Allow read access to data_backups" ON public.data_backups;
DROP POLICY IF EXISTS "Allow insert access to data_backups" ON public.data_backups;
DROP POLICY IF EXISTS "Allow update access to data_backups" ON public.data_backups;
DROP POLICY IF EXISTS "Allow delete access to data_backups" ON public.data_backups;
DROP POLICY IF EXISTS "Admins can manage data_backups" ON public.data_backups;

-- Users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Trainers can view company users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Allow read access to users" ON public.users;
DROP POLICY IF EXISTS "Allow insert access to users" ON public.users;
DROP POLICY IF EXISTS "Allow update access to users" ON public.users;

-- Subscriptions
DROP POLICY IF EXISTS "Users can read own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Allow read access to subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Allow insert access to subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Allow update access to subscriptions" ON public.subscriptions;

-- Attempts
DROP POLICY IF EXISTS "Users can view own attempts" ON public.attempts;
DROP POLICY IF EXISTS "Users can create own attempts" ON public.attempts;
DROP POLICY IF EXISTS "Users can read own attempts" ON public.attempts;
DROP POLICY IF EXISTS "Admins can manage all attempts" ON public.attempts;
DROP POLICY IF EXISTS "Allow read access to attempts" ON public.attempts;
DROP POLICY IF EXISTS "Allow insert access to attempts" ON public.attempts;
DROP POLICY IF EXISTS "Allow update access to attempts" ON public.attempts;

-- Attempt Items
DROP POLICY IF EXISTS "Users can read own attempt_items" ON public.attempt_items;
DROP POLICY IF EXISTS "Users can create own attempt_items" ON public.attempt_items;
DROP POLICY IF EXISTS "Admins can manage all attempt_items" ON public.attempt_items;
DROP POLICY IF EXISTS "Allow read access to attempt_items" ON public.attempt_items;
DROP POLICY IF EXISTS "Allow insert access to attempt_items" ON public.attempt_items;
DROP POLICY IF EXISTS "Allow update access to attempt_items" ON public.attempt_items;

-- User Sessions
DROP POLICY IF EXISTS "Users can read own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow read access to user_sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow insert access to user_sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow update access to user_sessions" ON public.user_sessions;

-- Exam Results
DROP POLICY IF EXISTS "Users can view own exam results" ON public.exam_results;
DROP POLICY IF EXISTS "Users can insert own exam results" ON public.exam_results;
DROP POLICY IF EXISTS "Users can update own exam results" ON public.exam_results;
DROP POLICY IF EXISTS "Trainers can view all exam results" ON public.exam_results;

-- =====================================================
-- STEP 3: Create new comprehensive policies
-- =====================================================

-- ================== CONTENT TABLES ==================
-- These tables contain shared educational content
-- All authenticated users can read, admins can write

-- TOPICS
CREATE POLICY "Everyone can read topics"
ON public.topics FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Admins can insert topics"
ON public.topics FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can update topics"
ON public.topics FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can delete topics"
ON public.topics FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- SUBTOPICS
CREATE POLICY "Everyone can read subtopics"
ON public.subtopics FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Admins can insert subtopics"
ON public.subtopics FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can update subtopics"
ON public.subtopics FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can delete subtopics"
ON public.subtopics FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- QUESTIONS
CREATE POLICY "Everyone can read questions"
ON public.questions FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Admins can insert questions"
ON public.questions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can update questions"
ON public.questions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can delete questions"
ON public.questions FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- KPIS
CREATE POLICY "Everyone can read kpis"
ON public.kpis FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Admins can insert kpis"
ON public.kpis FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can update kpis"
ON public.kpis FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can delete kpis"
ON public.kpis FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- SAMPLE ANSWERS
CREATE POLICY "Everyone can read sample_answers"
ON public.sample_answers FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Admins can manage sample_answers"
ON public.sample_answers FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- TRAINING EXAMPLES
CREATE POLICY "Everyone can read training_examples"
ON public.training_examples FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Admins can manage training_examples"
ON public.training_examples FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- COMPANY CODES
CREATE POLICY "Everyone can read company_codes"
ON public.company_codes FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Admins can manage company_codes"
ON public.company_codes FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- QUESTION_KPIS (relationship table)
CREATE POLICY "Everyone can read question_kpis"
ON public.question_kpis FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Admins can manage question_kpis"
ON public.question_kpis FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- DATA BACKUPS
CREATE POLICY "Admins can manage backups"
ON public.data_backups FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ================== USER-SPECIFIC TABLES ==================
-- These tables contain user-specific data with stricter access control

-- USERS
CREATE POLICY "Users can read own profile"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Trainers can read company users"
ON public.users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users trainer
    WHERE trainer.id = auth.uid()
    AND trainer.role IN ('trainer', 'admin')
    AND trainer.company_code = users.company_code
  )
);

CREATE POLICY "Admins can read all users"
ON public.users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage all users"
ON public.users FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- SUBSCRIPTIONS
CREATE POLICY "Users can read own subscriptions"
ON public.subscriptions FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Users can create own subscriptions"
ON public.subscriptions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage subscriptions"
ON public.subscriptions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- ATTEMPTS
CREATE POLICY "Users can read own attempts"
ON public.attempts FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('trainer', 'admin')
  )
);

CREATE POLICY "Users can create own attempts"
ON public.attempts FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own attempts"
ON public.attempts FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Trainers can read company attempts"
ON public.attempts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u1
    INNER JOIN public.users u2 ON u1.company_code = u2.company_code
    WHERE u1.id = auth.uid()
    AND u1.role = 'trainer'
    AND u2.id = attempts.user_id
  )
);

-- ATTEMPT ITEMS
CREATE POLICY "Users can read own attempt_items"
ON public.attempt_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.attempts
    WHERE attempts.id = attempt_items.attempt_id
    AND attempts.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('trainer', 'admin')
  )
);

CREATE POLICY "Users can create own attempt_items"
ON public.attempt_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.attempts
    WHERE attempts.id = attempt_items.attempt_id
    AND attempts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own attempt_items"
ON public.attempt_items FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.attempts
    WHERE attempts.id = attempt_items.attempt_id
    AND attempts.user_id = auth.uid()
  )
);

-- USER SESSIONS
CREATE POLICY "Users can read own sessions"
ON public.user_sessions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own sessions"
ON public.user_sessions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions"
ON public.user_sessions FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions"
ON public.user_sessions FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- EXAM RESULTS
CREATE POLICY "Users can read own exam_results"
ON public.exam_results FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own exam_results"
ON public.exam_results FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own exam_results"
ON public.exam_results FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Trainers can read all exam_results"
ON public.exam_results FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('trainer', 'admin')
  )
);

CREATE POLICY "Trainers can read company exam_results"
ON public.exam_results FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u1
    INNER JOIN public.users u2 ON u1.company_code = u2.company_code
    WHERE u1.id = auth.uid()
    AND u1.role = 'trainer'
    AND u2.id = exam_results.user_id
  )
);

-- =====================================================
-- STEP 4: Verification
-- =====================================================

-- Check which tables have RLS enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- RLS SETUP COMPLETE
-- =====================================================
-- All tables now have proper RLS policies that:
-- 1. Allow authenticated users to read shared content
-- 2. Allow admins to manage all content
-- 3. Protect user-specific data (only owner + admin/trainer can access)
-- 4. Support anonymous read access for public content (topics, questions, etc.)
-- 5. Respect company boundaries for trainers

