# Login Fix Instructions

## Current Problem
The login is not working because of Row Level Security (RLS) policies that are causing infinite recursion. When a user tries to log in, the system tries to fetch their user profile from the `public.users` table, but the RLS policies on that table reference other tables or functions that also have RLS policies, creating a circular dependency.

## Root Cause
- RLS policies on `public.users` table are too complex
- Policies reference `auth.uid()` which may not be available during login
- Circular dependencies between RLS policies on different tables

## Solution Steps

### Step 1: Run Simple RLS Script
Execute the `re-enable-rls-simple.sql` script in Supabase SQL Editor to:
- Re-enable RLS on all core tables
- Create simple, non-recursive policies
- Allow authenticated users to read content
- Allow users to access only their own profile

### Step 2: Verify Admin User Exists
Ensure the admin user exists in `public.users` table:
```sql
SELECT id, email, name, role FROM public.users WHERE email = 'niklas.kosonen@talentnetwork.fi';
```

### Step 3: Test Login
Try logging in with:
- Email: niklas.kosonen@talentnetwork.fi
- Password: Niipperi2026ipm#

## AI Used for Build
This application was built using **Claude** (Anthropic's AI assistant) for code generation, debugging, and implementation guidance.

## Important Notes
- Never remove RLS functions - they are essential for security
- Keep policies simple and direct to avoid recursion
- Always test login after making RLS changes
- Use `auth.uid()` for user-specific data access
- Use `true` for content that all authenticated users can read
