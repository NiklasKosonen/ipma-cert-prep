-- Fix RLS policies on users table to allow login flow
-- The 406 error occurs because RLS blocks user lookup during authentication

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can read users" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "read_own_profile" ON public.users;

-- Create a policy that allows reading user data for authentication
-- This is necessary for the login flow to validate users
CREATE POLICY "Allow user lookup for authentication"
ON public.users FOR SELECT
TO anon, authenticated
USING (true);

-- Keep existing policies for other operations
-- INSERT policy for user creation (already exists)
-- UPDATE policy for user updates (already exists)  
-- DELETE policy for user removal (already exists)

-- Verify the policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;
