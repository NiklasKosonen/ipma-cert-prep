-- =====================================================
-- Enable Anonymous Full Access - Allow Read and Write Without Authentication
-- =====================================================

-- This allows the app to read and write data to Supabase without authentication
-- This is a temporary solution to get sync working

-- Remove existing policies first
DROP POLICY IF EXISTS "Allow anon to read topics" ON public.topics;
DROP POLICY IF EXISTS "Allow anon to read subtopics" ON public.subtopics;
DROP POLICY IF EXISTS "Allow anon to read questions" ON public.questions;
DROP POLICY IF EXISTS "Allow anon to read kpis" ON public.kpis;
DROP POLICY IF EXISTS "Allow anon to read sample_answers" ON public.sample_answers;
DROP POLICY IF EXISTS "Allow anon to read training_examples" ON public.training_examples;
DROP POLICY IF EXISTS "Allow anon to read company_codes" ON public.company_codes;
DROP POLICY IF EXISTS "Allow anon to read data_backups" ON public.data_backups;
DROP POLICY IF EXISTS "Allow anon to read users" ON public.users;
DROP POLICY IF EXISTS "Allow anon to read subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Allow anon to read attempts" ON public.attempts;
DROP POLICY IF EXISTS "Allow anon to read attempt_items" ON public.attempt_items;

-- Allow anonymous users FULL access to topics
CREATE POLICY "Allow anon full access to topics" ON public.topics
    FOR ALL TO anon USING (true) WITH CHECK (true);

-- Allow anonymous users FULL access to subtopics
CREATE POLICY "Allow anon full access to subtopics" ON public.subtopics
    FOR ALL TO anon USING (true) WITH CHECK (true);

-- Allow anonymous users FULL access to questions
CREATE POLICY "Allow anon full access to questions" ON public.questions
    FOR ALL TO anon USING (true) WITH CHECK (true);

-- Allow anonymous users FULL access to KPIs
CREATE POLICY "Allow anon full access to kpis" ON public.kpis
    FOR ALL TO anon USING (true) WITH CHECK (true);

-- Allow anonymous users FULL access to sample answers
CREATE POLICY "Allow anon full access to sample_answers" ON public.sample_answers
    FOR ALL TO anon USING (true) WITH CHECK (true);

-- Allow anonymous users FULL access to training examples
CREATE POLICY "Allow anon full access to training_examples" ON public.training_examples
    FOR ALL TO anon USING (true) WITH CHECK (true);

-- Allow anonymous users FULL access to company codes
CREATE POLICY "Allow anon full access to company_codes" ON public.company_codes
    FOR ALL TO anon USING (true) WITH CHECK (true);

-- Allow anonymous users FULL access to data backups
CREATE POLICY "Allow anon full access to data_backups" ON public.data_backups
    FOR ALL TO anon USING (true) WITH CHECK (true);

-- Allow anonymous users FULL access to users
CREATE POLICY "Allow anon full access to users" ON public.users
    FOR ALL TO anon USING (true) WITH CHECK (true);

-- Allow anonymous users FULL access to subscriptions
CREATE POLICY "Allow anon full access to subscriptions" ON public.subscriptions
    FOR ALL TO anon USING (true) WITH CHECK (true);

-- Allow anonymous users FULL access to attempts
CREATE POLICY "Allow anon full access to attempts" ON public.attempts
    FOR ALL TO anon USING (true) WITH CHECK (true);

-- Allow anonymous users FULL access to attempt items
CREATE POLICY "Allow anon full access to attempt_items" ON public.attempt_items
    FOR ALL TO anon USING (true) WITH CHECK (true);

-- =====================================================
-- Security Notes
-- =====================================================

-- 1. This gives anonymous users FULL access (read/write/delete) to all tables
-- 2. This is TEMPORARY to get sync working
-- 3. Once sync is working, we should implement proper authentication
-- 4. This will allow both sync FROM and TO Supabase to work
-- 5. The app should now be able to read and write data without authentication issues
