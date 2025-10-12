-- ============================================================
-- FIX FOREIGN KEY RELATIONSHIP FOR ATTEMPT_ITEMS
-- ============================================================
-- This fixes the PGRST200 error by ensuring proper foreign key
-- relationships between attempt_items and attempts tables
-- ============================================================

-- Drop existing foreign key if it exists (to recreate properly)
ALTER TABLE IF EXISTS public.attempt_items 
DROP CONSTRAINT IF EXISTS attempt_items_attempt_id_fkey;

-- Add proper foreign key constraint with CASCADE
ALTER TABLE public.attempt_items
ADD CONSTRAINT attempt_items_attempt_id_fkey 
FOREIGN KEY (attempt_id) 
REFERENCES public.attempts(id) 
ON DELETE CASCADE;

-- Verify the constraint exists
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='attempt_items'
  AND kcu.column_name='attempt_id';

-- ============================================================
-- FIX ENGLISH TABLES FOREIGN KEY RELATIONSHIPS
-- ============================================================

-- Fix subtopics_en -> topics_en
ALTER TABLE IF EXISTS public.subtopics_en 
DROP CONSTRAINT IF EXISTS subtopics_en_topic_id_fkey;

ALTER TABLE public.subtopics_en
ADD CONSTRAINT subtopics_en_topic_id_fkey 
FOREIGN KEY (topic_id) 
REFERENCES public.topics_en(id) 
ON DELETE CASCADE;

-- Fix kpis_en -> topics_en
ALTER TABLE IF EXISTS public.kpis_en 
DROP CONSTRAINT IF EXISTS kpis_en_topic_id_fkey;

ALTER TABLE public.kpis_en
ADD CONSTRAINT kpis_en_topic_id_fkey 
FOREIGN KEY (topic_id) 
REFERENCES public.topics_en(id) 
ON DELETE CASCADE;

-- Fix kpis_en -> subtopics_en
ALTER TABLE IF EXISTS public.kpis_en 
DROP CONSTRAINT IF EXISTS kpis_en_subtopic_id_fkey;

ALTER TABLE public.kpis_en
ADD CONSTRAINT kpis_en_subtopic_id_fkey 
FOREIGN KEY (subtopic_id) 
REFERENCES public.subtopics_en(id) 
ON DELETE CASCADE;

-- Fix questions_en -> topics_en
ALTER TABLE IF EXISTS public.questions_en 
DROP CONSTRAINT IF EXISTS questions_en_topic_id_fkey;

ALTER TABLE public.questions_en
ADD CONSTRAINT questions_en_topic_id_fkey 
FOREIGN KEY (topic_id) 
REFERENCES public.topics_en(id) 
ON DELETE CASCADE;

-- Fix questions_en -> subtopics_en
ALTER TABLE IF EXISTS public.questions_en 
DROP CONSTRAINT IF EXISTS questions_en_subtopic_id_fkey;

ALTER TABLE public.questions_en
ADD CONSTRAINT questions_en_subtopic_id_fkey 
FOREIGN KEY (subtopic_id) 
REFERENCES public.subtopics_en(id) 
ON DELETE CASCADE;

-- ============================================================
-- ADD INDEXES FOR BETTER QUERY PERFORMANCE
-- ============================================================

-- Index for attempt_items lookups by attempt_id
CREATE INDEX IF NOT EXISTS idx_attempt_items_attempt_id 
ON public.attempt_items(attempt_id);

-- Index for attempt_items lookups by user (via attempts join)
CREATE INDEX IF NOT EXISTS idx_attempts_user_id 
ON public.attempts(user_id);

-- Index for English tables
CREATE INDEX IF NOT EXISTS idx_subtopics_en_topic_id 
ON public.subtopics_en(topic_id);

CREATE INDEX IF NOT EXISTS idx_questions_en_subtopic_id 
ON public.questions_en(subtopic_id);

CREATE INDEX IF NOT EXISTS idx_kpis_en_subtopic_id 
ON public.kpis_en(subtopic_id);

-- ============================================================
-- ✅ SCHEMA FIX COMPLETE
-- ============================================================
