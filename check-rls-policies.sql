-- =====================================================
-- CHECK RLS POLICIES ON ALL TABLES
-- Identify which tables have RLS enabled and what policies exist
-- =====================================================

-- Check RLS status on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('topics', 'subtopics', 'questions', 'kpis', 'company_codes', 'sample_answers', 'training_examples')
ORDER BY tablename;

-- Check all policies on content tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('topics', 'subtopics', 'questions', 'kpis', 'company_codes', 'sample_answers', 'training_examples')
ORDER BY tablename, policyname;

-- Check if there are any INSERT/UPDATE policies missing
SELECT 
    tablename,
    cmd,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('topics', 'subtopics', 'questions', 'kpis', 'company_codes', 'sample_answers', 'training_examples')
GROUP BY tablename, cmd
ORDER BY tablename, cmd;
