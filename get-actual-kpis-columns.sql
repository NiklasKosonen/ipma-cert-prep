-- Get the exact columns that exist in kpis table
SELECT column_name
FROM information_schema.columns 
WHERE table_name = 'kpis' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check kpis_en table
SELECT column_name
FROM information_schema.columns 
WHERE table_name = 'kpis_en' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

