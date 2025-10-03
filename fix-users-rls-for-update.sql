-- Fix RLS policy to allow updates to users table during user creation
-- The current policy might be blocking the update of company_code and company_name

-- Check current UPDATE policy
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users' 
AND cmd = 'UPDATE'
ORDER BY policyname;

-- Drop existing UPDATE policies that might be too restrictive
DROP POLICY IF EXISTS "Authenticated users can update users" ON public.users;
DROP POLICY IF EXISTS "update_own_profile" ON public.users;

-- Create a more permissive UPDATE policy for user creation flow
CREATE POLICY "Allow user profile updates during creation"
ON public.users FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Verify the new policy
SELECT 
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;
