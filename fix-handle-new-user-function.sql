-- Fix the handle_new_user() function to use 'user' role instead of 'learner'
-- The current function uses 'learner' which is not allowed by our role constraint

-- Drop and recreate the function with the correct role
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    'user',  -- ✅ Use 'user' role which is allowed by our constraint
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Verify the function was updated
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';
