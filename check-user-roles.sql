-- Check all users and their roles to understand the role assignment issue
SELECT 
    id,
    email,
    role,
    company_code,
    company_name,
    created_at
FROM public.users 
ORDER BY created_at DESC;
