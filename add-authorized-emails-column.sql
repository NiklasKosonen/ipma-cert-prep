-- =====================================================
-- ADD AUTHORIZED EMAILS COLUMN TO COMPANY CODES
-- =====================================================

-- Step 1: Add authorized_emails column to company_codes table
ALTER TABLE public.company_codes 
ADD COLUMN IF NOT EXISTS authorized_emails TEXT[] DEFAULT '{}';

-- Step 2: Update existing company codes to have empty authorized_emails array
UPDATE public.company_codes 
SET authorized_emails = '{}' 
WHERE authorized_emails IS NULL;

-- Step 3: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_company_codes_authorized_emails 
ON public.company_codes USING GIN (authorized_emails);

-- Step 4: Verification
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'company_codes' 
AND column_name = 'authorized_emails';

-- Step 5: Test query to check current data
SELECT 
  id, 
  code, 
  company_name, 
  authorized_emails, 
  expires_at, 
  is_active
FROM public.company_codes 
LIMIT 5;
