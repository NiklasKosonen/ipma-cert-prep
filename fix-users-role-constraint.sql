-- Check current role constraint on users table
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname LIKE '%role%' 
AND conrelid = 'public.users'::regclass;

-- Drop the existing role constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Create a new constraint that allows 'user', 'admin', 'trainer', 'trainee'
ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('user', 'admin', 'trainer', 'trainee'));

-- Verify the constraint was updated
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'users_role_check' 
AND conrelid = 'public.users'::regclass;
