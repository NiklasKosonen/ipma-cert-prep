-- =====================================================
-- DATABASE CONSTRAINTS FOR UPSERT OPERATIONS
-- =====================================================
-- This file adds unique constraints needed for upsert operations

-- =====================================================
-- UNIQUE CONSTRAINTS FOR UPSERT OPERATIONS
-- =====================================================

-- Topics table - unique constraint on title for upsert
ALTER TABLE public.topics 
ADD CONSTRAINT topics_title_unique UNIQUE (title);

-- Subtopics table - unique constraint on title + topic_id combination
ALTER TABLE public.subtopics 
ADD CONSTRAINT subtopics_title_topic_unique UNIQUE (title, topic_id);

-- KPIs table - unique constraint on name + subtopic_id combination
ALTER TABLE public.kpis 
ADD CONSTRAINT kpis_name_subtopic_unique UNIQUE (name, subtopic_id);

-- Questions table - unique constraint on prompt + subtopic_id combination
ALTER TABLE public.questions 
ADD CONSTRAINT questions_prompt_subtopic_unique UNIQUE (prompt, subtopic_id);

-- Company codes table - unique constraint on code (already exists, but ensuring)
ALTER TABLE public.company_codes 
ADD CONSTRAINT company_codes_code_unique UNIQUE (code);

-- Sample answers table - unique constraint on question_id + answer_text combination
ALTER TABLE public.sample_answers 
ADD CONSTRAINT sample_answers_question_text_unique UNIQUE (question_id, answer_text);

-- Training examples table - unique constraint on question_id + example_text combination
ALTER TABLE public.training_examples 
ADD CONSTRAINT training_examples_question_text_unique UNIQUE (question_id, example_text);

-- =====================================================
-- FOREIGN KEY CONSTRAINTS (Ensure referential integrity)
-- =====================================================

-- Ensure KPIs have proper foreign key relationships
ALTER TABLE public.kpis 
ADD CONSTRAINT kpis_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;

ALTER TABLE public.kpis 
ADD CONSTRAINT kpis_subtopic_id_fkey 
FOREIGN KEY (subtopic_id) REFERENCES public.subtopics(id) ON DELETE CASCADE;

-- Ensure questions have proper foreign key relationships
ALTER TABLE public.questions 
ADD CONSTRAINT questions_topic_id_fkey 
FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;

ALTER TABLE public.questions 
ADD CONSTRAINT questions_subtopic_id_fkey 
FOREIGN KEY (subtopic_id) REFERENCES public.subtopics(id) ON DELETE SET NULL;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_topics_title ON public.topics(title);
CREATE INDEX IF NOT EXISTS idx_subtopics_topic_title ON public.subtopics(topic_id, title);
CREATE INDEX IF NOT EXISTS idx_kpis_subtopic_name ON public.kpis(subtopic_id, name);
CREATE INDEX IF NOT EXISTS idx_questions_subtopic_prompt ON public.questions(subtopic_id, prompt);
CREATE INDEX IF NOT EXISTS idx_company_codes_code ON public.company_codes(code);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check all unique constraints
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- Check all foreign key constraints
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;




