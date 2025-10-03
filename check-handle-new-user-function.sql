-- Check the handle_new_user() function that's causing the 500 error
-- This function is triggered when a user is created in auth.users

-- Get the function definition
SELECT 
    proname as function_name,
    prosrc as function_source,
    proargtypes,
    prorettype
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Check if the function exists and what it does
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';
