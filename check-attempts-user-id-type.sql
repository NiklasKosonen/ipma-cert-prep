-- Check the user_id column type in attempts table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'attempts'
  AND column_name = 'user_id';
