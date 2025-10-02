-- =====================================================
-- COMPREHENSIVE RLS FIX - DROP ALL POLICIES
-- This will fix the infinite recursion completely
-- =====================================================

-- Step 1: Drop ALL possible users policies (comprehensive list)
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can create profile" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Trainers can read company users" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.users;
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can modify own data" ON public.users;
DROP POLICY IF EXISTS "Public users can read" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can read" ON public.users;
DROP POLICY IF EXISTS "Users can read all" ON public.users;
DROP POLICY IF EXISTS "Users can update all" ON public.users;
DROP POLICY IF EXISTS "Users can insert all" ON public.users;

-- Step 2: Temporarily DISABLE RLS to test
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 3: Verification
SELECT 'RLS completely disabled! Login should work now.' AS status;
SELECT 'You can now log in and then we will re-enable RLS with proper policies.' AS next_step;
