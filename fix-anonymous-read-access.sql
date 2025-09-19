-- =====================================================
-- Fix Anonymous Read Access - Allow Data Reading Without Authentication
-- =====================================================

-- This allows the app to read data from Supabase even without authentication
-- while still maintaining security for write operations

-- Allow anonymous users to read topics (for public access)
DROP POLICY IF EXISTS "Allow anon to read topics" ON public.topics;
CREATE POLICY "Allow anon to read topics" ON public.topics
    FOR SELECT TO anon USING (true);

-- Allow anonymous users to read subtopics
DROP POLICY IF EXISTS "Allow anon to read subtopics" ON public.subtopics;
CREATE POLICY "Allow anon to read subtopics" ON public.subtopics
    FOR SELECT TO anon USING (true);

-- Allow anonymous users to read questions
DROP POLICY IF EXISTS "Allow anon to read questions" ON public.questions;
CREATE POLICY "Allow anon to read questions" ON public.questions
    FOR SELECT TO anon USING (true);

-- Allow anonymous users to read KPIs
DROP POLICY IF EXISTS "Allow anon to read kpis" ON public.kpis;
CREATE POLICY "Allow anon to read kpis" ON public.kpis
    FOR SELECT TO anon USING (true);

-- Allow anonymous users to read sample answers
DROP POLICY IF EXISTS "Allow anon to read sample_answers" ON public.sample_answers;
CREATE POLICY "Allow anon to read sample_answers" ON public.sample_answers
    FOR SELECT TO anon USING (true);

-- Allow anonymous users to read training examples
DROP POLICY IF EXISTS "Allow anon to read training_examples" ON public.training_examples;
CREATE POLICY "Allow anon to read training_examples" ON public.training_examples
    FOR SELECT TO anon USING (true);

-- Allow anonymous users to read company codes (for company login)
DROP POLICY IF EXISTS "Allow anon to read company_codes" ON public.company_codes;
CREATE POLICY "Allow anon to read company_codes" ON public.company_codes
    FOR SELECT TO anon USING (true);

-- Allow anonymous users to read data backups (for sync)
DROP POLICY IF EXISTS "Allow anon to read data_backups" ON public.data_backups;
CREATE POLICY "Allow anon to read data_backups" ON public.data_backups
    FOR SELECT TO anon USING (true);

-- Allow anonymous users to read users (for authentication)
DROP POLICY IF EXISTS "Allow anon to read users" ON public.users;
CREATE POLICY "Allow anon to read users" ON public.users
    FOR SELECT TO anon USING (true);

-- Allow anonymous users to read subscriptions
DROP POLICY IF EXISTS "Allow anon to read subscriptions" ON public.subscriptions;
CREATE POLICY "Allow anon to read subscriptions" ON public.subscriptions
    FOR SELECT TO anon USING (true);

-- Allow anonymous users to read attempts
DROP POLICY IF EXISTS "Allow anon to read attempts" ON public.attempts;
CREATE POLICY "Allow anon to read attempts" ON public.attempts
    FOR SELECT TO anon USING (true);

-- Allow anonymous users to read attempt items
DROP POLICY IF EXISTS "Allow anon to read attempt_items" ON public.attempt_items;
CREATE POLICY "Allow anon to read attempt_items" ON public.attempt_items
    FOR SELECT TO anon USING (true);

-- =====================================================
-- Security Notes
-- =====================================================

-- 1. Anonymous users can now READ data (for public access and sync)
-- 2. Anonymous users CANNOT write/update/delete data (maintains security)
-- 3. Authenticated users have full access based on company policies
-- 4. This fixes the 406 Not Acceptable error when syncing from Supabase
-- 5. Data sync FROM Supabase will now work without authentication
