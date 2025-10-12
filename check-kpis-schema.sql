-- Check the actual schema of the kpis table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'kpis' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check kpis_en if it exists
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'kpis_en' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

