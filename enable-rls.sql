-- Enable Row Level Security (RLS) on all tables
-- Run this in your Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since we're using anon key)
-- This allows the anon key to read/write data for the sync functionality

-- Topics - allow public read/write for sync
CREATE POLICY "Allow public access to topics" ON public.topics
    FOR ALL USING (true) WITH CHECK (true);

-- Subtopics - allow public read/write for sync
CREATE POLICY "Allow public access to subtopics" ON public.subtopics
    FOR ALL USING (true) WITH CHECK (true);

-- Questions - allow public read/write for sync
CREATE POLICY "Allow public access to questions" ON public.questions
    FOR ALL USING (true) WITH CHECK (true);

-- KPIs - allow public read/write for sync
CREATE POLICY "Allow public access to kpis" ON public.kpis
    FOR ALL USING (true) WITH CHECK (true);

-- Company codes - allow public read/write for sync
CREATE POLICY "Allow public access to company_codes" ON public.company_codes
    FOR ALL USING (true) WITH CHECK (true);

-- Sample answers - allow public read/write for sync
CREATE POLICY "Allow public access to sample_answers" ON public.sample_answers
    FOR ALL USING (true) WITH CHECK (true);

-- Training examples - allow public read/write for sync
CREATE POLICY "Allow public access to training_examples" ON public.training_examples
    FOR ALL USING (true) WITH CHECK (true);

-- Data backups - allow public read/write for sync
CREATE POLICY "Allow public access to data_backups" ON public.data_backups
    FOR ALL USING (true) WITH CHECK (true);

-- Users - allow public read/write for sync
CREATE POLICY "Allow public access to users" ON public.users
    FOR ALL USING (true) WITH CHECK (true);

-- Subscriptions - allow public read/write for sync
CREATE POLICY "Allow public access to subscriptions" ON public.subscriptions
    FOR ALL USING (true) WITH CHECK (true);

-- Attempts - allow public read/write for sync
CREATE POLICY "Allow public access to attempts" ON public.attempts
    FOR ALL USING (true) WITH CHECK (true);

-- Attempt items - allow public read/write for sync
CREATE POLICY "Allow public access to attempt_items" ON public.attempt_items
    FOR ALL USING (true) WITH CHECK (true);

-- User sessions - allow public read/write for sync
CREATE POLICY "Allow public access to user_sessions" ON public.user_sessions
    FOR ALL USING (true) WITH CHECK (true);

-- Question KPIs - allow public read/write for sync
CREATE POLICY "Allow public access to question_kpis" ON public.question_kpis
    FOR ALL USING (true) WITH CHECK (true);

-- Note: These policies allow full public access for sync functionality
-- In production, you might want to restrict this based on authentication
