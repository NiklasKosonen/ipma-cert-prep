-- ============================================================
-- STEP 3: LINK QUESTIONS TO KPIS (ENGLISH)
-- ============================================================
-- This automatically links English questions to their English KPIs
-- Execution time: ~2 seconds
-- ============================================================

-- Link English questions to English KPIs based on subtopics
UPDATE public.questions_en 
SET connectedkpis = (
  SELECT jsonb_agg(k.id)
  FROM public.kpis_en k
  WHERE k.subtopic_id = questions_en.subtopic_id
)
WHERE connectedkpis = '[]'::jsonb OR connectedkpis IS NULL;

-- ============================================================
-- VERIFICATION: Check that questions have KPIs linked
-- ============================================================
SELECT 
  q.id,
  LEFT(q.prompt, 50) as question_preview,
  s.title as subtopic,
  t.title as topic,
  jsonb_array_length(q.connectedkpis) as kpi_count
FROM public.questions_en q
LEFT JOIN public.subtopics_en s ON q.subtopic_id = s.id
LEFT JOIN public.topics_en t ON s.topic_id = t.id
ORDER BY t.title, s.title;

-- Check for questions without KPIs (these need attention)
SELECT 
  'Questions without KPIs' as issue,
  COUNT(*) as count
FROM public.questions_en
WHERE jsonb_array_length(connectedkpis) = 0 OR connectedkpis IS NULL;

-- ============================================================
-- ✅ STEP 3 COMPLETE - English database is ready!
-- Now translate the [TRANSLATE] prefixed content
-- ============================================================
