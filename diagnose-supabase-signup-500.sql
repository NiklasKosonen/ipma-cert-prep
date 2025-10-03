-- Check Supabase Auth configuration and settings that might cause 500 errors
-- This will help identify why supabase.auth.signUp is failing

-- Check if there are any auth-related triggers or functions that might be interfering
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND (trigger_name LIKE '%auth%' OR trigger_name LIKE '%user%')
ORDER BY trigger_name;

-- Check for any custom auth functions
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname LIKE '%auth%' 
OR proname LIKE '%signup%'
OR proname LIKE '%user%'
LIMIT 10;

-- Check current auth settings (these might need to be checked in Supabase Dashboard)
SELECT 'Check Supabase Dashboard -> Authentication -> Settings for:' as instruction
UNION ALL
SELECT '- Enable email confirmations (should be OFF for testing)'
UNION ALL  
SELECT '- Disable email signup (should be OFF)'
UNION ALL
SELECT '- Allow new users to sign up (should be ON)'
UNION ALL
SELECT '- Password security settings'
UNION ALL
SELECT '- Custom SMTP settings (if any)';
