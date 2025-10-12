-- ============================================================
-- MIGRATE EXISTING DATA FROM SEPARATE ENGLISH TABLES
-- ============================================================
-- This script migrates data from topics_en, subtopics_en, etc.
-- to the unified tables with language column
-- ============================================================

-- First, ensure language columns exist
ALTER TABLE public.topics 
ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'fi' CHECK (language IN ('fi', 'en'));

ALTER TABLE public.subtopics 
ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'fi' CHECK (language IN ('fi', 'en'));

ALTER TABLE public.kpis
ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'fi' CHECK (language IN ('fi', 'en'));

ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'fi' CHECK (language IN ('fi', 'en'));

ALTER TABLE public.training_examples 
ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'fi' CHECK (language IN ('fi', 'en'));

ALTER TABLE public.ai_evaluation_criteria 
ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'fi' CHECK (language IN ('fi', 'en'));

-- Set default language for existing records
UPDATE public.topics SET language = 'fi' WHERE language IS NULL;
UPDATE public.subtopics SET language = 'fi' WHERE language IS NULL;
UPDATE public.kpis SET language = 'fi' WHERE language IS NULL;
UPDATE public.questions SET language = 'fi' WHERE language IS NULL;
UPDATE public.training_examples SET language = 'fi' WHERE language IS NULL;
UPDATE public.ai_evaluation_criteria SET language = 'fi' WHERE language IS NULL;

-- ============================================================
-- MIGRATE ENGLISH DATA TO UNIFIED TABLES
-- ============================================================

-- Check if English tables exist before migrating
DO $$
BEGIN
    -- Migrate topics_en to topics with language='en'
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'topics_en') THEN
        INSERT INTO public.topics (id, title, description, is_active, language, created_at, updated_at)
        SELECT id, title, description, is_active, 'en' as language, created_at, updated_at
        FROM public.topics_en
        ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            is_active = EXCLUDED.is_active,
            language = 'en',
            updated_at = EXCLUDED.updated_at;
        
        RAISE NOTICE 'Migrated topics_en to topics with language=en';
    ELSE
        RAISE NOTICE 'Table topics_en does not exist, skipping migration';
    END IF;

    -- Migrate subtopics_en to subtopics with language='en'
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subtopics_en') THEN
        INSERT INTO public.subtopics (id, topic_id, title, description, is_active, language, created_at, updated_at)
        SELECT id, topic_id, title, description, is_active, 'en' as language, created_at, updated_at
        FROM public.subtopics_en
        ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            is_active = EXCLUDED.is_active,
            language = 'en',
            updated_at = EXCLUDED.updated_at;
        
        RAISE NOTICE 'Migrated subtopics_en to subtopics with language=en';
    ELSE
        RAISE NOTICE 'Table subtopics_en does not exist, skipping migration';
    END IF;

    -- Migrate kpis_en to kpis with language='en'
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kpis_en') THEN
        INSERT INTO public.kpis (id, name, description, is_active, language, created_at, updated_at, topic_id, subtopic_id, is_essential, connected_questions)
        SELECT id, name, description, is_active, 'en' as language, created_at, updated_at,
               topic_id, subtopic_id, is_essential, connected_questions
        FROM public.kpis_en
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            is_active = EXCLUDED.is_active,
            language = 'en',
            topic_id = EXCLUDED.topic_id,
            subtopic_id = EXCLUDED.subtopic_id,
            is_essential = EXCLUDED.is_essential,
            connected_questions = EXCLUDED.connected_questions,
            updated_at = EXCLUDED.updated_at;
        
        RAISE NOTICE 'Migrated kpis_en to kpis with language=en';
    ELSE
        RAISE NOTICE 'Table kpis_en does not exist, skipping migration';
    END IF;

    -- Migrate questions_en to questions with language='en'
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'questions_en') THEN
        INSERT INTO public.questions (id, topic_id, subtopic_id, prompt, difficulty_level, time_limit, is_active, language, created_at, updated_at)
        SELECT id, topic_id, subtopic_id, prompt, difficulty_level, time_limit, is_active, 'en' as language, created_at, updated_at
        FROM public.questions_en
        ON CONFLICT (id) DO UPDATE SET
            prompt = EXCLUDED.prompt,
            difficulty_level = EXCLUDED.difficulty_level,
            time_limit = EXCLUDED.time_limit,
            is_active = EXCLUDED.is_active,
            language = 'en',
            updated_at = EXCLUDED.updated_at;
        
        RAISE NOTICE 'Migrated questions_en to questions with language=en';
    ELSE
        RAISE NOTICE 'Table questions_en does not exist, skipping migration';
    END IF;

    -- Migrate training_examples_en to training_examples with language='en'
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'training_examples_en') THEN
        INSERT INTO public.training_examples (id, question_id, answer_text, quality_score, feedback, is_active, language, created_at, updated_at)
        SELECT id, question_id, answer_text, quality_score, feedback, is_active, 'en' as language, created_at, updated_at
        FROM public.training_examples_en
        ON CONFLICT (id) DO UPDATE SET
            answer_text = EXCLUDED.answer_text,
            quality_score = EXCLUDED.quality_score,
            feedback = EXCLUDED.feedback,
            is_active = EXCLUDED.is_active,
            language = 'en',
            updated_at = EXCLUDED.updated_at;
        
        RAISE NOTICE 'Migrated training_examples_en to training_examples with language=en';
    ELSE
        RAISE NOTICE 'Table training_examples_en does not exist, skipping migration';
    END IF;

    -- Migrate ai_evaluation_criteria_en to ai_evaluation_criteria with language='en'
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_evaluation_criteria_en') THEN
        INSERT INTO public.ai_evaluation_criteria (id, language, criteria_text, is_active, created_at, updated_at)
        SELECT id, 'en' as language, criteria_text, is_active, created_at, updated_at
        FROM public.ai_evaluation_criteria_en
        ON CONFLICT (id) DO UPDATE SET
            criteria_text = EXCLUDED.criteria_text,
            is_active = EXCLUDED.is_active,
            language = 'en',
            updated_at = EXCLUDED.updated_at;
        
        RAISE NOTICE 'Migrated ai_evaluation_criteria_en to ai_evaluation_criteria with language=en';
    ELSE
        RAISE NOTICE 'Table ai_evaluation_criteria_en does not exist, skipping migration';
    END IF;
END $$;

-- ============================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_topics_language ON public.topics(language);
CREATE INDEX IF NOT EXISTS idx_subtopics_language ON public.subtopics(language);
CREATE INDEX IF NOT EXISTS idx_kpis_language ON public.kpis(language);
CREATE INDEX IF NOT EXISTS idx_questions_language ON public.questions(language);
CREATE INDEX IF NOT EXISTS idx_training_examples_language ON public.training_examples(language);
CREATE INDEX IF NOT EXISTS idx_ai_evaluation_criteria_language ON public.ai_evaluation_criteria(language);

-- ============================================================
-- VERIFY MIGRATION RESULTS
-- ============================================================

-- Check language distribution
SELECT 'topics' as table_name, language, COUNT(*) as count FROM public.topics GROUP BY language
UNION ALL
SELECT 'subtopics' as table_name, language, COUNT(*) as count FROM public.subtopics GROUP BY language
UNION ALL
SELECT 'kpis' as table_name, language, COUNT(*) as count FROM public.kpis GROUP BY language
UNION ALL
SELECT 'questions' as table_name, language, COUNT(*) as count FROM public.questions GROUP BY language
UNION ALL
SELECT 'training_examples' as table_name, language, COUNT(*) as count FROM public.training_examples GROUP BY language
UNION ALL
SELECT 'ai_evaluation_criteria' as table_name, language, COUNT(*) as count FROM public.ai_evaluation_criteria GROUP BY language
ORDER BY table_name, language;

-- ============================================================
-- CLEANUP OLD ENGLISH TABLES (OPTIONAL)
-- ============================================================
-- Uncomment these lines to remove the old English tables after migration
-- WARNING: Only run this after verifying the migration was successful!

-- DROP TABLE IF EXISTS public.topics_en CASCADE;
-- DROP TABLE IF EXISTS public.subtopics_en CASCADE;
-- DROP TABLE IF EXISTS public.kpis_en CASCADE;
-- DROP TABLE IF EXISTS public.questions_en CASCADE;
-- DROP TABLE IF EXISTS public.training_examples_en CASCADE;
-- DROP TABLE IF EXISTS public.ai_evaluation_criteria_en CASCADE;

-- ============================================================
-- ✅ MIGRATION COMPLETE
-- ============================================================
