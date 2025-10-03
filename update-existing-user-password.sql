-- Update the existing user's password to uppercase to match the new standardization
-- This fixes the case where the user was created with mixed case password

-- First, let's check the current user
SELECT email, raw_app_meta_data FROM auth.users WHERE email = 'niklaskoso@gmail.com';

-- Update the password for the existing user
-- Note: This requires the service role key, not the anon key
-- If you can't run this directly, you'll need to reset the password through Supabase dashboard

-- Alternative: Delete and recreate the user (if you have admin access)
-- DELETE FROM auth.users WHERE email = 'niklaskoso@gmail.com';
-- The user will be recreated automatically when they try to log in again

-- For now, the user should try logging in with the exact case that was used during creation
-- Based on the database, the company code is 'TalentNetwork1' (mixed case)
-- So the user should try: TalentNetwork1 (not TALENTNETWORK1)
