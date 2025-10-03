-- Fix user lookup policy for login
-- Drop existing policy to avoid conflicts
DROP POLICY IF EXISTS "Allow user lookup for login" ON public.users;

-- Create policy for SELECT: Allow anon and authenticated users to read users
-- This is necessary for the login validation step
CREATE POLICY "Allow user lookup for login"
ON public.users FOR SELECT
TO anon, authenticated
USING (true);

-- Verify the policy was created
SELECT 
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'users' 
AND policyname = 'Allow user lookup for login';
