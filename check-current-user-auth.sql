-- Check current authenticated user and their role
SELECT 
  auth.uid() as current_auth_uid,
  auth.email() as current_auth_email;

-- Check if user exists in public.users table
SELECT 
  id,
  email,
  role,
  company_code,
  company_name
FROM public.users 
WHERE id = auth.uid();
