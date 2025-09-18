# Supabase Setup Guide

## 🔍 Problem Analysis

The Supabase backup system is not working because:

1. **Missing Environment Variables**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are not set
2. **Using Mock Client**: The app falls back to a mock Supabase client that doesn't actually save data
3. **Database Schema**: The database tables may not exist in your Supabase project

## 🛠️ Complete Fix Steps

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `ipma-cert-prep`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

### Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Key**: `eyJ...` (starts with eyJ)

### Step 3: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire content from `supabase-schema.sql` file
4. Paste it into the SQL editor
5. Click "Run" to create all tables

### Step 4: Configure Environment Variables

#### For Local Development:
1. Create `.env.local` file in your project root:
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key-here
```

#### For Vercel Deployment:
1. Go to [vercel.com](https://vercel.com) → Your Project → Settings → Environment Variables
2. Add these variables:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://your-project-id.supabase.co`
   - **Environment**: Production, Preview, Development
3. Add second variable:
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: `eyJ...your-anon-key-here`
   - **Environment**: Production, Preview, Development

### Step 5: Test the Connection

1. Install dotenv: `npm install dotenv`
2. Run the test script: `node test-supabase.js`
3. You should see: "✅ Database connection successful!"

### Step 6: Test the Sync Button

1. Go to your admin panel
2. Add some test data (topics, questions, etc.)
3. Click "Sync to Supabase" button
4. Check the browser console for success messages
5. Check your Supabase dashboard → Table Editor to see the data

## 🔧 Troubleshooting

### Error: "Supabase not configured"
- **Solution**: Make sure environment variables are set correctly
- **Check**: Run `node test-supabase.js` to verify

### Error: "relation does not exist"
- **Solution**: Run the SQL schema from `supabase-schema.sql`
- **Check**: Go to Supabase → Table Editor to see if tables exist

### Error: "permission denied"
- **Solution**: Check your anon key permissions
- **Check**: Go to Supabase → Settings → API → RLS Policies

### Error: "400 Bad Request"
- **Solution**: Usually means table structure mismatch
- **Check**: Compare your data structure with the schema

## 📊 What the Sync Button Does

When you click "Sync to Supabase":

1. **Exports all data** from localStorage (topics, questions, KPIs, etc.)
2. **Uploads to Supabase** database tables
3. **Creates backup snapshot** for future restore
4. **Persists across deployments** - your data survives Vercel updates
5. **Enables data sharing** between different users/sessions

## 🎯 Expected Behavior After Fix

- ✅ Sync button shows "Syncing..." then "✅ Data synced successfully!"
- ✅ Data appears in Supabase Table Editor
- ✅ Data persists after Vercel deployments
- ✅ Multiple users can access the same data
- ✅ No more 400 errors in console

## 🚀 Next Steps

After fixing Supabase:

1. **Test the sync button** with sample data
2. **Verify data persistence** after deployment
3. **Set up RLS policies** for data security (optional)
4. **Configure backup schedules** (optional)

The sync system will then work as intended: save your admin work to Supabase so it persists across deployments and sessions!
