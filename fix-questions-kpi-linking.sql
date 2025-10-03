-- Fix Questions-KPI Linking
-- This script adds the missing connectedKPIs column and links questions to KPIs

-- 1. Add the connectedKPIs column to questions table
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS connectedkpis JSONB DEFAULT '[]'::jsonb;

-- 2. Check current structure
SELECT 
  'CURRENT_QUESTIONS' as table_name,
  q.id,
  LEFT(q.prompt, 40) as question_preview,
  s.title as subtopic_title,
  t.title as topic_title,
  q.connectedkpis
FROM questions q
LEFT JOIN subtopics s ON q.subtopic_id = s.id
LEFT JOIN topics t ON s.topic_id = t.id
ORDER BY t.title, s.title;

-- 3. Check available KPIs for each subtopic
SELECT 
  'AVAILABLE_KPIS' as table_name,
  s.title as subtopic_title,
  t.title as topic_title,
  k.id as kpi_id,
  k.name as kpi_name
FROM subtopics s
LEFT JOIN topics t ON s.topic_id = t.id
LEFT JOIN kpis k ON s.id = k.subtopic_id
ORDER BY t.title, s.title, k.name;

-- 4. Link questions to KPIs from their subtopics
-- This will automatically link each question to all KPIs from its subtopic
UPDATE questions 
SET connectedkpis = (
  SELECT jsonb_agg(k.id)
  FROM kpis k
  WHERE k.subtopic_id = questions.subtopic_id
)
WHERE connectedkpis = '[]'::jsonb OR connectedkpis IS NULL;

-- 5. Verify the linking worked
SELECT 
  'UPDATED_QUESTIONS' as table_name,
  q.id,
  LEFT(q.prompt, 40) as question_preview,
  s.title as subtopic_title,
  t.title as topic_title,
  q.connectedkpis,
  jsonb_array_length(q.connectedkpis) as kpi_count
FROM questions q
LEFT JOIN subtopics s ON q.subtopic_id = s.id
LEFT JOIN topics t ON s.topic_id = t.id
ORDER BY t.title, s.title;

-- 6. Show the complete structure
SELECT 
  'COMPLETE_STRUCTURE' as table_name,
  t.title as topic_title,
  s.title as subtopic_title,
  COUNT(DISTINCT q.id) as question_count,
  COUNT(DISTINCT k.id) as kpi_count,
  STRING_AGG(DISTINCT k.name, ', ') as kpi_names
FROM topics t
LEFT JOIN subtopics s ON t.id = s.topic_id
LEFT JOIN questions q ON s.id = q.subtopic_id
LEFT JOIN kpis k ON s.id = k.subtopic_id
GROUP BY t.id, t.title, s.id, s.title
ORDER BY t.title, s.title;
