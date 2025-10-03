-- Complete fix for users table RLS policies
-- This will fix the permission denied errors and allow proper user creation

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Admin can manage all users" ON public.users;
DROP POLICY IF EXISTS "Allow user lookup for authentication" ON public.users;
DROP POLICY IF EXISTS "Allow user profile updates during creation" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can delete users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can insert users" ON public.users;
DROP POLICY IF EXISTS "insert_own_profile" ON public.users;
DROP POLICY IF EXISTS "read_own_profile" ON public.users;
DROP POLICY IF EXISTS "update_own_profile" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can create profile" ON public.users;

-- Create simple, permissive policies that work
-- Allow anon and authenticated users to read users (needed for login)
CREATE POLICY "Allow user lookup for login"
ON public.users FOR SELECT
TO anon, authenticated
USING (true);

-- Allow authenticated users to insert users (needed for user creation)
CREATE POLICY "Allow user creation"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update users (needed for profile updates)
CREATE POLICY "Allow user updates"
ON public.users FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete users (needed for user removal)
CREATE POLICY "Allow user deletion"
ON public.users FOR DELETE
TO authenticated
USING (true);

-- Verify the policies were created
SELECT 
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;
