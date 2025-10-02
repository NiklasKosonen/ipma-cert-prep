-- =====================================================
-- CHECK CURRENT RLS POLICIES
-- See what policies exist and identify the recursion source
-- =====================================================

-- Check all policies on users table
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
WHERE tablename = 'users' 
ORDER BY policyname;

-- Check if there are any policies that reference other tables
SELECT 
    schemaname,
    tablename,
    policyname,
    qual,
    with_check
FROM pg_policies 
WHERE qual LIKE '%users%' OR with_check LIKE '%users%'
ORDER BY tablename, policyname;

-- Check the users table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
