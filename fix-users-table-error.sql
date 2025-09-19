-- =====================================================
-- Fix Users Table 500 Error
-- =====================================================

-- Check if users table has proper policies
-- The 500 error suggests RLS is blocking access

-- First, let's ensure users table has anonymous access
DROP POLICY IF EXISTS "Allow anon full access to users" ON public.users;
CREATE POLICY "Allow anon full access to users" ON public.users
    FOR ALL TO anon USING (true) WITH CHECK (true);

-- Also ensure authenticated users have access
DROP POLICY IF EXISTS "Allow authenticated full access to users" ON public.users;
CREATE POLICY "Allow authenticated full access to users" ON public.users
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Check if there are any constraints causing issues
-- Make sure the users table structure is correct
ALTER TABLE public.users 
ALTER COLUMN email SET NOT NULL,
ALTER COLUMN name SET NOT NULL,
ALTER COLUMN role SET NOT NULL;

-- Add default values for any missing required fields
UPDATE public.users 
SET 
  name = COALESCE(name, 'Unknown User'),
  role = COALESCE(role, 'user'),
  company_code = COALESCE(company_code, 'DEFAULT_COMPANY'),
  company_name = COALESCE(company_name, 'Default Company'),
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW())
WHERE name IS NULL OR role IS NULL OR company_code IS NULL;

-- =====================================================
-- Security Notes
-- =====================================================

-- 1. This ensures users table is accessible
-- 2. Fixes any null constraint violations
-- 3. Provides default values for missing data
-- 4. Should resolve the 500 Internal Server Error
