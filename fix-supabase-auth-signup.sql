-- Check Supabase Auth configuration issues
-- This might help identify the problem

-- Check if there are any custom auth settings or triggers
SELECT 
    setting_name,
    setting_value
FROM pg_settings 
WHERE setting_name LIKE '%auth%' 
OR setting_name LIKE '%supabase%';

-- Check for any auth-related functions or triggers
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname LIKE '%auth%' 
OR prosrc LIKE '%auth%'
LIMIT 10;

