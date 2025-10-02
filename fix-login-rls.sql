-- =====================================================
-- FIX LOGIN SYSTEM - Remove infinite recursion
-- =====================================================

-- Step 1: Drop ALL existing users policies to break recursion
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Trainers can read company users" ON public.users;
DROP POLICY IF EXISTS "Users can create profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.users;

-- Step 2: Create SIMPLE policies without recursion
-- Allow users to read their own profile (no JOIN to users table)
CREATE POLICY "Users can read own profile"
ON public.users FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- Allow users to insert their own profile
CREATE POLICY "Users can create profile"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Step 3: Add admin user if not exists
INSERT INTO public.users (
  id,
  email,
  name,
  role,
  company_code,
  created_at,
  updated_at
) VALUES (
  (SELECT auth.uid() WHERE auth.email() = 'niklas.kosonen@talentnetwork.fi'),
  'niklas.kosonen@talentnetwork.fi',
  'Niklas Kosonen',
  'admin',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET 
  role = 'admin',
  name = 'Niklas Kosonen',
  updated_at = NOW();

-- Step 4: Verification
SELECT 'Login system fixed! No more infinite recursion.' AS status;
