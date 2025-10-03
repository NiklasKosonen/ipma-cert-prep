-- =====================================================
-- COMPLETE FIX FOR COMPANY CODES RLS
-- This will allow both anonymous and authenticated users
-- to read company codes for login validation
-- =====================================================

-- Step 1: Drop all existing policies on company_codes
DROP POLICY IF EXISTS "Allow company code validation for login" ON public.company_codes;
DROP POLICY IF EXISTS "Authenticated users can read company_codes" ON public.company_codes;
DROP POLICY IF EXISTS "Authenticated users can insert company_codes" ON public.company_codes;
DROP POLICY IF EXISTS "Authenticated users can update company_codes" ON public.company_codes;
DROP POLICY IF EXISTS "Authenticated users can delete company_codes" ON public.company_codes;

-- Step 2: Create comprehensive policies for company_codes
-- Allow anonymous users to read company codes (for login validation)
CREATE POLICY "Allow anonymous company code validation"
ON public.company_codes FOR SELECT
TO anon
USING (true);

-- Allow authenticated users to read company codes
CREATE POLICY "Allow authenticated company code access"
ON public.company_codes FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert company codes
CREATE POLICY "Allow authenticated company code insert"
ON public.company_codes FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update company codes
CREATE POLICY "Allow authenticated company code update"
ON public.company_codes FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete company codes
CREATE POLICY "Allow authenticated company code delete"
ON public.company_codes FOR DELETE
TO authenticated
USING (true);

-- Step 3: Verify the policies were created
SELECT 
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'company_codes' 
ORDER BY policyname;

-- Step 4: Test query (should work for both anon and authenticated)
-- This simulates what the app does during login
SELECT 
    code,
    company_name,
    authorized_emails,
    is_active,
    expires_at
FROM public.company_codes 
WHERE code = 'TN' AND is_active = true
LIMIT 1;
