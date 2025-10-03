-- Add company_name column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Update the column to allow NULL values (since some users might not have a company)
ALTER TABLE public.users 
ALTER COLUMN company_name SET DEFAULT NULL;

-- Add an index for better performance when querying by company
CREATE INDEX IF NOT EXISTS idx_users_company_name 
ON public.users (company_name);

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;
