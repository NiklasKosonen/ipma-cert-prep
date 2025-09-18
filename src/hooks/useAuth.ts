import { useState, useEffect, useCallback } from 'react'
import { AuthUser, UserRole, UserProfile, UserSession, Subscription } from '../types'
import { isDevelopmentMode, getAutoLoginConfig, getSessionConfig } from '../config/development'

// Enhanced authentication system with persistent sessions and development mode
export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<UserSession | null>(null)

  // Generate a unique session token
  const generateSessionToken = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Create or update user session
  const createSession = useCallback((userId: string): UserSession => {
    const config = getSessionConfig()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + config.defaultDuration)

    const newSession: UserSession = {
      id: `session_${Date.now()}`,
      userId,
      token: generateSessionToken(),
      expiresAt: expiresAt.toISOString(),
      lastActivity: now.toISOString(),
      isActive: true,
      userAgent: navigator.userAgent,
      ipAddress: 'localhost', // In a real app, this would come from the server
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }

    // Save session to localStorage
    const existingSessions = JSON.parse(localStorage.getItem('ipma_sessions') || '[]')
    const updatedSessions = [...existingSessions.filter((s: UserSession) => s.userId !== userId), newSession]
    localStorage.setItem('ipma_sessions', JSON.stringify(updatedSessions))

    return newSession
  }, [])

  // Update session activity
  const updateSessionActivity = useCallback((sessionToken: string) => {
    const sessions = JSON.parse(localStorage.getItem('ipma_sessions') || '[]')
    const sessionIndex = sessions.findIndex((s: UserSession) => s.token === sessionToken)
    
    if (sessionIndex !== -1) {
      sessions[sessionIndex].lastActivity = new Date().toISOString()
      sessions[sessionIndex].updatedAt = new Date().toISOString()
      localStorage.setItem('ipma_sessions', JSON.stringify(sessions))
    }
  }, [])

  // Validate session
  const validateSession = useCallback((sessionToken: string): boolean => {
    const sessions = JSON.parse(localStorage.getItem('ipma_sessions') || '[]')
    const session = sessions.find((s: UserSession) => s.token === sessionToken)
    
    if (!session || !session.isActive) {
      return false
    }

    const config = getSessionConfig()
    
    // In development mode, sessions never expire
    if (isDevelopmentMode() && config.neverExpire) {
      return true
    }

    // Check if session is expired
    const now = new Date()
    const expiresAt = new Date(session.expiresAt)
    const lastActivity = new Date(session.lastActivity)
    const activityTimeout = new Date(lastActivity.getTime() + config.activityTimeout)

    return now < expiresAt && now < activityTimeout
  }, [])

  // Get or create user profile
  const getOrCreateUserProfile = useCallback((email: string, name: string, role: UserRole, companyCode?: string): UserProfile => {
    const users = JSON.parse(localStorage.getItem('ipma_users') || '[]')
    let userProfile = users.find((u: UserProfile) => u.email === email)

    if (!userProfile) {
      userProfile = {
        id: `user_${Date.now()}`,
        email,
        name,
        role,
        companyCode,
        companyName: companyCode ? `Company ${companyCode}` : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Create default subscription for new users (2 months)
      if (role === 'user') {
        const now = new Date()
        const endDate = new Date(now.getTime() + (60 * 24 * 60 * 60 * 1000)) // 60 days

        const subscription: Subscription = {
          id: `sub_${Date.now()}`,
          userId: userProfile.id,
          startDate: now.toISOString(),
          endDate: endDate.toISOString(),
          isActive: true,
          planType: 'trial',
          autoRenew: false,
          reminderSent: {
            sevenDays: false,
            oneDay: false
          },
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        }

        const subscriptions = JSON.parse(localStorage.getItem('ipma_subscriptions') || '[]')
        subscriptions.push(subscription)
        localStorage.setItem('ipma_subscriptions', JSON.stringify(subscriptions))

        userProfile.subscription = subscription
      }

      users.push(userProfile)
      localStorage.setItem('ipma_users', JSON.stringify(users))
    }

    return userProfile
  }, [])

  // Auto-login in development mode
  const autoLoginInDevelopment = useCallback(() => {
    if (!isDevelopmentMode()) return false

    const config = getAutoLoginConfig()
    if (!config.enabled) return false

    const mockUser: AuthUser = {
      id: `admin_${Date.now()}`,
      email: config.adminEmail,
      role: 'admin',
      companyCode: undefined
    }

    const userProfile = getOrCreateUserProfile(
      config.adminEmail,
      config.adminName,
      'admin',
      undefined
    )

    const userSession = createSession(userProfile.id)

    setUser(mockUser)
    setUserProfile(userProfile)
    setSession(userSession)

    // Save auth state
    localStorage.setItem('auth_user', JSON.stringify(mockUser))
    localStorage.setItem('auth_session_token', userSession.token)

    console.log('🚀 Auto-login enabled in development mode:', {
      email: config.adminEmail,
      sessionToken: userSession.token
    })

    return true
  }, [createSession, getOrCreateUserProfile])

  // Initialize authentication
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try auto-login in development mode first
        if (autoLoginInDevelopment()) {
          setLoading(false)
          return
        }

        // Check for existing session
        const sessionToken = localStorage.getItem('auth_session_token')
        const savedUser = localStorage.getItem('auth_user')

        if (sessionToken && savedUser && validateSession(sessionToken)) {
          const userData = JSON.parse(savedUser)
          const savedUserProfile = localStorage.getItem('auth_user_profile')

          if (savedUserProfile) {
            const userProfile = JSON.parse(savedUserProfile)
            setUser(userData)
            setUserProfile(userProfile)
            setSession({ token: sessionToken } as UserSession)
            updateSessionActivity(sessionToken)
            console.log('✅ Restored user session:', { email: userData.email, role: userData.role })
          } else {
            // Clear invalid session
            localStorage.removeItem('auth_user')
            localStorage.removeItem('auth_session_token')
            localStorage.removeItem('auth_user_profile')
          }
        } else {
          // Clear expired session
          localStorage.removeItem('auth_user')
          localStorage.removeItem('auth_session_token')
          localStorage.removeItem('auth_user_profile')
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        // Clear any corrupted data
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_session_token')
        localStorage.removeItem('auth_user_profile')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [autoLoginInDevelopment, validateSession, updateSessionActivity])

  // Activity tracking
  useEffect(() => {
    if (!session?.token) return

    const updateActivity = () => {
      updateSessionActivity(session.token)
    }

    // Update activity on user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true)
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true)
      })
    }
  }, [session?.token, updateSessionActivity])

  const signIn = async (email: string, password: string, role: UserRole) => {
    try {
      // Accept any valid email format and non-empty password
      if (!email || !password || !email.includes('@') || password.length < 3) {
        return { data: null, error: 'Please enter a valid email and password' }

      // Special admin credentials for Niklas Kosonen
      const adminCredentials = {
        email: 'niklas.kosonen@talentnetwork.fi',
        password: 'Niipperi2026ipm#'
      };
      
      // Check if this is Niklas admin login
      if (email.toLowerCase() === adminCredentials.email.toLowerCase() && password === adminCredentials.password) {
        console.log(' Admin login detected for Niklas Kosonen');
        const adminUser = { id: 'admin_niklas_kosonen', email: adminCredentials.email, role: 'admin', companyCode: 'TALENT_NETWORK' };
        const adminProfile = getOrCreateUserProfile(adminCredentials.email, 'Niklas Kosonen', 'admin', 'TALENT_NETWORK');
        const adminSession = createSession(adminProfile.id);
        setUser(adminUser); setUserProfile(adminProfile); setSession(adminSession);
        localStorage.setItem('auth_user', JSON.stringify(adminUser));
        localStorage.setItem('auth_session_token', adminSession.token);
        localStorage.setItem('auth_user_profile', JSON.stringify(adminProfile));
        console.log(' Admin signed in:', { email: adminCredentials.email, role: 'admin', sessionToken: adminSession.token, name: 'Niklas Kosonen' });
        return { data: { user: adminUser }, error: null };
      }
      }

      // Create authenticated user
      const mockUser: AuthUser = {
        id: `user_${Date.now()}`,
        email,
        role,
        companyCode: role === 'user' ? 'TECH002' : undefined,
      }

      const userProfile = getOrCreateUserProfile(email, email.split('@')[0], role, mockUser.companyCode)
      const userSession = createSession(userProfile.id)

      setUser(mockUser)
      setUserProfile(userProfile)
      setSession(userSession)

      // Save auth state
      localStorage.setItem('auth_user', JSON.stringify(mockUser))
      localStorage.setItem('auth_session_token', userSession.token)
      localStorage.setItem('auth_user_profile', JSON.stringify(userProfile))

      console.log('✅ User signed in:', { email, role, sessionToken: userSession.token })
      
      // Get redirect path based on role
      const getRedirectPath = (userRole: UserRole): string => {
        switch (userRole) {
          case 'admin': return '/admin'
          case 'trainer': return '/coach/dashboard'
          case 'trainee': return '/trainee/dashboard'
          case 'user': return '/user/dashboard'
          default: return '/'
        }
      }
      
      console.log('✅ Auth state set:', { 
        user: mockUser, 
        userProfile, 
        session: userSession,
        redirectPath: getRedirectPath(role)
      })

      return { data: { user: mockUser }, error: null }
    } catch (error) {
      console.error('❌ Sign in error:', error)
      return { data: null, error: 'Sign in failed' }
    }
  }

  const signUp = async (email: string, _password: string, role: UserRole, name?: string) => {
    try {
      const mockUser: AuthUser = {
        id: `user_${Date.now()}`,
        email,
        role,
        companyCode: role === 'user' ? 'TECH002' : undefined,
      }

      const userProfile = getOrCreateUserProfile(email, name || email.split('@')[0], role, mockUser.companyCode)
      const userSession = createSession(userProfile.id)

      setUser(mockUser)
      setUserProfile(userProfile)
      setSession(userSession)

      // Save auth state
      localStorage.setItem('auth_user', JSON.stringify(mockUser))
      localStorage.setItem('auth_session_token', userSession.token)

      console.log('✅ User signed up:', { email, role, sessionToken: userSession.token })

      return { data: { user: mockUser }, error: null }
    } catch (error) {
      console.error('❌ Sign up error:', error)
      return { data: null, error: 'Sign up failed' }
    }
  }

  const signOut = async () => {
    try {
      // Clear session
      if (session?.token) {
        const sessions = JSON.parse(localStorage.getItem('ipma_sessions') || '[]')
        const updatedSessions = sessions.map((s: UserSession) => 
          s.token === session.token ? { ...s, isActive: false, updatedAt: new Date().toISOString() } : s
        )
        localStorage.setItem('ipma_sessions', JSON.stringify(updatedSessions))
      }

      // Clear auth state
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_session_token')
      localStorage.removeItem('auth_user_profile')

      // Clear user-specific data (but keep global data)
      const userSpecificKeys = ['ipma_attempts', 'ipma_attempt_items']
      userSpecificKeys.forEach(key => {
        const data = JSON.parse(localStorage.getItem(key) || '[]')
        const filteredData = data.filter((item: any) => item.userId !== user?.id)
        localStorage.setItem(key, JSON.stringify(filteredData))
      })

      setUser(null)
      setUserProfile(null)
      setSession(null)

      console.log('✅ User signed out and data cleared')

      return { error: null }
    } catch (error) {
      console.error('❌ Sign out error:', error)
      return { error: 'Sign out failed' }
    }
  }

  const resetPassword = async (email: string) => {
    // Mock password reset
    console.log('Password reset email sent to:', email)
    return { data: {}, error: null }
  }

  const updatePassword = async (_password: string) => {
    // Mock password update
    console.log('Password updated')
    return { data: {}, error: null }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!userProfile) throw new Error('No user profile found')

      const updatedProfile = {
        ...userProfile,
        ...updates,
        updatedAt: new Date().toISOString()
      }

      const users = JSON.parse(localStorage.getItem('ipma_users') || '[]')
      const userIndex = users.findIndex((u: UserProfile) => u.id === userProfile.id)
      
      if (userIndex !== -1) {
        users[userIndex] = updatedProfile
        localStorage.setItem('ipma_users', JSON.stringify(users))
        setUserProfile(updatedProfile)
      }

      console.log('✅ Profile updated:', updates)
      return { data: { user: updatedProfile }, error: null }
    } catch (error) {
      console.error('❌ Profile update error:', error)
      return { data: null, error: 'Profile update failed' }
    }
  }

  const extendSubscription = async (userId: string, days: number) => {
    try {
      const subscriptions = JSON.parse(localStorage.getItem('ipma_subscriptions') || '[]')
      const subscription = subscriptions.find((s: Subscription) => s.userId === userId)
      
      if (subscription) {
        const currentEndDate = new Date(subscription.endDate)
        const newEndDate = new Date(currentEndDate.getTime() + (days * 24 * 60 * 60 * 1000))
        
        subscription.endDate = newEndDate.toISOString()
        subscription.updatedAt = new Date().toISOString()
        
        localStorage.setItem('ipma_subscriptions', JSON.stringify(subscriptions))
        
        // Update user profile if it's the current user
        if (userProfile?.id === userId) {
          setUserProfile({ ...userProfile, subscription })
        }
        
        console.log(`✅ Subscription extended for user ${userId} by ${days} days`)
        return { data: { subscription }, error: null }
      }
      
      return { data: null, error: 'Subscription not found' }
    } catch (error) {
      console.error('❌ Subscription extension error:', error)
      return { data: null, error: 'Subscription extension failed' }
    }
  }

  const signInWithCompanyCode = async (email: string, companyCode: string) => {
    try {
      // Validate company code
      const companyCodes = JSON.parse(localStorage.getItem('ipma_company_codes') || '[]')
      const company = companyCodes.find((cc: any) => 
        cc.code.toUpperCase() === companyCode.toUpperCase() && 
        cc.isActive
      )

      if (!company) {
        return { data: null, error: 'Invalid company code' }
      }

      // Check expiration
      if (new Date(company.expiresAt) < new Date()) {
        return { data: null, error: 'Company code has expired. Please contact your administrator.' }
      }

      // Create authenticated user with company info
      const mockUser: AuthUser = {
        id: `user_${Date.now()}`,
        email,
        role: 'user',
        companyCode: companyCode.toUpperCase(),
      }

      const userProfile = getOrCreateUserProfile(
        email, 
        email.split('@')[0], 
        'user', 
        companyCode.toUpperCase()
      )
      
      // Update user profile with company name
      userProfile.companyName = company.companyName
      
      const userSession = createSession(userProfile.id)

      setUser(mockUser)
      setUserProfile(userProfile)
      setSession(userSession)

      // Save auth state
      localStorage.setItem('auth_user', JSON.stringify(mockUser))
      localStorage.setItem('auth_session_token', userSession.token)
      localStorage.setItem('auth_user_profile', JSON.stringify(userProfile))

      console.log('✅ User signed in with company code:', { 
        email, 
        companyCode, 
        companyName: company.companyName,
        sessionToken: userSession.token 
      })

      return { data: { user: mockUser }, error: null }
    } catch (error) {
      console.error('❌ Company code sign in error:', error)
      return { data: null, error: 'Company code authentication failed' }
    }
  }

  return {
    user,
    userProfile,
    session: session ? { user, session } : null,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    extendSubscription,
    signInWithCompanyCode,
    isDevelopmentMode: isDevelopmentMode()
  }
}
