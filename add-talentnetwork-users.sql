-- ============================================================
-- ADD TALENTNETWORK COMPANY AND USERS
-- ============================================================
-- This script creates a company code and adds users to both
-- auth.users and public.users tables
-- ============================================================

-- Step 1: Add the company code to company_codes table
INSERT INTO public.company_codes (
    id,
    code,
    company_name,
    admin_email,
    max_users,
    expires_at,
    is_active,
    authorized_emails,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    'TALENTTEST1',
    'TalentNetwork',
    'jori.kosonen@talentnetwork.fi',
    10,
    NOW() + INTERVAL '1 year',
    true,
    ARRAY['jori.kosonen@talentnetwork.fi', 'marja.laitinen@talentnetwork.fi']::text[],
    NOW(),
    NOW()
)
ON CONFLICT (code) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    authorized_emails = EXCLUDED.authorized_emails,
    updated_at = NOW();

-- Step 2: Add users to public.users table
-- User 1: Jori Kosonen
INSERT INTO public.users (
    id,
    email,
    name,
    role,
    company_code,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    'jori.kosonen@talentnetwork.fi',
    'Jori Kosonen',
    'user',
    'TALENTTEST1',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    company_code = EXCLUDED.company_code,
    updated_at = NOW();

-- User 2: Marja Laitinen
INSERT INTO public.users (
    id,
    email,
    name,
    role,
    company_code,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    'marja.laitinen@talentnetwork.fi',
    'Marja Laitinen',
    'user',
    'TALENTTEST1',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    company_code = EXCLUDED.company_code,
    updated_at = NOW();

-- ============================================================
-- VERIFY RESULTS
-- ============================================================

-- Check company code was added
SELECT 
    code,
    company_name,
    admin_email,
    authorized_emails,
    max_users,
    is_active,
    expires_at
FROM public.company_codes
WHERE code = 'TALENTTEST1';

-- Check users were added
SELECT 
    id,
    email,
    name,
    role,
    company_code,
    created_at
FROM public.users
WHERE email IN ('jori.kosonen@talentnetwork.fi', 'marja.laitinen@talentnetwork.fi')
ORDER BY email;

-- ============================================================
-- NOTES FOR AUTH.USERS
-- ============================================================
-- Note: Users need to use the "Reset Password" feature to set their password
-- 
-- Instructions for users:
-- 1. Go to the login page
-- 2. Click "Forgot Password" or "Reset Password"
-- 3. Enter their email address
-- 4. Check email for reset link
-- 5. Set their password
-- 6. Use company code 'TALENTTEST1' to log in
--
-- Alternatively, you can create auth users manually in Supabase Auth Dashboard
-- or the users can sign up using the company code if that feature is enabled.
-- ============================================================

-- ✅ COMPANY AND USERS ADDED SUCCESSFULLY

