-- =====================================================
-- FIX RECURSIVE POLICY ON USERS TABLE
-- Remove the problematic admin_manage_users policy
-- =====================================================

-- Step 1: Drop the problematic recursive policy
DROP POLICY IF EXISTS "admin_manage_users" ON public.users;

-- Step 2: Create simple, non-recursive policies for users table
CREATE POLICY "Users can read own profile"
ON public.users FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can create profile"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Step 3: Create admin policy without recursion
-- Admin can manage all users (using auth.jwt() to check role)
CREATE POLICY "Admin can manage all users"
ON public.users FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
)
WITH CHECK (
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

-- Step 4: Verification
SELECT 'Recursive policy removed and replaced with simple policies!' AS status;
SELECT 'Login should work now without infinite recursion.' AS note;
