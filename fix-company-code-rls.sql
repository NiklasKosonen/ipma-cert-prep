-- =====================================================
-- FIX COMPANY CODE LOGIN - RLS POLICY UPDATE
-- Run this script in Supabase SQL Editor
-- =====================================================

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can read company_codes" ON public.company_codes;

-- Create a new policy that allows anonymous users to read company codes for validation
-- This is necessary because users need to validate company codes before they can authenticate
CREATE POLICY "Allow company code validation for login"
ON public.company_codes FOR SELECT
TO anon, authenticated
USING (true);

-- Verify the policy was created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'company_codes';

-- Test query to ensure company codes can be read
SELECT COUNT(*) as company_codes_count FROM public.company_codes;

-- Show current company codes for verification
SELECT 
  id,
  code,
  company_name,
  authorized_emails,
  is_active,
  expires_at
FROM public.company_codes
ORDER BY created_at DESC
LIMIT 5;
