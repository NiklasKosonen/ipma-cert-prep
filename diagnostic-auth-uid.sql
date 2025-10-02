-- =====================================================
-- DIAGNOSTIC: Check auth.uid() type
-- =====================================================

-- First, let's see what auth.uid() returns
SELECT 
  auth.uid() as auth_uid,
  pg_typeof(auth.uid()) as auth_uid_type,
  auth.uid()::text as auth_uid_as_text,
  pg_typeof(auth.uid()::text) as auth_uid_text_type;

-- Check if we have any users table
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
