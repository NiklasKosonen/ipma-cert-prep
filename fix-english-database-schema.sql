-- ============================================================
-- FIX ENGLISH DATABASE SCHEMA
-- ============================================================
-- This script fixes missing columns in English database tables
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add missing connectedQuestions column to kpis_en table
ALTER TABLE public.kpis_en 
ADD COLUMN IF NOT EXISTS connected_questions JSONB DEFAULT '[]'::jsonb;

-- 2. Add missing columns to topics_en table (if any)
ALTER TABLE public.topics_en 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 3. Add missing columns to subtopics_en table (if any)  
ALTER TABLE public.subtopics_en 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 4. Add missing columns to questions_en table (if any)
ALTER TABLE public.questions_en 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 5. Verify all columns exist
SELECT 
  'topics_en' as table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'topics_en'
ORDER BY ordinal_position;

SELECT 
  'subtopics_en' as table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'subtopics_en'
ORDER BY ordinal_position;

SELECT 
  'kpis_en' as table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'kpis_en'
ORDER BY ordinal_position;

SELECT 
  'questions_en' as table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'questions_en'
ORDER BY ordinal_position;

-- ============================================================
-- ✅ SCHEMA FIX COMPLETE
-- ============================================================
