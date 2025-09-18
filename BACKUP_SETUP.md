# Automatic Data Backup & Supabase Integration Setup

This guide will help you set up automatic data backup and Supabase integration for your IPMA certification platform.

## 🚀 What This Solves

**Problem**: Data stored in localStorage gets lost when you deploy updates to Vercel.

**Solution**: Automatic backup system that:
- ✅ Creates backups before deployments
- ✅ Syncs data to Supabase database
- ✅ Restores data automatically after deployments
- ✅ Provides manual backup/restore controls

## 📋 Setup Steps

### 1. Supabase Database Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Run Database Schema**
   ```bash
   # Copy the schema file to your Supabase SQL editor
   cat supabase-schema.sql
   ```
   - Paste the contents into Supabase SQL Editor
   - Run the script to create all tables

3. **Set Environment Variables**
   ```bash
   # Copy environment template
   cp env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 2. Automatic Backup Features

The system now includes:

#### 🔄 **Automatic Backups**
- **Every 30 minutes**: Data is automatically backed up
- **Before page unload**: Backup created when user leaves the page
- **Before deployments**: Backup created before Vercel deployments
- **Download backup**: Automatic download of backup files

#### 🗄️ **Supabase Integration**
- **Sync to Supabase**: Upload all data to database
- **Sync from Supabase**: Download data from database
- **Persistent storage**: Data survives deployments
- **Real-time sync**: Keep local and cloud data in sync

#### 🎛️ **Admin Controls**
- **Backup & Sync tab**: New admin console section
- **Manual backup**: Create backup on demand
- **Manual restore**: Restore from last backup
- **Status indicators**: See backup status and last backup time

### 3. Deployment Process

#### **Before Making Changes:**
1. Go to Admin Console → Backup & Sync tab
2. Click "Create Backup Now" (optional - auto backup handles this)
3. Click "Sync to Supabase" to save to database

#### **After Deploying:**
1. The system automatically detects new deployments
2. Data is automatically restored from backup
3. If Supabase is configured, data syncs from database
4. Everything works as if no deployment happened!

### 4. Manual Backup/Restore

#### **Create Backup:**
```bash
# Via admin console
Admin Console → Backup & Sync → Create Backup Now

# Via command line
npm run backup
```

#### **Restore Backup:**
```bash
# Via admin console
Admin Console → Backup & Sync → Restore from Backup

# Via command line
npm run restore
```

### 5. Vercel Deployment Hooks

The system includes deployment hooks that run automatically:

```bash
# Build process now includes:
npm run build
# → Runs: node vercel-deploy-hook.js pre-build
# → Runs: tsc && vite build
# → Runs: node vercel-deploy-hook.js post-build
```

## 🔧 Configuration Options

### Auto Backup Settings
```typescript
useAutoBackup({
  enabled: true,        // Enable/disable auto backup
  interval: 30,         // Backup interval in minutes
  beforeUnload: true,   // Backup before page unload
  beforeDeploy: true    // Backup before deployments
})
```

### Data Types Backed Up
- ✅ Topics & Subtopics
- ✅ Questions & KPIs
- ✅ Training Examples
- ✅ Company Codes
- ✅ User Profiles & Subscriptions
- ✅ Exam Attempts & Results
- ✅ All user-specific data

## 🚨 Important Notes

### **Data Safety**
- Backups are stored in localStorage AND downloaded as files
- Supabase provides cloud backup for production use
- Multiple backup layers ensure data safety

### **Deployment Workflow**
1. **Always sync to Supabase before major changes**
2. **Test restore process in development**
3. **Monitor backup status in admin console**

### **Troubleshooting**
- Check browser console for backup errors
- Verify Supabase environment variables
- Ensure Supabase database schema is created
- Check network connectivity for Supabase sync

## 📊 Monitoring

### **Admin Console Features**
- Last backup timestamp
- Backup status indicators
- Sync status for Supabase
- Automatic backup schedule status

### **Console Logs**
- `✅ Automatic backup created: backup_name`
- `✅ Data synced to Supabase successfully`
- `✅ Data restored from automatic backup`

## 🎯 Benefits

1. **No More Data Loss**: Deployments won't lose your content
2. **Automatic Process**: No manual intervention needed
3. **Multiple Backup Layers**: localStorage + file download + Supabase
4. **Easy Recovery**: One-click restore from admin console
5. **Production Ready**: Supabase provides enterprise-grade storage

## 🔮 Future Enhancements

- **Real-time sync**: Live updates between users
- **Version history**: Track changes over time
- **Selective restore**: Restore specific data types
- **Backup scheduling**: Custom backup intervals
- **Cloud storage**: Integration with AWS S3, Google Drive

---

**Your data is now safe! 🛡️** Deploy with confidence knowing your content will persist through updates.
