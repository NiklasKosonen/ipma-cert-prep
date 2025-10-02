-- =====================================================
-- FIX USERS TABLE RLS - TEMPORARY DISABLE
-- Disable RLS on users table to fix login recursion
-- =====================================================

-- Step 1: Drop all policies on users table
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can create profile" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;

-- Step 2: Temporarily disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 3: Verify the change
SELECT 'RLS disabled on users table - login should work now!' AS status;
SELECT 'You can re-enable RLS later with proper policies.' AS note;
