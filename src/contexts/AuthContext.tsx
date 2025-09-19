import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserDataService, UserProfile } from '../services/userDataService'

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<UserProfile | null>
  signUp: (email: string, password: string, name: string, companyCode: string) => Promise<UserProfile | null>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      setLoading(true)
      const userDataService = UserDataService.getInstance()
      const currentUser = await userDataService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Error initializing auth:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string): Promise<UserProfile | null> => {
    try {
      const userDataService = UserDataService.getInstance()
      const userProfile = await userDataService.authenticateUser(email, password, false)
      setUser(userProfile)
      return userProfile
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, name: string, companyCode: string): Promise<UserProfile | null> => {
    try {
      const userDataService = UserDataService.getInstance()
      const userProfile = await userDataService.authenticateUser(email, password, true, name, companyCode)
      setUser(userProfile)
      return userProfile
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      const userDataService = UserDataService.getInstance()
      await userDataService.signOut()
      setUser(null)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const refreshUser = async (): Promise<void> => {
    try {
      const userDataService = UserDataService.getInstance()
      const currentUser = await userDataService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Refresh user error:', error)
      setUser(null)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
