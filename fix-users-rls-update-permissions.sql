-- Fix RLS policies to allow updates to users table
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can read users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can insert users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can update users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can delete users" ON public.users;
DROP POLICY IF EXISTS "Allow user lookup for login" ON public.users;

-- Create comprehensive policies for users table
-- Allow authenticated users to read any user profile (needed for admin functions)
CREATE POLICY "Authenticated users can read users"
ON public.users FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert user profiles (needed for user creation)
CREATE POLICY "Authenticated users can insert users"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update any user profile (needed for admin functions)
CREATE POLICY "Authenticated users can update users"
ON public.users FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete user profiles (needed for user removal)
CREATE POLICY "Authenticated users can delete users"
ON public.users FOR DELETE
TO authenticated
USING (true);

-- Allow anonymous users to read users for login validation
CREATE POLICY "Allow user lookup for login"
ON public.users FOR SELECT
TO anon, authenticated
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
