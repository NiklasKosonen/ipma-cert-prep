-- =====================================================
-- SCHEMA UPDATES FOR RLS FIX
-- =====================================================
-- This file adds missing columns and constraints needed
-- for the complete RLS implementation

-- =====================================================
-- 1. ADD MISSING COLUMNS TO KPIS TABLE
-- =====================================================

ALTER TABLE public.kpis 
ADD COLUMN IF NOT EXISTS topic_id TEXT,
ADD COLUMN IF NOT EXISTS subtopic_id TEXT,
ADD COLUMN IF NOT EXISTS is_essential BOOLEAN DEFAULT false;

-- Add foreign key constraints
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'kpis_topic_id_fkey'
    ) THEN
        ALTER TABLE public.kpis 
        ADD CONSTRAINT kpis_topic_id_fkey 
        FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'kpis_subtopic_id_fkey'
    ) THEN
        ALTER TABLE public.kpis 
        ADD CONSTRAINT kpis_subtopic_id_fkey 
        FOREIGN KEY (subtopic_id) REFERENCES public.subtopics(id) ON DELETE CASCADE;
    END IF;
END $$;

-- =====================================================
-- 2. ADD MISSING COLUMNS TO SAMPLE_ANSWERS TABLE
-- =====================================================

ALTER TABLE public.sample_answers 
ADD COLUMN IF NOT EXISTS detected_kpis TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS feedback TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS quality_rating DECIMAL(3,2) DEFAULT 3.00;

-- =====================================================
-- 3. ADD MISSING COLUMNS TO TRAINING_EXAMPLES TABLE
-- =====================================================

ALTER TABLE public.training_examples 
ADD COLUMN IF NOT EXISTS detected_kpis TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS feedback TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS quality_rating DECIMAL(3,2) DEFAULT 3.00,
ADD COLUMN IF NOT EXISTS example_type TEXT DEFAULT 'training';

-- =====================================================
-- 4. ADD MISSING COLUMNS TO COMPANY_CODES TABLE
-- =====================================================

ALTER TABLE public.company_codes 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS admin_email TEXT,
ADD COLUMN IF NOT EXISTS max_users INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 year';

-- Update existing rows with default values if company_name is NULL
UPDATE public.company_codes 
SET company_name = name 
WHERE company_name IS NULL AND name IS NOT NULL;

-- =====================================================
-- 5. ADD MISSING COLUMNS TO ATTEMPTS TABLE
-- =====================================================

ALTER TABLE public.attempts 
ADD COLUMN IF NOT EXISTS total_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_remaining INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

-- =====================================================
-- 6. ADD MISSING COLUMNS TO ATTEMPT_ITEMS TABLE
-- =====================================================

ALTER TABLE public.attempt_items 
ADD COLUMN IF NOT EXISTS kpis_detected TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS kpis_missing TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS score DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_score DECIMAL(5,2) DEFAULT 3,
ADD COLUMN IF NOT EXISTS feedback TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS is_evaluated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS evaluation_json JSONB,
ADD COLUMN IF NOT EXISTS duration_sec INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS answer TEXT;

-- Rename answer_text to answer if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attempt_items' 
        AND column_name = 'answer_text'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attempt_items' 
        AND column_name = 'answer'
    ) THEN
        ALTER TABLE public.attempt_items RENAME COLUMN answer_text TO answer;
    END IF;
END $$;

-- =====================================================
-- 7. ADD MISSING COLUMNS TO SUBTOPICS TABLE
-- =====================================================

ALTER TABLE public.subtopics 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- =====================================================
-- 8. ENSURE USERS TABLE HAS ALL REQUIRED COLUMNS
-- =====================================================

-- Make sure id is UUID type and references auth.users
DO $$
BEGIN
    -- Check if id is TEXT, if so we need to convert
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'id' 
        AND data_type = 'text'
    ) THEN
        -- Create a backup table
        CREATE TABLE IF NOT EXISTS users_backup AS SELECT * FROM public.users;
        
        -- Drop the old table
        DROP TABLE IF EXISTS public.users CASCADE;
        
        -- Recreate with correct types
        CREATE TABLE public.users (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('admin', 'trainer', 'trainee', 'user')) DEFAULT 'user',
            company_code TEXT,
            company_name TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- Ensure role column exists and has proper constraint
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_role_check'
    ) THEN
        ALTER TABLE public.users 
        ADD CONSTRAINT users_role_check 
        CHECK (role IN ('admin', 'trainer', 'trainee', 'user'));
    END IF;
END $$;

-- =====================================================
-- 9. CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- KPIs indexes
CREATE INDEX IF NOT EXISTS idx_kpis_topic_id ON public.kpis(topic_id);
CREATE INDEX IF NOT EXISTS idx_kpis_subtopic_id ON public.kpis(subtopic_id);

-- Subtopics indexes
CREATE INDEX IF NOT EXISTS idx_subtopics_topic_id ON public.subtopics(topic_id);
CREATE INDEX IF NOT EXISTS idx_subtopics_is_active ON public.subtopics(is_active);

-- Questions indexes
CREATE INDEX IF NOT EXISTS idx_questions_subtopic_id ON public.questions(subtopic_id);
CREATE INDEX IF NOT EXISTS idx_questions_is_active ON public.questions(is_active);

-- Attempts indexes
CREATE INDEX IF NOT EXISTS idx_attempts_status ON public.attempts(status);
CREATE INDEX IF NOT EXISTS idx_attempts_submitted_at ON public.attempts(submitted_at);

-- Attempt items indexes
CREATE INDEX IF NOT EXISTS idx_attempt_items_is_evaluated ON public.attempt_items(is_evaluated);

-- Sample answers indexes
CREATE INDEX IF NOT EXISTS idx_sample_answers_question_id ON public.sample_answers(question_id);

-- Training examples indexes
CREATE INDEX IF NOT EXISTS idx_training_examples_question_id ON public.training_examples(question_id);

-- =====================================================
-- 10. VERIFICATION QUERIES
-- =====================================================

-- Check all tables have required columns
DO $$
DECLARE
    missing_columns TEXT;
BEGIN
    SELECT string_agg(
        table_name || '.' || column_name, ', '
    ) INTO missing_columns
    FROM (
        -- Check KPIs
        SELECT 'kpis' as table_name, 'topic_id' as column_name
        WHERE NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'kpis' AND column_name = 'topic_id'
        )
        UNION ALL
        SELECT 'kpis', 'subtopic_id'
        WHERE NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'kpis' AND column_name = 'subtopic_id'
        )
        UNION ALL
        -- Check sample_answers
        SELECT 'sample_answers', 'detected_kpis'
        WHERE NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'sample_answers' AND column_name = 'detected_kpis'
        )
        UNION ALL
        -- Check attempt_items
        SELECT 'attempt_items', 'kpis_detected'
        WHERE NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'attempt_items' AND column_name = 'kpis_detected'
        )
    ) missing;

    IF missing_columns IS NOT NULL THEN
        RAISE NOTICE 'Missing columns: %', missing_columns;
    ELSE
        RAISE NOTICE 'All required columns exist!';
    END IF;
END $$;

-- Display summary of all tables
SELECT 
    t.table_name,
    COUNT(c.column_name) as column_count,
    COALESCE(
        (SELECT COUNT(*) FROM pg_policies p WHERE p.tablename = t.table_name), 
        0
    ) as policy_count,
    CASE 
        WHEN pt.rowsecurity THEN 'Enabled'
        ELSE 'Disabled'
    END as rls_status
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
LEFT JOIN pg_tables pt ON t.table_name = pt.tablename
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND t.table_name NOT LIKE '%_backup'
GROUP BY t.table_name, pt.rowsecurity
ORDER BY t.table_name;

-- =====================================================
-- SCHEMA UPDATES COMPLETE
-- =====================================================

