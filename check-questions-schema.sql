-- Check the actual column names in the questions table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'questions'
ORDER BY ordinal_position;

-- Also check if there are any columns with 'kpi' in the name
SELECT 
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'questions'
  AND column_name ILIKE '%kpi%';

-- Check the actual structure of a few sample questions
SELECT 
  id,
  prompt,
  topic_id,
  subtopic_id,
  is_active,
  created_at
FROM questions 
LIMIT 5;
