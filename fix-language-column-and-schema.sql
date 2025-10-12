-- ============================================================
-- ADD LANGUAGE COLUMN TO ALL CONTENT TABLES
-- ============================================================
-- This replaces the separate topics_en, subtopics_en, etc. tables
-- with a single unified schema using a language column
-- ============================================================

-- Add language column to topics
ALTER TABLE public.topics 
ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'fi' CHECK (language IN ('fi', 'en'));

-- Add language column to subtopics
ALTER TABLE public.subtopics 
ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'fi' CHECK (language IN ('fi', 'en'));

-- Add language column to kpis  
ALTER TABLE public.kpis
ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'fi' CHECK (language IN ('fi', 'en'));

-- Add language column to questions
ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'fi' CHECK (language IN ('fi', 'en'));

-- Create indexes for language filtering
CREATE INDEX IF NOT EXISTS idx_topics_language ON public.topics(language);
CREATE INDEX IF NOT EXISTS idx_subtopics_language ON public.subtopics(language);
CREATE INDEX IF NOT EXISTS idx_kpis_language ON public.kpis(language);
CREATE INDEX IF NOT EXISTS idx_questions_language ON public.questions(language);

-- Update existing records to set language
UPDATE public.topics SET language = 'fi' WHERE language IS NULL;
UPDATE public.subtopics SET language = 'fi' WHERE language IS NULL;
UPDATE public.kpis SET language = 'fi' WHERE language IS NULL;
UPDATE public.questions SET language = 'fi' WHERE language IS NULL;

-- ============================================================
-- MIGRATE DATA FROM ENGLISH TABLES TO MAIN TABLES
-- ============================================================

-- Migrate topics_en to topics with language='en'
INSERT INTO public.topics (id, title, description, is_active, language, created_at, updated_at)
SELECT id, title, description, is_active, 'en' as language, created_at, updated_at
FROM public.topics_en
ON CONFLICT (id) DO NOTHING;

-- Migrate subtopics_en to subtopics with language='en'
INSERT INTO public.subtopics (id, topic_id, title, description, is_active, language, created_at, updated_at)
SELECT id, topic_id, title, description, is_active, 'en' as language, created_at, updated_at
FROM public.subtopics_en
ON CONFLICT (id) DO NOTHING;

-- Migrate kpis_en to kpis with language='en'
INSERT INTO public.kpis (id, name, description, is_active, language, created_at, updated_at, topic_id, subtopic_id, is_essential, connected_questions)
SELECT id, name, description, is_active, 'en' as language, created_at, updated_at, 
       topic_id, subtopic_id, is_essential, connected_questions
FROM public.kpis_en
ON CONFLICT (id) DO NOTHING;

-- Migrate questions_en to questions with language='en'
INSERT INTO public.questions (id, topic_id, subtopic_id, prompt, difficulty_level, time_limit, is_active, language, created_at, updated_at)
SELECT id, topic_id, subtopic_id, prompt, difficulty_level, time_limit, is_active, 'en' as language, created_at, updated_at
FROM public.questions_en
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ADD LANGUAGE COLUMN TO TRAINING EXAMPLES AND AI EVALUATION CRITERIA
-- ============================================================

-- Add language column to training_examples
ALTER TABLE public.training_examples 
ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'fi' CHECK (language IN ('fi', 'en'));

-- Add language column to ai_evaluation_criteria
ALTER TABLE public.ai_evaluation_criteria 
ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'fi' CHECK (language IN ('fi', 'en'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_training_examples_language ON public.training_examples(language);
CREATE INDEX IF NOT EXISTS idx_ai_evaluation_criteria_language ON public.ai_evaluation_criteria(language);

-- Update existing records
UPDATE public.training_examples SET language = 'fi' WHERE language IS NULL;
UPDATE public.ai_evaluation_criteria SET language = 'fi' WHERE language IS NULL;

-- ============================================================
-- ENHANCE FOREIGN KEY CONSTRAINTS WITH LANGUAGE AWARENESS
-- ============================================================

-- Update foreign key constraints to include CASCADE where missing
ALTER TABLE IF EXISTS public.subtopics 
DROP CONSTRAINT IF EXISTS subtopics_topic_id_fkey;

ALTER TABLE public.subtopics
ADD CONSTRAINT subtopics_topic_id_fkey 
FOREIGN KEY (topic_id) 
REFERENCES public.topics(id) 
ON DELETE CASCADE;

-- Update questions foreign keys
ALTER TABLE IF EXISTS public.questions 
DROP CONSTRAINT IF EXISTS questions_topic_id_fkey;

ALTER TABLE public.questions
ADD CONSTRAINT questions_topic_id_fkey 
FOREIGN KEY (topic_id) 
REFERENCES public.topics(id) 
ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.questions 
DROP CONSTRAINT IF EXISTS questions_subtopic_id_fkey;

ALTER TABLE public.questions
ADD CONSTRAINT questions_subtopic_id_fkey 
FOREIGN KEY (subtopic_id) 
REFERENCES public.subtopics(id) 
ON DELETE SET NULL;

-- Update kpis foreign keys (if they exist)
ALTER TABLE IF EXISTS public.kpis 
DROP CONSTRAINT IF EXISTS kpis_topic_id_fkey;

ALTER TABLE IF EXISTS public.kpis 
DROP CONSTRAINT IF EXISTS kpis_subtopic_id_fkey;

-- ============================================================
-- VERIFY SCHEMA CHANGES
-- ============================================================

-- Check that language columns were added
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('topics', 'subtopics', 'kpis', 'questions', 'training_examples', 'ai_evaluation_criteria')
  AND column_name = 'language'
ORDER BY table_name;

-- Check language distribution
SELECT 'topics' as table_name, language, COUNT(*) as count FROM public.topics GROUP BY language
UNION ALL
SELECT 'subtopics' as table_name, language, COUNT(*) as count FROM public.subtopics GROUP BY language
UNION ALL
SELECT 'kpis' as table_name, language, COUNT(*) as count FROM public.kpis GROUP BY language
UNION ALL
SELECT 'questions' as table_name, language, COUNT(*) as count FROM public.questions GROUP BY language
ORDER BY table_name, language;

-- ============================================================
-- ✅ SCHEMA UPDATE COMPLETE
-- ============================================================
