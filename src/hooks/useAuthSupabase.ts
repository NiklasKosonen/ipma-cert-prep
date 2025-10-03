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

    // Fallback timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.log('⚠️ Auth loading timeout - setting loading to false')
        setLoading(false)
      }
    }, 10000) // 10 second timeout

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
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  // Handle authentication state change
  const handleAuthChange = async (supabaseUser: any) => {
    try {
      console.log('🔄 Handling auth change for:', supabaseUser.email)
      
      
      // Get company code from user metadata (set during magic link signup)
      const companyCode = supabaseUser.user_metadata?.company_code || 'DEFAULT_COMPANY'
      const companyName = supabaseUser.user_metadata?.company_name || 'Default Company'
      const userName = supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0]
      
      // Set user immediately with basic info
      const basicAuthUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        role: 'user', // Default role
        companyCode: companyCode,
      }
      setUser(basicAuthUser)
      setUserProfile(null)
      console.log('✅ Basic user set:', basicAuthUser.email, 'Company:', companyCode)
      
      // Try to get user profile from our users table (with timeout)
      try {
        const profilePromise = supabase
          .from('users')
          .select('*')
          .eq('email', supabaseUser.email)
          .single()

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
        )

        const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user profile:', error)
          console.log('✅ Creating new user profile for:', supabaseUser.email)
          
          // Create user profile if it doesn't exist
          const userProfileData: UserProfile = {
            id: supabaseUser.id,
            email: supabaseUser.email,
            name: userName,
            role: 'user' as UserRole,
            companyCode: companyCode,
            companyName: companyName,
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
          } else {
            console.log('✅ User profile created successfully')
            setUserProfile(userProfileData)
          }
          
          return
        }

        // Update user with profile data
        const authUser: AuthUser = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          role: profile?.role || 'user',
          companyCode: profile?.company_code || companyCode,
        }

        setUser(authUser)
        setUserProfile(profile)
        
        
        console.log('✅ User authenticated with profile:', authUser.email, 'Role:', authUser.role)
      } catch (profileError) {
        console.log('⚠️ Profile fetch failed or timed out, using default role for:', supabaseUser.email)
        // User is already set with basic info above
      }
    } catch (error) {
      console.error('Error in handleAuthChange:', error)
      // Set user with default values even on error
      const authUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        role: 'user',
        companyCode: 'DEFAULT_COMPANY',
      }
      setUser(authUser)
      setUserProfile(null)
      console.log('✅ User set with default role after error:', authUser.email)
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
      console.log('🔐 Starting sign in for:', email)
      
      // Check rate limiting
      const rateLimitCheck = checkRateLimit(email)
      if (!rateLimitCheck.allowed) {
        console.log('🚫 Rate limited for:', email)
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
        console.error('❌ Sign in error:', error)
        recordFailedAttempt(email) // Record failed attempt
        return { data: null, error: error.message }
      }

      if (data.user) {
        console.log('✅ Supabase auth successful for:', email)
        clearRateLimit(email) // Clear rate limit on success
        
        // Wait for handleAuthChange to complete
        await handleAuthChange(data.user)
        
        // Return the current user state (which should be set by handleAuthChange)
        // Use a small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100))
        return { data: { user: user }, error: null }
      }

      console.log('❌ No user data returned from Supabase')
      return { data: null, error: 'Sign in failed' }
    } catch (error) {
      console.error('❌ Sign in exception:', error)
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

  // Sign in with company code using Supabase Auth (email as username, company code as password)
  const signInWithCompanyCode = async (companyCode: string, userEmail: string) => {
    try {
      setLoading(true)

      // Check if company code exists and is active (case-insensitive)
      console.log('🔄 Looking for company code:', companyCode)
      const { data: company, error: companyError } = await supabase
        .from('company_codes')
        .select('*')
        .ilike('code', companyCode) // Case-insensitive search
        .eq('is_active', true)
        .single()
      
      console.log('🔄 Company lookup result:', { company, companyError })

      if (companyError || !company) {
        console.error('Company code validation failed:', companyError)
        return { data: null, error: 'Invalid or inactive company code' }
      }

      // Check if company code has expired
      if (new Date(company.expires_at) < new Date()) {
        return { data: null, error: 'Company code has expired' }
      }

      // Check if user exists in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', userEmail.toLowerCase())
        .eq('company_code', companyCode.toUpperCase())
        .single()

      console.log('🔄 User lookup result:', { userData, userError })

      if (userError || !userData) {
        console.error('User not found:', { userEmail, companyCode: companyCode.toUpperCase() })
        return { data: null, error: 'User not found. Please contact administrator to add your email to this company code.' }
      }

      // Use Supabase Auth for authentication (company code is the password)
      console.log('🔄 Authenticating with Supabase Auth...')
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail.toLowerCase(),
        password: companyCode.toUpperCase() // Company code is the password
      })

      if (authError) {
        console.error('❌ Supabase Auth error:', authError)
        return { data: null, error: 'Invalid email or company code. Please check your credentials.' }
      }

      if (!authData.user) {
        return { data: null, error: 'Authentication failed' }
      }

      console.log('✅ Supabase Auth successful for:', userEmail)
      
      // Wait for handleAuthChange to complete and set the correct user role
      await handleAuthChange(authData.user)
      
      // Return the current user state (which should be set by handleAuthChange)
      await new Promise(resolve => setTimeout(resolve, 100))
      return { data: { user: user }, error: null }

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
