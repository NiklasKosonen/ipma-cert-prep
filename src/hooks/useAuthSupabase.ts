import { useState, useEffect } from 'react'
import { AuthUser, UserRole, UserProfile } from '../types'
import { supabase } from '../lib/supabase'

// Rate limiting configuration
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_KEY_PREFIX = 'login_attempts_'

// Supabase Authentication System
export const useAuthSupabase = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          return
        }

        if (session?.user && mounted) {
          await handleAuthChange(session.user)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (session?.user) {
          await handleAuthChange(session.user)
        } else {
          if (mounted) {
            setUser(null)
            setUserProfile(null)
          }
        }
        
        if (mounted) {
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Handle authentication state change
  const handleAuthChange = async (supabaseUser: any) => {
    try {
      // Get user profile from our users table
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', supabaseUser.email)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
        return
      }

      // Create auth user object
      const authUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        role: profile?.role || 'user',
        companyCode: profile?.company_code || 'DEFAULT_COMPANY',
      }

      setUser(authUser)
      setUserProfile(profile)
      
      console.log('✅ User authenticated:', authUser.email, 'Role:', authUser.role)
    } catch (error) {
      console.error('Error in handleAuthChange:', error)
    }
  }

  // Check rate limiting
  const checkRateLimit = (email: string): { allowed: boolean; remainingTime?: number } => {
    const key = RATE_LIMIT_KEY_PREFIX + email
    const attemptsData = localStorage.getItem(key)
    
    if (!attemptsData) return { allowed: true }
    
    const { lockedUntil } = JSON.parse(attemptsData)
    
    if (lockedUntil && Date.now() < lockedUntil) {
      const remainingTime = Math.ceil((lockedUntil - Date.now()) / 1000 / 60)
      return { allowed: false, remainingTime }
    }
    
    return { allowed: true }
  }

  // Record failed attempt
  const recordFailedAttempt = (email: string) => {
    const key = RATE_LIMIT_KEY_PREFIX + email
    const attemptsData = localStorage.getItem(key)
    
    let attempts = 1
    if (attemptsData) {
      const parsed = JSON.parse(attemptsData)
      attempts = parsed.attempts + 1
    }
    
    const data: any = { attempts }
    
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      data.lockedUntil = Date.now() + LOCKOUT_DURATION
    }
    
    localStorage.setItem(key, JSON.stringify(data))
  }

  // Clear rate limit on successful login
  const clearRateLimit = (email: string) => {
    const key = RATE_LIMIT_KEY_PREFIX + email
    localStorage.removeItem(key)
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string, _role: UserRole) => {
    try {
      setLoading(true)
      
      // Check rate limiting
      const rateLimitCheck = checkRateLimit(email)
      if (!rateLimitCheck.allowed) {
        return { 
          data: null, 
          error: `Too many failed attempts. Please try again in ${rateLimitCheck.remainingTime} minutes.` 
        }
      }
      
      // Use Supabase authentication only (no hardcoded credentials)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Sign in error:', error)
        recordFailedAttempt(email) // Record failed attempt
        return { data: null, error: error.message }
      }

      if (data.user) {
        clearRateLimit(email) // Clear rate limit on success
        await handleAuthChange(data.user)
        return { data: { user: user }, error: null }
      }

      return { data: null, error: 'Sign in failed' }
    } catch (error) {
      console.error('Sign in error:', error)
      recordFailedAttempt(email) // Record failed attempt
      return { data: null, error: 'Sign in failed' }
    } finally {
      setLoading(false)
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string, role: UserRole, companyCode: string) => {
    try {
      setLoading(true)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            company_code: companyCode
          }
        }
      })

      if (error) {
        console.error('Sign up error:', error)
        return { data: null, error: error.message }
      }

      if (data.user) {
        // Create user profile
        const userProfileData: UserProfile = {
          id: data.user.id,
          email: email,
          name: name,
          role: role,
          companyCode: companyCode,
          companyName: companyCode,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: userProfileData.id,
            email: userProfileData.email,
            name: userProfileData.name,
            role: userProfileData.role,
            company_code: userProfileData.companyCode,
            company_name: userProfileData.companyName,
            created_at: userProfileData.createdAt,
            updated_at: userProfileData.updatedAt
          }])

        if (profileError) {
          console.error('Error creating user profile:', profileError)
          return { data: null, error: 'Failed to create user profile' }
        }

        return { data: { user: data.user }, error: null }
      }

      return { data: null, error: 'Sign up failed' }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error: 'Sign up failed' }
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        return { error: error.message }
      }
      
      setUser(null)
      setUserProfile(null)
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: 'Sign out failed' }
    }
  }

  // Sign in with company code
  const signInWithCompanyCode = async (companyCode: string, userEmail: string) => {
    try {
      setLoading(true)

      // Check if company code exists and is active
      const { data: company, error: companyError } = await supabase
        .from('company_codes')
        .select('*')
        .eq('code', companyCode)
        .eq('is_active', true)
        .single()

      if (companyError || !company) {
        return { data: null, error: 'Invalid or inactive company code' }
      }

      // Check if company code has expired
      if (new Date(company.expires_at) < new Date()) {
        return { data: null, error: 'Company code has expired' }
      }

      // Check if user email matches admin email for this company
      if (company.admin_email && company.admin_email !== userEmail) {
        return { data: null, error: 'Email does not match company admin email' }
      }

      // Create or get user profile
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', userEmail)
        .single()

        const userProfileData: UserProfile = {
          id: existingUser?.id || `user_${Date.now()}`,
          email: userEmail,
          name: userEmail.split('@')[0],
          role: 'user' as UserRole,
          companyCode: companyCode,
          companyName: company.company_name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

      if (existingUser) {
        // Update existing user
        const { error } = await supabase
          .from('users')
          .update({
            company_code: companyCode,
            company_name: company.company_name,
            updated_at: new Date().toISOString()
          })
          .eq('email', userEmail)

        if (error) {
          console.error('Error updating user:', error)
          return { data: null, error: 'Failed to update user profile' }
        }
      } else {
        // Create new user
        const { error } = await supabase
          .from('users')
          .insert([{
            id: userProfileData.id,
            email: userProfileData.email,
            name: userProfileData.name,
            role: userProfileData.role,
            company_code: userProfileData.companyCode,
            company_name: userProfileData.companyName,
            created_at: userProfileData.createdAt,
            updated_at: userProfileData.updatedAt
          }])

        if (error) {
          console.error('Error creating user:', error)
          return { data: null, error: 'Failed to create user profile' }
        }
      }

        // Create auth user object
        const authUser: AuthUser = {
          id: userProfileData.id,
          email: userEmail,
          role: 'user',
          companyCode: userProfileData.companyCode,
        }

      setUser(authUser)
      setUserProfile(userProfileData)

      console.log('✅ User signed in with company code:', { 
        email: userEmail, 
        companyCode: companyCode,
        companyName: company.company_name
      })

      return { data: { user: authUser }, error: null }
    } catch (error) {
      console.error('Company code sign in error:', error)
      return { data: null, error: 'Sign in failed' }
    } finally {
      setLoading(false)
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })

      if (error) {
        console.error('Reset password error:', error)
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Reset password error:', error)
      return { error: 'Failed to send reset email' }
    }
  }

  // Update password
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        console.error('Update password error:', error)
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Update password error:', error)
      return { error: 'Failed to update password' }
    }
  }

  return {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithCompanyCode,
    resetPassword,
    updatePassword,
  }
}
