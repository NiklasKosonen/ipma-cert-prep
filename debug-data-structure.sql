-- Debug Data Structure for IPMA Platform
-- This script helps understand the current data structure and relationships

-- 1. Check Topics
SELECT 
  'TOPICS' as table_name,
  id,
  title,
  description,
  is_active,
  created_at
FROM topics 
ORDER BY created_at;

-- 2. Check Subtopics and their Topic relationships
SELECT 
  'SUBTOPICS' as table_name,
  s.id,
  s.title,
  s.description,
  s.topic_id,
  t.title as topic_title,
  s.is_active,
  s.created_at
FROM subtopics s
LEFT JOIN topics t ON s.topic_id = t.id
ORDER BY t.title, s.title;

-- 3. Check KPIs and their Subtopic relationships
SELECT 
  'KPIS' as table_name,
  k.id,
  k.name,
  k.subtopic_id,
  s.title as subtopic_title,
  t.title as topic_title,
  k.is_essential,
  k.created_at
FROM kpis k
LEFT JOIN subtopics s ON k.subtopic_id = s.id
LEFT JOIN topics t ON s.topic_id = t.id
ORDER BY t.title, s.title, k.name;

-- 4. Check Questions and their relationships
SELECT 
  'QUESTIONS' as table_name,
  q.id,
  LEFT(q.prompt, 50) as prompt_preview,
  q.topic_id,
  q.subtopic_id,
  t.title as topic_title,
  s.title as subtopic_title,
  q.is_active,
  q.created_at
FROM questions q
LEFT JOIN topics t ON q.topic_id = t.id
LEFT JOIN subtopics s ON q.subtopic_id = s.id
ORDER BY t.title, s.title;

-- 5. Check Question-KPI relationships (NO KPI COLUMN EXISTS)
SELECT 
  'QUESTION_KPI_RELATIONSHIPS' as table_name,
  q.id as question_id,
  LEFT(q.prompt, 30) as question_preview,
  s.title as subtopic_title,
  t.title as topic_title,
  'NO KPI COLUMN' as connected_kpis,
  0 as kpi_count
FROM questions q
LEFT JOIN subtopics s ON q.subtopic_id = s.id
LEFT JOIN topics t ON s.topic_id = t.id
ORDER BY t.title, s.title;

-- 6. Summary Statistics
SELECT 
  'SUMMARY' as table_name,
  'Topics' as entity_type,
  COUNT(*) as count,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_count
FROM topics
UNION ALL
SELECT 
  'SUMMARY' as table_name,
  'Subtopics' as entity_type,
  COUNT(*) as count,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_count
FROM subtopics
UNION ALL
SELECT 
  'SUMMARY' as table_name,
  'KPIs' as entity_type,
  COUNT(*) as count,
  COUNT(CASE WHEN is_essential = true THEN 1 END) as essential_count
FROM kpis
UNION ALL
SELECT 
  'SUMMARY' as table_name,
  'Questions' as entity_type,
  COUNT(*) as count,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_count
FROM questions;

-- 7. Check for potential issues
SELECT 
  'ISSUES' as table_name,
  'Questions without subtopics' as issue_type,
  COUNT(*) as count
FROM questions 
WHERE subtopic_id IS NULL OR subtopic_id = ''

UNION ALL

SELECT 
  'ISSUES' as table_name,
  'Questions without KPIs (NO KPI COLUMN)' as issue_type,
  COUNT(*) as count
FROM questions

UNION ALL

SELECT 
  'ISSUES' as table_name,
  'KPIs without subtopics' as issue_type,
  COUNT(*) as count
FROM kpis 
WHERE subtopic_id IS NULL OR subtopic_id = ''

UNION ALL

SELECT 
  'ISSUES' as table_name,
  'Subtopics without topics' as issue_type,
  COUNT(*) as count
FROM subtopics 
WHERE topic_id IS NULL OR topic_id = '';

-- 8. Sample data for each topic to understand structure
SELECT 
  'SAMPLE_DATA' as table_name,
  t.title as topic_title,
  COUNT(DISTINCT s.id) as subtopic_count,
  COUNT(DISTINCT k.id) as kpi_count,
  COUNT(DISTINCT q.id) as question_count,
  STRING_AGG(DISTINCT s.title, ', ') as subtopic_titles
FROM topics t
LEFT JOIN subtopics s ON t.id = s.topic_id
LEFT JOIN kpis k ON s.id = k.subtopic_id
LEFT JOIN questions q ON s.id = q.subtopic_id
GROUP BY t.id, t.title
ORDER BY t.title;
