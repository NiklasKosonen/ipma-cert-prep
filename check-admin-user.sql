-- =====================================================
-- CHECK ADMIN USER IN SUPABASE AUTH
-- Run this to see if admin user exists in auth.users
-- =====================================================

-- Check if admin user exists in auth.users (Supabase Auth)
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'niklas.kosonen@talentnetwork.fi';

-- Check if admin user exists in public.users (our custom table)
SELECT 
  id,
  email,
  name,
  role,
  created_at
FROM public.users 
WHERE email = 'niklas.kosonen@talentnetwork.fi';

-- Check all users in auth.users
SELECT 
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
ORDER BY created_at DESC;
