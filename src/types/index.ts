export type UserRole = 'admin' | 'trainer' | 'trainee' | 'user'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  companyCode?: string
  companyName?: string
  subscription?: Subscription
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: string
  userId: string
  startDate: string
  endDate: string
  isActive: boolean
  planType: 'trial' | 'monthly' | 'quarterly' | 'yearly'
  autoRenew: boolean
  reminderSent: {
    sevenDays: boolean
    oneDay: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface UserSession {
  id: string
  userId: string
  token: string
  expiresAt: string
  lastActivity: string
  isActive: boolean
  userAgent?: string
  ipAddress?: string
  createdAt: string
  updatedAt: string
}

export interface Topic {
  id: string
  title: string
  description: string
  isActive: boolean
  subtopics: Subtopic[]
  createdAt: string
  updatedAt: string
}

export interface Subtopic {
  id: string
  title: string
  description: string
  isActive: boolean
  topicId: string
  createdAt: string
  updatedAt: string
}

export interface Question {
  id: string
  topicId: string
  subtopicId?: string
  prompt: string
  isActive: boolean
  connectedKPIs: string[] // Array of KPI IDs
  createdAt: string
  updatedAt: string
}

export interface KPI {
  id: string
  topicId: string
  subtopicId: string // Required - KPIs must belong to a specific subtopic
  name: string
  isEssential: boolean
  connectedQuestions: string[] // Array of Question IDs
  createdAt: string
  updatedAt: string
}


export interface CompanyCode {
  id: string
  code: string
  companyName: string
  adminEmail: string // Email for admin access control
  authorizedEmails: string[] // List of authorized email addresses
  isActive: boolean
  maxUsers: number
  expiresAt: string
  createdAt: string
  updatedAt: string
}

export interface SampleAnswer {
  id: string
  questionId: string
  answerText: string
  qualityRating: number // 0-3 scale
  detectedKPIs: string[]
  feedback: string
  createdAt: string
  updatedAt: string
}

export interface TrainingExample {
  id: string
  questionId: string
  answerText: string
  qualityRating: number // 0-3 scale
  detectedKPIs: string[]
  feedback: string
  exampleType: 'grading' | 'evaluation' | 'training'
  createdAt: string
  updatedAt: string
}

export interface EvaluationResult {
  toteutuneet_kpi: string[]
  puuttuvat_kpi: string[]
  pisteet: number
  sanallinen_arvio: string
}

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  companyCode?: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface ResetPasswordFormData {
  email: string
}

export interface UpdatePasswordFormData {
  password: string
  confirmPassword: string
}

export interface Language {
  code: 'en' | 'fi'
  name: string
  flag: string
}

export interface PracticeSession {
  topicId: string
  questions: Question[]
  currentQuestionIndex: number
  answers: Record<string, string>
  startTime: number
  timeRemaining: number
}

export interface Attempt {
  id: string
  userId: string
  topicId: string
  selectedQuestionIds: string[]
  startTime: string
  endTime?: string
  status: 'in_progress' | 'completed' | 'timeout' | 'abandoned'
  totalTime: number // in minutes
  timeRemaining: number // in seconds
  score?: number
  passed?: boolean
  submittedAt?: string
  createdAt: string
  updatedAt: string
}

export interface AttemptItem {
  id: string
  attemptId: string
  questionId: string
  answer: string
  kpisDetected: string[]
  kpisMissing: string[]
  score: number
  maxScore: number
  feedback: string
  isEvaluated: boolean
  evaluationJSON?: EvaluationResult
  durationSec: number
  submittedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ExamResult {
  attemptId: string
  totalQuestions: number
  totalKpis: number
  kpisDetected: number
  kpisMissing: number
  totalScore: number
  maxScore: number
  kpiPercentage: number
  scorePercentage: number
  passed: boolean
  feedback: string
  questionResults: AttemptItem[]
}
