-- Comprehensive Fix for Question Selection Issues
-- This script addresses both the missing KPI column and question-subtopic linking

-- 1. Add the missing connectedKPIs column
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS connectedkpis JSONB DEFAULT '[]'::jsonb;

-- 2. Check current question-subtopic relationships
SELECT 
  'CURRENT_QUESTION_SUBTOPIC_LINKS' as table_name,
  q.id as question_id,
  LEFT(q.prompt, 40) as question_preview,
  q.subtopic_id,
  s.title as subtopic_title,
  t.title as topic_title,
  q.connectedkpis
FROM questions q
LEFT JOIN subtopics s ON q.subtopic_id = s.id
LEFT JOIN topics t ON s.topic_id = t.id
ORDER BY t.title, s.title;

-- 3. Check if questions have proper subtopic links
SELECT 
  'QUESTIONS_WITHOUT_SUBTOPIC' as table_name,
  COUNT(*) as count
FROM questions 
WHERE subtopic_id IS NULL OR subtopic_id = '';

-- 4. Show subtopic structure for debugging
SELECT 
  'SUBTOPIC_STRUCTURE' as table_name,
  t.title as topic_title,
  s.title as subtopic_title,
  s.id as subtopic_id,
  COUNT(q.id) as question_count
FROM topics t
LEFT JOIN subtopics s ON t.id = s.topic_id
LEFT JOIN questions q ON s.id = q.subtopic_id
GROUP BY t.id, t.title, s.id, s.title
ORDER BY t.title, s.title;

-- 5. Link questions to KPIs from their subtopics
UPDATE questions 
SET connectedkpis = (
  SELECT jsonb_agg(k.id)
  FROM kpis k
  WHERE k.subtopic_id = questions.subtopic_id
)
WHERE connectedkpis = '[]'::jsonb OR connectedkpis IS NULL;

-- 6. Verify the fix worked
SELECT 
  'FIXED_QUESTIONS' as table_name,
  q.id as question_id,
  LEFT(q.prompt, 40) as question_preview,
  s.title as subtopic_title,
  t.title as topic_title,
  q.connectedkpis,
  jsonb_array_length(q.connectedkpis) as kpi_count
FROM questions q
LEFT JOIN subtopics s ON q.subtopic_id = s.id
LEFT JOIN topics t ON s.topic_id = t.id
ORDER BY t.title, s.title;

-- 7. Test question selection logic
-- This simulates what the app does
WITH topic_subtopics AS (
  SELECT s.id, s.title, s.topic_id
  FROM subtopics s
  WHERE s.topic_id = (SELECT id FROM topics LIMIT 1) -- Use first topic
    AND s.is_active = true
),
selected_questions AS (
  SELECT 
    ts.title as subtopic_title,
    q.id as question_id,
    LEFT(q.prompt, 30) as question_preview,
    jsonb_array_length(q.connectedkpis) as kpi_count
  FROM topic_subtopics ts
  LEFT JOIN questions q ON ts.id = q.subtopic_id AND q.is_active = true
  WHERE q.id IS NOT NULL
)
SELECT 
  'QUESTION_SELECTION_TEST' as table_name,
  subtopic_title,
  question_id,
  question_preview,
  kpi_count
FROM selected_questions
ORDER BY subtopic_title;
