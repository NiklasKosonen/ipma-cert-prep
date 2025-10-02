-- =====================================================
-- TEST SUPABASE CONNECTION AND RLS
-- Check if we can insert data directly into tables
-- =====================================================

-- Test 1: Check if we can insert into topics table
INSERT INTO public.topics (id, title, description, is_active, created_at, updated_at)
VALUES (
  'test_topic_' || extract(epoch from now()),
  'Test Topic',
  'This is a test topic to verify RLS policies',
  true,
  now(),
  now()
);

-- Test 2: Check if we can insert into subtopics table
INSERT INTO public.subtopics (id, topic_id, title, description, is_active, created_at, updated_at)
VALUES (
  'test_subtopic_' || extract(epoch from now()),
  'test_topic_' || extract(epoch from now()),
  'Test Subtopic',
  'This is a test subtopic to verify RLS policies',
  true,
  now(),
  now()
);

-- Test 3: Check if we can insert into questions table
INSERT INTO public.questions (id, topic_id, subtopic_id, prompt, is_active, created_at, updated_at)
VALUES (
  'test_question_' || extract(epoch from now()),
  'test_topic_' || extract(epoch from now()),
  'test_subtopic_' || extract(epoch from now()),
  'This is a test question to verify RLS policies',
  true,
  now(),
  now()
);

-- Test 4: Check if we can insert into kpis table
INSERT INTO public.kpis (id, topic_id, subtopic_id, name, is_essential, created_at, updated_at)
VALUES (
  'test_kpi_' || extract(epoch from now()),
  'test_topic_' || extract(epoch from now()),
  'test_subtopic_' || extract(epoch from now()),
  'Test KPI',
  false,
  now(),
  now()
);

-- Verification: Check if test data was inserted
SELECT 'Test data insertion completed!' AS status;
SELECT 'Check the tables to see if data was inserted successfully.' AS note;
