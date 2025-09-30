-- =====================================================
-- USER-SPECIFIC DATA TABLES FOR EXAM RESULTS
-- =====================================================
-- This file creates tables for storing user exam results and evaluations

-- =====================================================
-- EXAM RESULTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.exam_results (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    attempt_id TEXT NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
    total_questions INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    score INTEGER NOT NULL DEFAULT 0, -- Percentage score (0-100)
    time_spent INTEGER NOT NULL DEFAULT 0, -- Time in minutes
    completed_at TIMESTAMPTZ NOT NULL,
    evaluation JSONB NOT NULL DEFAULT '{}', -- Contains strengths, weaknesses, recommendations, detailed feedback
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for user-specific queries
CREATE INDEX IF NOT EXISTS idx_exam_results_user_id ON public.exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_completed_at ON public.exam_results(completed_at);
CREATE INDEX IF NOT EXISTS idx_exam_results_score ON public.exam_results(score);

-- Composite index for user's exam history
CREATE INDEX IF NOT EXISTS idx_exam_results_user_completed ON public.exam_results(user_id, completed_at DESC);

-- =====================================================
-- RLS POLICIES FOR EXAM RESULTS
-- =====================================================

-- Enable RLS
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- Users can view their own exam results
CREATE POLICY "Users can view own exam results" ON public.exam_results
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Users can insert their own exam results
CREATE POLICY "Users can insert own exam results" ON public.exam_results
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own exam results
CREATE POLICY "Users can update own exam results" ON public.exam_results
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

-- Trainers and admins can view all exam results
CREATE POLICY "Trainers can view all exam results" ON public.exam_results
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('trainer', 'admin')
        )
    );

-- =====================================================
-- UPDATE USERS TABLE TO INCLUDE ROLE
-- =====================================================

-- Add role column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'trainer', 'admin'));

-- Update existing users to have 'user' role
UPDATE public.users SET role = 'user' WHERE role IS NULL;

-- =====================================================
-- RLS POLICIES FOR USERS TABLE (Updated)
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

-- Users can insert their own profile (for sign up)
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- Trainers can view users from their company
CREATE POLICY "Trainers can view company users" ON public.users
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users trainer
            WHERE trainer.id = auth.uid() 
            AND trainer.role = 'trainer'
            AND trainer.company_code = users.company_code
        )
    );

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if exam_results table exists and has correct structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'exam_results' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('exam_results', 'users')
ORDER BY tablename, policyname;

-- Check indexes
SELECT 
    indexname, 
    tablename, 
    indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename = 'exam_results'
ORDER BY indexname;



