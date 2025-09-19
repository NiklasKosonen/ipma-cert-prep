# 🔐 Authentication Setup Guide

This guide explains how to set up proper authentication for the IPMA Certification Platform.

## 📋 **STEP 1: Apply Database Schema**

### **What to do:**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `create-user-data-tables.sql`
4. Click **Run** to execute the SQL

### **What this creates:**
- ✅ `exam_results` table for storing user exam results
- ✅ `users` table with role-based access
- ✅ RLS policies for data privacy
- ✅ Proper foreign key relationships

---

## 📋 **STEP 2: Configure Supabase Authentication**

### **Enable Email Authentication:**
1. Go to **Authentication** → **Settings** in Supabase
2. Enable **Email** provider
3. Configure email templates (optional)
4. Set up email confirmation (recommended for production)

### **Configure RLS Policies:**
The SQL script automatically creates these policies:
- Users can only see their own exam results
- Trainers can see their company's user results
- Admins can see all results

---

## 📋 **STEP 3: Test Authentication Flow**

### **User Registration:**
1. Go to `/login` on your platform
2. Click "Don't have an account? Sign up"
3. Fill in:
   - Full Name
   - Email Address
   - Company Code (ask your trainer)
   - Password
4. Click "Create Account"

### **User Login:**
1. Go to `/login` on your platform
2. Enter email and password
3. Click "Sign In"
4. You'll be redirected to `/dashboard`

### **Trainer Login:**
1. Trainers use the same login process
2. After login, they're redirected to `/trainer`
3. They can see all company user results

---

## 🎯 **Authentication Features**

### **User Roles:**
- **`user`**: Regular users who take exams
- **`trainer`**: Can view company user results
- **`admin`**: Full access to all data and admin console

### **Data Privacy:**
- Users only see their own exam results
- Trainers see their company's user results
- Admins see all data
- All data is protected by RLS policies

### **User Dashboard Features:**
- View past exam results
- See detailed evaluations
- Track progress over time
- Export personal data

### **Trainer Dashboard Features:**
- View all company users
- See user performance statistics
- Export company data
- Monitor user progress

---

## 🔧 **Technical Implementation**

### **Authentication Flow:**
```javascript
// Sign up
const user = await userDataService.authenticateUser(
  email, 
  password, 
  true, // isSignUp
  name, 
  companyCode
)

// Sign in
const user = await userDataService.authenticateUser(
  email, 
  password, 
  false // isSignUp
)
```

### **User Profile Creation:**
- Automatically created during sign up
- Stored in `users` table
- Linked to Supabase Auth user
- Includes role and company information

### **Exam Result Storage:**
- Automatically saved after exam completion
- Includes detailed evaluation
- Protected by RLS policies
- Accessible via user dashboard

---

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **"User must be authenticated" error:**
   - Ensure user is logged in
   - Check Supabase Auth configuration
   - Verify RLS policies are applied

2. **"Permission denied" error:**
   - Check RLS policies in Supabase
   - Ensure user has correct role
   - Verify database permissions

3. **Exam results not saving:**
   - Check network connection
   - Verify Supabase configuration
   - Check browser console for errors

4. **Dashboard not loading:**
   - Ensure user is authenticated
   - Check user role permissions
   - Verify routing configuration

### **Debug Steps:**
1. Check browser console for errors
2. Verify Supabase Auth status
3. Check database RLS policies
4. Test with different user roles

---

## 📞 **Support**

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify your Supabase project configuration
3. Ensure all SQL scripts have been applied
4. Test with different user accounts and roles

---

## 🎉 **Success Indicators**

You'll know authentication is working when:
- ✅ Users can sign up and sign in
- ✅ Exam results are automatically saved
- ✅ Users see only their own data
- ✅ Trainers see company user data
- ✅ No permission denied errors
- ✅ Dashboards load correctly

**The authentication system is now fully functional with proper data privacy and role-based access!**
