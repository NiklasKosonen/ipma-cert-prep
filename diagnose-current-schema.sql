-- =====================================================
-- COMPREHENSIVE SCHEMA DIAGNOSTIC
-- Run these queries to understand the current database foundation
-- DO NOT MODIFY ANYTHING - JUST INSPECT
-- =====================================================

-- 1. Check all tables in public schema
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check RLS status on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasrls as has_rls
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 3. Check all RLS policies
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
ORDER BY tablename, policyname;

-- 4. Check table structures (columns, types, constraints)
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;

-- 5. Check foreign key relationships
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 6. Check indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- 7. Check current data counts
SELECT 
    'topics' as table_name,
    COUNT(*) as row_count
FROM public.topics
UNION ALL
SELECT 
    'subtopics' as table_name,
    COUNT(*) as row_count
FROM public.subtopics
UNION ALL
SELECT 
    'questions' as table_name,
    COUNT(*) as row_count
FROM public.questions
UNION ALL
SELECT 
    'kpis' as table_name,
    COUNT(*) as row_count
FROM public.kpis
UNION ALL
SELECT 
    'company_codes' as table_name,
    COUNT(*) as row_count
FROM public.company_codes
UNION ALL
SELECT 
    'sample_answers' as table_name,
    COUNT(*) as row_count
FROM public.sample_answers
UNION ALL
SELECT 
    'training_examples' as table_name,
    COUNT(*) as row_count
FROM public.training_examples
UNION ALL
SELECT 
    'users' as table_name,
    COUNT(*) as row_count
FROM public.users
ORDER BY table_name;
