# 🔒 Security Guidelines for IPMA Cert Prep Platform

## Overview
This document outlines security best practices and what data is safe to expose vs what must be kept secret.

---

## ✅ Safe to Expose (Public)

### Frontend Environment Variables
These are **public** and visible in browser:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Public anonymous key (protected by RLS)
- `VITE_SITE_URL` - Your website URL

**Why these are safe:**
- The `VITE_` prefix makes them public by design
- Supabase `anon` key is designed to be public
- Row Level Security (RLS) protects your data
- These are necessary for the frontend to work

---

## ❌ Must Keep Secret (Backend Only)

### Critical Secrets - NEVER in Frontend Code
- ❌ **Supabase `service_role` key** - Has admin access, bypasses RLS
- ❌ **OpenAI API keys** - Costs money, must be in backend only
- ❌ **Database passwords** - Direct database access
- ❌ **User passwords** - Never hardcode or log
- ❌ **JWT secrets** - Used for token signing
- ❌ **Any private API keys** - Third-party service keys

---

## 🛡️ Security Layers

### 1. Row Level Security (RLS)
**What it does:**
- Controls who can read/write database records
- Enforces access based on authenticated user
- Blocks unauthorized access even with `anon` key

**Implementation:**
- ✅ Enable RLS on all tables
- ✅ Create policies for user roles (user, trainer, admin)
- ✅ Protect user-specific data (exam results, attempts)
- ✅ Allow public read for content (topics, questions)

### 2. Authentication
**What it does:**
- Verifies user identity
- Issues JWT tokens
- Manages sessions securely

**Implementation:**
- ✅ Use Supabase Auth (encrypted password storage)
- ✅ Never hardcode credentials in code
- ❌ Remove any test credentials before deployment
- ✅ Use proper password reset flows

### 3. HTTPS
**What it does:**
- Encrypts data in transit
- Prevents man-in-the-middle attacks

**Implementation:**
- ✅ Vercel provides HTTPS automatically
- ✅ All API calls use HTTPS
- ❌ Never use HTTP in production

---

## 🚨 What Users Can See in Browser

### DevTools Console
Users can see:
- ✅ Frontend code (minified but readable)
- ✅ Environment variables with `VITE_` prefix
- ✅ Network requests (URLs and responses)
- ✅ Console logs

Users CANNOT see:
- ❌ Backend code
- ❌ Secrets without `VITE_` prefix
- ❌ Other users' data (protected by RLS)
- ❌ Database credentials

### Network Tab
Users can see:
- ✅ API endpoints (Supabase REST API)
- ✅ Request/response data they're authorized to see
- ✅ Your anon key in headers (this is normal)

Users CANNOT see:
- ❌ Data they're not authorized to access
- ❌ Other users' private data
- ❌ Backend service keys

---

## 📋 Security Checklist

### Before Deployment
- [ ] Remove all hardcoded credentials
- [ ] Remove debug/test accounts
- [ ] Enable RLS on all tables
- [ ] Test RLS policies work correctly
- [ ] Remove excessive console.log statements
- [ ] Check .env.local is in .gitignore
- [ ] Verify only `VITE_` vars are in frontend
- [ ] Set up Vercel environment variables
- [ ] Enable Vercel authentication (optional)

### Regular Maintenance
- [ ] Review and update RLS policies
- [ ] Audit user permissions
- [ ] Monitor API usage
- [ ] Check for unauthorized access attempts
- [ ] Update dependencies for security patches
- [ ] Review Supabase logs

---

## 🔐 Best Practices

### 1. Never Log Sensitive Data
```typescript
// ❌ BAD
console.log('User password:', password)
console.log('Auth token:', token)

// ✅ GOOD
console.log('Login attempt for user:', email)
console.log('Authentication successful')
```

### 2. Use Environment Variables Correctly
```typescript
// ✅ GOOD - Frontend (public)
const url = import.meta.env.VITE_SUPABASE_URL

// ❌ BAD - Frontend (secret)
const serviceKey = import.meta.env.SERVICE_ROLE_KEY // Will be undefined

// ✅ GOOD - Backend only (Supabase Edge Functions)
const serviceKey = Deno.env.get('SERVICE_ROLE_KEY')
```

### 3. Validate Input
```typescript
// ✅ GOOD - Always validate user input
if (!email || !email.includes('@')) {
  throw new Error('Invalid email')
}

// Sanitize before database operations
const sanitizedInput = input.trim()
```

### 4. Use Proper Error Messages
```typescript
// ❌ BAD - Exposes internal details
catch (error) {
  throw new Error(`Database error: ${error.message}`)
}

// ✅ GOOD - Generic user-friendly message
catch (error) {
  console.error('Internal error:', error) // Log internally
  throw new Error('An error occurred. Please try again.')
}
```

---

## 📞 Security Incident Response

If you discover a security issue:
1. **Do NOT** disclose publicly
2. Immediately change compromised credentials
3. Review access logs
4. Update affected code
5. Deploy fixes immediately
6. Monitor for suspicious activity

---

## 🔗 Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Best Practices](https://supabase.com/docs/guides/auth)
- [OWASP Security Cheat Sheet](https://cheatsheetseries.owasp.org/)
- [Vercel Security](https://vercel.com/docs/security)

---

**Last Updated:** September 30, 2025
**Review Schedule:** Quarterly

