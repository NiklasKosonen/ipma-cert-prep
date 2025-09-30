-- =====================================================
-- ADD ADMIN USER: niklas.kosonen@talentnetwork.fi
-- =====================================================

-- First, create the user in auth.users if it doesn't exist
-- Note: This requires you to sign up through the app first, or we insert into public.users only

-- Insert into public.users table (or update if exists)
INSERT INTO public.users (
  id,
  email,
  name,
  role,
  company_code,
  created_at,
  updated_at
) VALUES (
  'admin-niklas-' || md5('niklas.kosonen@talentnetwork.fi'),
  'niklas.kosonen@talentnetwork.fi',
  'Niklas Kosonen',
  'admin',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET 
  role = 'admin',
  name = 'Niklas Kosonen',
  updated_at = NOW();

-- Verify the user was created
SELECT id, email, name, role, created_at 
FROM public.users 
WHERE email = 'niklas.kosonen@talentnetwork.fi';

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 'Admin user created/updated successfully!' AS status;

