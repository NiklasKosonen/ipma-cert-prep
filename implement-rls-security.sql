-- =====================================================
-- IPMA Platform Security Implementation
-- Row Level Security (RLS) and Authentication Policies
-- =====================================================

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

-- =====================================================
-- COMPANY-BASED ACCESS POLICIES
-- =====================================================

-- Topics: Users can only access topics from their company
CREATE POLICY "Company topics access" ON public.topics
    FOR ALL TO authenticated
    USING (
        company_code IN (
            SELECT company_code FROM public.users 
            WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Subtopics: Users can only access subtopics from their company's topics
CREATE POLICY "Company subtopics access" ON public.subtopics
    FOR ALL TO authenticated
    USING (
        topic_id IN (
            SELECT id FROM public.topics 
            WHERE company_code IN (
                SELECT company_code FROM public.users 
                WHERE email = auth.jwt() ->> 'email'
            )
        )
    );

-- Questions: Users can only access questions from their company's topics
CREATE POLICY "Company questions access" ON public.questions
    FOR ALL TO authenticated
    USING (
        topic_id IN (
            SELECT id FROM public.topics 
            WHERE company_code IN (
                SELECT company_code FROM public.users 
                WHERE email = auth.jwt() ->> 'email'
            )
        )
    );

-- KPIs: Global access (shared across all companies)
CREATE POLICY "Global KPIs access" ON public.kpis
    FOR ALL TO authenticated
    USING (true);

-- Sample Answers: Users can only access sample answers for their company's questions
CREATE POLICY "Company sample answers access" ON public.sample_answers
    FOR ALL TO authenticated
    USING (
        question_id IN (
            SELECT id FROM public.questions 
            WHERE topic_id IN (
                SELECT id FROM public.topics 
                WHERE company_code IN (
                    SELECT company_code FROM public.users 
                    WHERE email = auth.jwt() ->> 'email'
                )
            )
        )
    );

-- Training Examples: Users can only access training examples for their company's questions
CREATE POLICY "Company training examples access" ON public.training_examples
    FOR ALL TO authenticated
    USING (
        question_id IN (
            SELECT id FROM public.questions 
            WHERE topic_id IN (
                SELECT id FROM public.topics 
                WHERE company_code IN (
                    SELECT company_code FROM public.users 
                    WHERE email = auth.jwt() ->> 'email'
                )
            )
        )
    );

-- =====================================================
-- USER-SPECIFIC ACCESS POLICIES
-- =====================================================

-- Users: Users can only access their own profile and users from their company
CREATE POLICY "Company users access" ON public.users
    FOR ALL TO authenticated
    USING (
        email = auth.jwt() ->> 'email' 
        OR company_code IN (
            SELECT company_code FROM public.users 
            WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Subscriptions: Users can only access subscriptions for their company
CREATE POLICY "Company subscriptions access" ON public.subscriptions
    FOR ALL TO authenticated
    USING (
        user_id IN (
            SELECT id FROM public.users 
            WHERE company_code IN (
                SELECT company_code FROM public.users 
                WHERE email = auth.jwt() ->> 'email'
            )
        )
    );

-- Attempts: Users can only access their own attempts
CREATE POLICY "User attempts access" ON public.attempts
    FOR ALL TO authenticated
    USING (
        user_id IN (
            SELECT id FROM public.users 
            WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Attempt Items: Users can only access attempt items for their own attempts
CREATE POLICY "User attempt items access" ON public.attempt_items
    FOR ALL TO authenticated
    USING (
        attempt_id IN (
            SELECT id FROM public.attempts 
            WHERE user_id IN (
                SELECT id FROM public.users 
                WHERE email = auth.jwt() ->> 'email'
            )
        )
    );

-- =====================================================
-- ADMIN ACCESS POLICIES
-- =====================================================

-- Company Codes: Only admins can access company codes
CREATE POLICY "Admin company codes access" ON public.company_codes
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE email = auth.jwt() ->> 'email' 
            AND role = 'admin'
        )
    );

-- Data Backups: Only admins can access backups
CREATE POLICY "Admin backups access" ON public.data_backups
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE email = auth.jwt() ->> 'email' 
            AND role = 'admin'
        )
    );

-- User Sessions: Only admins can access user sessions
CREATE POLICY "Admin sessions access" ON public.user_sessions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE email = auth.jwt() ->> 'email' 
            AND role = 'admin'
        )
    );

-- =====================================================
-- ANONYMOUS ACCESS FOR SYNC (TEMPORARY)
-- =====================================================

-- Allow anonymous access for data migration/sync operations
-- This should be removed once proper authentication is implemented
CREATE POLICY "Anonymous sync access" ON public.topics
    FOR ALL TO anon
    USING (true) WITH CHECK (true);

CREATE POLICY "Anonymous sync access" ON public.subtopics
    FOR ALL TO anon
    USING (true) WITH CHECK (true);

CREATE POLICY "Anonymous sync access" ON public.questions
    FOR ALL TO anon
    USING (true) WITH CHECK (true);

CREATE POLICY "Anonymous sync access" ON public.kpis
    FOR ALL TO anon
    USING (true) WITH CHECK (true);

CREATE POLICY "Anonymous sync access" ON public.sample_answers
    FOR ALL TO anon
    USING (true) WITH CHECK (true);

CREATE POLICY "Anonymous sync access" ON public.training_examples
    FOR ALL TO anon
    USING (true) WITH CHECK (true);

CREATE POLICY "Anonymous sync access" ON public.company_codes
    FOR ALL TO anon
    USING (true) WITH CHECK (true);

CREATE POLICY "Anonymous sync access" ON public.users
    FOR ALL TO anon
    USING (true) WITH CHECK (true);

CREATE POLICY "Anonymous sync access" ON public.subscriptions
    FOR ALL TO anon
    USING (true) WITH CHECK (true);

CREATE POLICY "Anonymous sync access" ON public.attempts
    FOR ALL TO anon
    USING (true) WITH CHECK (true);

CREATE POLICY "Anonymous sync access" ON public.attempt_items
    FOR ALL TO anon
    USING (true) WITH CHECK (true);

CREATE POLICY "Anonymous sync access" ON public.data_backups
    FOR ALL TO anon
    USING (true) WITH CHECK (true);

CREATE POLICY "Anonymous sync access" ON public.user_sessions
    FOR ALL TO anon
    USING (true) WITH CHECK (true);

-- =====================================================
-- SECURITY NOTES
-- =====================================================

-- 1. Anonymous policies are temporary for sync functionality
-- 2. Once proper authentication is implemented, remove anonymous policies
-- 3. All policies use auth.jwt() ->> 'email' for user identification
-- 4. Company-based isolation ensures data privacy
-- 5. Admin policies restrict sensitive operations to admin users only
