import { supabase } from '../lib/supabase'
import { Attempt, AttemptItem } from '../types'

export interface ExamResult {
  id: string
  userId: string
  attemptId: string
  totalQuestions: number
  correctAnswers: number
  score: number
  timeSpent: number // in minutes
  completedAt: string
  evaluation: {
    overallScore: number
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
    detailedFeedback: string
  }
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  companyCode: string
  companyName: string
  role: 'user' | 'trainer' | 'admin'
  createdAt: string
  updatedAt: string
}

export class UserDataService {
  private static instance: UserDataService

  static getInstance(): UserDataService {
    if (!UserDataService.instance) {
      UserDataService.instance = new UserDataService()
    }
    return UserDataService.instance
  }

  // Get current user
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        console.log('No authenticated user found')
        return null
      }

      // Get user profile from users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.warn('User profile not found, creating default profile')
        return {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || 'Anonymous User',
          companyCode: 'DEFAULT',
          companyName: 'Default Company',
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }

      return profile
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  // Save exam result to Supabase
  async saveExamResult(
    attempt: Attempt,
    attemptItems: AttemptItem[],
    evaluation: ExamResult['evaluation']
  ): Promise<ExamResult | null> {
    try {
      const user = await this.getCurrentUser()
      if (!user) {
        throw new Error('User must be authenticated to save exam results')
      }

      // Calculate score
      const totalQuestions = attemptItems.length
      const totalScore = attemptItems.reduce((sum, item) => sum + item.score, 0)
      const maxScore = attemptItems.reduce((sum, item) => sum + item.maxScore, 0)
      const correctAnswers = attemptItems.filter(item => item.score >= item.maxScore * 0.67).length // 67% threshold
      const score = maxScore > 0 ? (totalScore / maxScore) * 100 : 0

      // Calculate time spent
      const startTime = new Date(attempt.startTime)
      const endTime = new Date(attempt.endTime || new Date())
      const timeSpent = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)) // minutes

      const examResult: ExamResult = {
        id: `exam_result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        attemptId: attempt.id,
        totalQuestions,
        correctAnswers,
        score: Math.round(score),
        timeSpent,
        completedAt: attempt.endTime || new Date().toISOString(),
        evaluation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      console.log('💾 Saving exam result to Supabase:', {
        userId: user.id,
        attemptId: attempt.id,
        score: examResult.score,
        totalQuestions: examResult.totalQuestions
      })

      // Save to exam_results table
      const { data, error } = await supabase
        .from('exam_results')
        .insert([examResult])
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to save exam result: ${error.message}`)
      }

      console.log('✅ Exam result saved successfully:', data.id)
      return data
    } catch (error) {
      console.error('❌ Error saving exam result:', error)
      throw error
    }
  }

  // Get user's exam results
  async getUserExamResults(userId?: string): Promise<ExamResult[]> {
    try {
      const user = userId ? { id: userId } : await this.getCurrentUser()
      if (!user) {
        throw new Error('User must be authenticated to view exam results')
      }

      const { data, error } = await supabase
        .from('exam_results')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch exam results: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('❌ Error fetching exam results:', error)
      return []
    }
  }

  // Get exam result by ID
  async getExamResult(resultId: string): Promise<ExamResult | null> {
    try {
      const { data, error } = await supabase
        .from('exam_results')
        .select('*')
        .eq('id', resultId)
        .single()

      if (error) {
        throw new Error(`Failed to fetch exam result: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('❌ Error fetching exam result:', error)
      return null
    }
  }

  // Get all exam results (for trainers/admins)
  async getAllExamResults(): Promise<ExamResult[]> {
    try {
      const user = await this.getCurrentUser()
      if (!user || (user.role !== 'trainer' && user.role !== 'admin')) {
        throw new Error('Only trainers and admins can view all exam results')
      }

      const { data, error } = await supabase
        .from('exam_results')
        .select(`
          *,
          users!exam_results_user_id_fkey (
            id,
            email,
            name,
            company_code,
            company_name
          )
        `)
        .order('completed_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch all exam results: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('❌ Error fetching all exam results:', error)
      return []
    }
  }

  // Create or update user profile
  async upsertUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const user = await this.getCurrentUser()
      if (!user) {
        throw new Error('User must be authenticated to update profile')
      }

      const profileData = {
        id: user.id,
        email: profile.email || user.email,
        name: profile.name || user.name,
        company_code: profile.companyCode || user.companyCode,
        company_name: profile.companyName || user.companyName,
        role: profile.role || user.role,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('users')
        .upsert([profileData], { onConflict: 'id' })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update user profile: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('❌ Error updating user profile:', error)
      return null
    }
  }

  // Authenticate user (sign in or sign up)
  async authenticateUser(email: string, password: string, isSignUp: boolean = false): Promise<UserProfile | null> {
    try {
      let authResult
      
      if (isSignUp) {
        authResult = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: email.split('@')[0] // Use email prefix as default name
            }
          }
        })
      } else {
        authResult = await supabase.auth.signInWithPassword({
          email,
          password
        })
      }

      if (authResult.error) {
        throw new Error(authResult.error.message)
      }

      if (!authResult.data.user) {
        throw new Error('Authentication failed')
      }

      // Get or create user profile
      const profile = await this.getCurrentUser()
      return profile
    } catch (error) {
      console.error('❌ Authentication error:', error)
      throw error
    }
  }

  // Sign out user
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw new Error(error.message)
      }
      console.log('✅ User signed out successfully')
    } catch (error) {
      console.error('❌ Sign out error:', error)
      throw error
    }
  }
}
