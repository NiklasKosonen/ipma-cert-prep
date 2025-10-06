-- ============================================================
-- STEP 2: COPY STRUCTURE FROM FINNISH TO ENGLISH
-- ============================================================
-- This copies your existing Finnish data and adds [TRANSLATE] prefix
-- Then you simply edit the data in the admin panel
-- Execution time: ~5 seconds
-- ============================================================

-- 1. Copy Topics (Finnish → English with [TRANSLATE] prefix)
INSERT INTO public.topics_en (id, title, description, is_active, created_at, updated_at)
SELECT 
  id || '_en' as id,  -- Add _en suffix to avoid ID conflicts
  '[TRANSLATE] ' || title as title,
  description,
  is_active,
  created_at,
  updated_at
FROM public.topics
WHERE is_active = true
ON CONFLICT (id) DO NOTHING;

-- 2. Copy Subtopics (Finnish → English with [TRANSLATE] prefix)
INSERT INTO public.subtopics_en (id, title, description, topic_id, is_active, created_at, updated_at)
SELECT 
  s.id || '_en' as id,
  '[TRANSLATE] ' || s.title as title,
  s.description,
  s.topic_id || '_en' as topic_id,  -- Link to English topics
  s.is_active,
  s.created_at,
  s.updated_at
FROM public.subtopics s
JOIN public.topics t ON s.topic_id = t.id
WHERE s.is_active = true AND t.is_active = true
ON CONFLICT (id) DO NOTHING;

-- 3. Copy KPIs (Finnish → English with [TRANSLATE] prefix)
INSERT INTO public.kpis_en (id, name, description, is_essential, topic_id, subtopic_id, created_at, updated_at)
SELECT 
  k.id || '_en' as id,
  '[TRANSLATE] ' || k.name as name,
  k.description,
  k.is_essential,
  k.topic_id || '_en' as topic_id,
  k.subtopic_id || '_en' as subtopic_id,
  k.created_at,
  k.updated_at
FROM public.kpis k
JOIN public.subtopics s ON k.subtopic_id = s.id
JOIN public.topics t ON s.topic_id = t.id
WHERE s.is_active = true AND t.is_active = true
ON CONFLICT (id) DO NOTHING;

-- 4. Copy Questions (Finnish → English with [TRANSLATE] prefix)
INSERT INTO public.questions_en (id, prompt, topic_id, subtopic_id, connectedkpis, is_active, created_at, updated_at)
SELECT 
  q.id || '_en' as id,
  '[TRANSLATE] ' || q.prompt as prompt,
  q.topic_id || '_en' as topic_id,
  q.subtopic_id || '_en' as subtopic_id,
  '[]'::jsonb as connectedkpis,  -- Will be linked in STEP 3
  q.is_active,
  q.created_at,
  q.updated_at
FROM public.questions q
JOIN public.subtopics s ON q.subtopic_id = s.id
JOIN public.topics t ON s.topic_id = t.id
WHERE q.is_active = true AND s.is_active = true AND t.is_active = true
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- VERIFICATION: Check that data was copied
-- ============================================================
SELECT 
  'Topics (EN)' as table_name,
  COUNT(*) as row_count
FROM public.topics_en
UNION ALL
SELECT 
  'Subtopics (EN)',
  COUNT(*)
FROM public.subtopics_en
UNION ALL
SELECT 
  'KPIs (EN)',
  COUNT(*)
FROM public.kpis_en
UNION ALL
SELECT 
  'Questions (EN)',
  COUNT(*)
FROM public.questions_en;

-- View the data that needs translation
SELECT 
  'TOPICS TO TRANSLATE' as category,
  id,
  title,
  description
FROM public.topics_en
ORDER BY id;

-- ============================================================
-- ✅ STEP 2 COMPLETE - Proceed to STEP 3
-- ============================================================
