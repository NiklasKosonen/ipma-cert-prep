-- Current Database State Diagnosis
-- Run this to see what tables exist and their structure

-- Check if attempts table exists and its structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'attempts'
ORDER BY ordinal_position;

-- Check if attempt_items table exists and its structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'attempt_items'
ORDER BY ordinal_position;

-- Check RLS status on both tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('attempts', 'attempt_items');

-- Check existing policies on attempts table
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'attempts' 
  AND schemaname = 'public';

-- Check existing policies on attempt_items table
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'attempt_items' 
  AND schemaname = 'public';

-- Check if there are any existing attempts
SELECT COUNT(*) as total_attempts FROM public.attempts;

-- Check if there are any existing attempt_items
SELECT COUNT(*) as total_attempt_items FROM public.attempt_items;

-- Show sample data from attempts (if any)
SELECT * FROM public.attempts LIMIT 5;

-- Show sample data from attempt_items (if any)
SELECT * FROM public.attempt_items LIMIT 5;
