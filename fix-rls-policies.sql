-- =====================================================
-- COMPREHENSIVE RLS POLICIES FOR IPMA CERT PREP
-- =====================================================
-- This file fixes all RLS policies to allow data saving

-- Enable RLS on all content tables
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_backups ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view own attempts" ON public.attempts;
DROP POLICY IF EXISTS "Users can create own attempts" ON public.attempts;

-- =====================================================
-- CONTENT TABLES POLICIES (Allow both authenticated and anonymous access)
-- =====================================================

-- Topics policies
CREATE POLICY "Allow read access to topics" ON public.topics
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow insert access to topics" ON public.topics
    FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "Allow update access to topics" ON public.topics
    FOR UPDATE TO authenticated, anon USING (true);

CREATE POLICY "Allow delete access to topics" ON public.topics
    FOR DELETE TO authenticated, anon USING (true);

-- Subtopics policies
CREATE POLICY "Allow read access to subtopics" ON public.subtopics
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow insert access to subtopics" ON public.subtopics
    FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "Allow update access to subtopics" ON public.subtopics
    FOR UPDATE TO authenticated, anon USING (true);

CREATE POLICY "Allow delete access to subtopics" ON public.subtopics
    FOR DELETE TO authenticated, anon USING (true);

-- Questions policies
CREATE POLICY "Allow read access to questions" ON public.questions
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow insert access to questions" ON public.questions
    FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "Allow update access to questions" ON public.questions
    FOR UPDATE TO authenticated, anon USING (true);

CREATE POLICY "Allow delete access to questions" ON public.questions
    FOR DELETE TO authenticated, anon USING (true);

-- KPIs policies
CREATE POLICY "Allow read access to kpis" ON public.kpis
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow insert access to kpis" ON public.kpis
    FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "Allow update access to kpis" ON public.kpis
    FOR UPDATE TO authenticated, anon USING (true);

CREATE POLICY "Allow delete access to kpis" ON public.kpis
    FOR DELETE TO authenticated, anon USING (true);

-- Sample answers policies
CREATE POLICY "Allow read access to sample_answers" ON public.sample_answers
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow insert access to sample_answers" ON public.sample_answers
    FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "Allow update access to sample_answers" ON public.sample_answers
    FOR UPDATE TO authenticated, anon USING (true);

CREATE POLICY "Allow delete access to sample_answers" ON public.sample_answers
    FOR DELETE TO authenticated, anon USING (true);

-- Training examples policies
CREATE POLICY "Allow read access to training_examples" ON public.training_examples
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow insert access to training_examples" ON public.training_examples
    FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "Allow update access to training_examples" ON public.training_examples
    FOR UPDATE TO authenticated, anon USING (true);

CREATE POLICY "Allow delete access to training_examples" ON public.training_examples
    FOR DELETE TO authenticated, anon USING (true);

-- Company codes policies
CREATE POLICY "Allow read access to company_codes" ON public.company_codes
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow insert access to company_codes" ON public.company_codes
    FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "Allow update access to company_codes" ON public.company_codes
    FOR UPDATE TO authenticated, anon USING (true);

CREATE POLICY "Allow delete access to company_codes" ON public.company_codes
    FOR DELETE TO authenticated, anon USING (true);

-- Question-KPI relationships policies
CREATE POLICY "Allow read access to question_kpis" ON public.question_kpis
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow insert access to question_kpis" ON public.question_kpis
    FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "Allow update access to question_kpis" ON public.question_kpis
    FOR UPDATE TO authenticated, anon USING (true);

CREATE POLICY "Allow delete access to question_kpis" ON public.question_kpis
    FOR DELETE TO authenticated, anon USING (true);

-- Data backups policies
CREATE POLICY "Allow read access to data_backups" ON public.data_backups
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow insert access to data_backups" ON public.data_backups
    FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "Allow update access to data_backups" ON public.data_backups
    FOR UPDATE TO authenticated, anon USING (true);

CREATE POLICY "Allow delete access to data_backups" ON public.data_backups
    FOR DELETE TO authenticated, anon USING (true);

-- =====================================================
-- USER-SPECIFIC TABLES POLICIES (More restrictive)
-- =====================================================

-- Users policies (more restrictive)
CREATE POLICY "Allow read access to users" ON public.users
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow insert access to users" ON public.users
    FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "Allow update access to users" ON public.users
    FOR UPDATE TO authenticated, anon USING (true);

-- Subscriptions policies
CREATE POLICY "Allow read access to subscriptions" ON public.subscriptions
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow insert access to subscriptions" ON public.subscriptions
    FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "Allow update access to subscriptions" ON public.subscriptions
    FOR UPDATE TO authenticated, anon USING (true);

-- Attempts policies
CREATE POLICY "Allow read access to attempts" ON public.attempts
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow insert access to attempts" ON public.attempts
    FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "Allow update access to attempts" ON public.attempts
    FOR UPDATE TO authenticated, anon USING (true);

-- Attempt items policies
CREATE POLICY "Allow read access to attempt_items" ON public.attempt_items
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow insert access to attempt_items" ON public.attempt_items
    FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "Allow update access to attempt_items" ON public.attempt_items
    FOR UPDATE TO authenticated, anon USING (true);

-- User sessions policies
CREATE POLICY "Allow read access to user_sessions" ON public.user_sessions
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow insert access to user_sessions" ON public.user_sessions
    FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "Allow update access to user_sessions" ON public.user_sessions
    FOR UPDATE TO authenticated, anon USING (true);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check which tables have RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;




