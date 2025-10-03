-- Final fix for RLS policies on public.users table
-- This allows users to update their own profiles and admins to update any profile

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow user lookup for login" ON public.users;
DROP POLICY IF EXISTS "Allow user creation" ON public.users;
DROP POLICY IF EXISTS "Allow user updates" ON public.users;
DROP POLICY IF EXISTS "Allow user deletion" ON public.users;
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

-- Policy 1: Allow anon and authenticated users to read users (needed for login)
CREATE POLICY "Allow user lookup for login"
ON public.users FOR SELECT
TO anon, authenticated
USING (true);

-- Policy 2: Allow authenticated users to insert user profiles (needed for user creation)
CREATE POLICY "Allow user creation"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 3: Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid()::text = id::text)
WITH CHECK (auth.uid()::text = id::text);

-- Policy 4: Allow admins to update any user profile
CREATE POLICY "Admins can update any profile"
ON public.users FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid()::text 
    AND u.role = 'admin'
  )
)
WITH CHECK (true);

-- Policy 5: Allow authenticated users to delete user profiles (needed for user removal)
CREATE POLICY "Allow user deletion"
ON public.users FOR DELETE
TO authenticated
USING (true);

-- Verify the policies were created
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;
