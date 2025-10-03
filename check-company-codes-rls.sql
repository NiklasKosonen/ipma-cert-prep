-- Check current RLS policies on company_codes table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'company_codes' 
ORDER BY policyname;