import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Topic, Question, KPI, CompanyCode, Subtopic, SampleAnswer, TrainingExample, Attempt, AttemptItem, UserProfile, Subscription, ExamResult } from '../types'
import { mockTopics, mockQuestions, mockKPIs, mockCompanyCodes, mockSubtopics, mockSampleAnswers, mockTrainingExamples } from '../lib/mockData'
import { validateTopicTitle, validateQuestionPrompt, sanitizeInput } from '../lib/validation'
import { SupabaseDataService } from '../services/supabaseDataService'
import { ExamDataService } from '../services/examDataService'
import { supabase } from '../lib/supabase'

// Data persistence utilities with user-specific storage
const STORAGE_KEYS = {
  // Global data (shared across all users)
  topics: 'ipma_topics',
  questions: 'ipma_questions',
  kpis: 'ipma_kpis',
  companyCodes: 'ipma_company_codes',
  subtopics: 'ipma_subtopics',
  sampleAnswers: 'ipma_sample_answers',
  trainingExamples: 'ipma_training_examples',
  users: 'ipma_users',
  subscriptions: 'ipma_subscriptions',
  // User-specific data (separated by user ID)
  attempts: (userId: string) => `ipma_attempts_${userId}`,
  attemptItems: (userId: string) => `ipma_attempt_items_${userId}`,
  userSessions: 'ipma_sessions'
}

const loadFromStorage = <T,>(key: string, fallback: T[]): T[] => {
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      const parsed = JSON.parse(stored)
      
      // Handle both old format (array) and new format (object with data property)
      let data
      if (Array.isArray(parsed)) {
        data = parsed
      } else if (parsed && Array.isArray(parsed.data)) {
        data = parsed.data
        console.log(`📊 Loaded ${data.length} items from ${key} (timestamp: ${parsed.timestamp})`)
      } else {
        console.warn(`Invalid data format for ${key}, using fallback`)
        return fallback
      }
      
      return data
    }
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error)
  }
  return fallback
}

const saveToStorage = <T,>(key: string, data: T[]): void => {
  try {
    // Validate data before saving
    if (!Array.isArray(data)) {
      console.error(`Attempted to save non-array data for ${key}`)
      return
    }
    
    // Add timestamp for debugging
    const dataWithTimestamp = {
      data: data,
      timestamp: new Date().toISOString(),
      count: data.length
    }
    
    localStorage.setItem(key, JSON.stringify(dataWithTimestamp))
    console.log(`✅ Saved ${data.length} items to ${key}`)
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error)
    
    // Try to save without timestamp if the above fails
    try {
      localStorage.setItem(key, JSON.stringify(data))
      console.log(`✅ Fallback save successful for ${key}`)
    } catch (fallbackError) {
      console.error(`❌ Fallback save also failed for ${key}:`, fallbackError)
    }
  }
}

interface DataContextType {
  // Global data (shared across users)
  topics: Topic[]
  questions: Question[]
  kpis: KPI[]
  companyCodes: CompanyCode[]
  subtopics: Subtopic[]
  sampleAnswers: SampleAnswer[]
  trainingExamples: TrainingExample[]
  users: UserProfile[]
  subscriptions: Subscription[]
  
  // Topic management
  addTopic: (topic: Omit<Topic, 'id' | 'createdAt' | 'updatedAt' | 'subtopics'>) => Promise<void>
  updateTopic: (id: string, updates: Partial<Topic>) => Promise<void>
  deleteTopic: (id: string) => Promise<void>
  
  // Subtopic management
  addSubtopic: (subtopic: Omit<Subtopic, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateSubtopic: (id: string, updates: Partial<Subtopic>) => Promise<void>
  deleteSubtopic: (id: string) => Promise<void>
  
  // Question management
  addQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateQuestion: (id: string, updates: Partial<Question>) => Promise<void>
  deleteQuestion: (id: string) => Promise<void>
  
  // KPI management
  addKPI: (kpi: Omit<KPI, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateKPI: (id: string, updates: Partial<KPI>) => Promise<void>
  deleteKPI: (id: string) => Promise<void>
  connectKPIToQuestion: (kpiId: string, questionId: string) => Promise<void>
  disconnectKPIFromQuestion: (kpiId: string, questionId: string) => Promise<void>
  
  // Company code management
  addCompanyCode: (company: Omit<CompanyCode, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateCompanyCode: (id: string, updates: Partial<CompanyCode>) => Promise<void>
  deleteCompanyCode: (id: string) => Promise<void>
  
  // Sample answer management
  addSampleAnswer: (answer: Omit<SampleAnswer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateSampleAnswer: (id: string, updates: Partial<SampleAnswer>) => Promise<void>
  deleteSampleAnswer: (id: string) => Promise<void>
  
  // Training example management
  addTrainingExample: (example: Omit<TrainingExample, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTrainingExample: (id: string, updates: Partial<TrainingExample>) => Promise<void>
  deleteTrainingExample: (id: string) => Promise<void>
  
  // User management
  addUser: (user: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateUser: (id: string, updates: Partial<UserProfile>) => void
  deleteUser: (id: string) => void
  getUser: (id: string) => UserProfile | undefined
  getUserByEmail: (email: string) => UserProfile | undefined
  
  // Subscription management
  addSubscription: (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateSubscription: (id: string, updates: Partial<Subscription>) => void
  deleteSubscription: (id: string) => void
  getSubscription: (userId: string) => Subscription | undefined
  extendSubscription: (userId: string, days: number) => void
  checkSubscriptionExpiry: () => { expired: UserProfile[], expiringSoon: UserProfile[] }
  updateSubscriptionReminderStatus: (subscriptionId: string, reminderType: 'sevenDays' | 'oneDay') => void
  
  // User-specific attempt management (Supabase)
  getUserAttempts: (userId: string) => Promise<Attempt[]>
  getUserAttemptItems: (userId: string) => Promise<AttemptItem[]>
  createAttempt: (userId: string, topicId: string, selectedQuestionIds: string[]) => Promise<Attempt>
  updateAttempt: (id: string, updates: Partial<Attempt>) => Promise<void>
  getAttempt: (id: string) => Promise<Attempt | undefined>
  createAttemptItem: (attemptId: string, questionId: string, answer: string) => Promise<AttemptItem>
  updateAttemptItem: (id: string, updates: Partial<AttemptItem>) => Promise<void>
  getAttemptItems: (attemptId: string) => Promise<AttemptItem[]>
  selectRandomQuestions: (topicId: string) => string[]
  
  // Exam data persistence (Supabase)
  saveExamAttempt: (attempt: Attempt) => Promise<void>
  saveExamAttemptItem: (attemptItem: AttemptItem) => Promise<void>
  saveExamResult: (examResult: ExamResult, userId: string) => Promise<void>
  getUserExamHistory: (userId: string) => Promise<ExamResult[]>
  getUserDetailedAnswers: (userId: string, attemptId?: string) => Promise<AttemptItem[]>
  getCompanyExamStats: (companyCode: string) => Promise<{
    totalExams: number
    averageScore: number
    passRate: number
    recentExams: ExamResult[]
  }>
  
  // User management for companies
  createUserForCompany: (email: string, companyCode: string, companyName: string) => Promise<{success: boolean, userId?: string, error?: string}>
  removeUserForCompany: (email: string, companyCode: string) => Promise<{success: boolean, error?: string}>
  
  // Data management
  clearAllData: () => void
  exportAllData: () => Promise<DataSnapshot>
  importAllData: (snapshot: DataSnapshot) => void
}

interface DataSnapshot {
  topics: Topic[]
  questions: Question[]
  kpis: KPI[]
  companyCodes: CompanyCode[]
  subtopics: Subtopic[]
  sampleAnswers: SampleAnswer[]
  trainingExamples: TrainingExample[]
  users: UserProfile[]
  subscriptions: Subscription[]
  attempts: Attempt[]
  attemptItems: AttemptItem[]
  metadata: {
    version: string
    timestamp: string
    recordCount: number
  }
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider = ({ children }: { children: ReactNode }) => {
  // Global data (shared across users)
  const [topics, setTopics] = useState<Topic[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [kpis, setKpis] = useState<KPI[]>([])
  const [companyCodes, setCompanyCodes] = useState<CompanyCode[]>([])
  const [subtopics, setSubtopics] = useState<Subtopic[]>([])
  const [sampleAnswers, setSampleAnswers] = useState<SampleAnswer[]>([])
  const [trainingExamples, setTrainingExamples] = useState<TrainingExample[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])

  // Initialize Supabase data service
  const supabaseDataService = SupabaseDataService.getInstance()

  // Load data from Supabase ONLY (Supabase is PRIMARY source)
  useEffect(() => {
    const loadData = async () => {
      console.log('🔄 Loading data from Supabase (PRIMARY source)...')
      
      try {
        // Load ALL data from Supabase
        const [
          supabaseTopics,
          supabaseSubtopics,
          supabaseQuestions,
          supabaseKpis,
          supabaseCompanyCodes,
          supabaseSampleAnswers,
          supabaseTrainingExamples
        ] = await Promise.all([
          supabaseDataService.getAllTopics(),
          supabaseDataService.getAllSubtopics(),
          supabaseDataService.getAllQuestions(),
          supabaseDataService.getAllKPIs(),
          supabaseDataService.getAllCompanyCodes(),
          supabaseDataService.getAllSampleAnswers(),
          supabaseDataService.getAllTrainingExamples()
        ])

        console.log('✅ Data loaded from Supabase:', {
          topics: supabaseTopics.length,
          subtopics: supabaseSubtopics.length,
          questions: supabaseQuestions.length,
          kpis: supabaseKpis.length,
          companyCodes: supabaseCompanyCodes.length
        })

        // Set state from Supabase (use mock data only if Supabase is empty)
        setTopics(supabaseTopics.length > 0 ? supabaseTopics : mockTopics)
        setSubtopics(supabaseSubtopics)
        setQuestions(supabaseQuestions.length > 0 ? supabaseQuestions : mockQuestions)
        setKpis(supabaseKpis.length > 0 ? supabaseKpis : mockKPIs)
        setCompanyCodes(supabaseCompanyCodes.length > 0 ? supabaseCompanyCodes : mockCompanyCodes)
        setSampleAnswers(supabaseSampleAnswers)
        setTrainingExamples(supabaseTrainingExamples)

        // Cache to localStorage for faster subsequent loads
        saveToStorage(STORAGE_KEYS.topics, supabaseTopics.length > 0 ? supabaseTopics : mockTopics)
        saveToStorage(STORAGE_KEYS.subtopics, supabaseSubtopics)
        saveToStorage(STORAGE_KEYS.questions, supabaseQuestions.length > 0 ? supabaseQuestions : mockQuestions)
        saveToStorage(STORAGE_KEYS.kpis, supabaseKpis.length > 0 ? supabaseKpis : mockKPIs)
        saveToStorage(STORAGE_KEYS.companyCodes, supabaseCompanyCodes.length > 0 ? supabaseCompanyCodes : mockCompanyCodes)
        saveToStorage(STORAGE_KEYS.sampleAnswers, supabaseSampleAnswers)
        saveToStorage(STORAGE_KEYS.trainingExamples, supabaseTrainingExamples)
        
      } catch (error) {
        console.error('❌ CRITICAL: Failed to load from Supabase:', error)
        console.error('⚠️ Check your .env.local file and Supabase credentials!')
        
        // Emergency fallback to localStorage
        console.log('📦 Attempting emergency fallback to localStorage...')
      const loadedTopics = loadFromStorage(STORAGE_KEYS.topics, mockTopics)
        const loadedSubtopics = loadFromStorage(STORAGE_KEYS.subtopics, mockSubtopics)
      const loadedQuestions = loadFromStorage(STORAGE_KEYS.questions, mockQuestions)
      const loadedKpis = loadFromStorage(STORAGE_KEYS.kpis, mockKPIs)
      const loadedCompanyCodes = loadFromStorage(STORAGE_KEYS.companyCodes, mockCompanyCodes)
      const loadedSampleAnswers = loadFromStorage(STORAGE_KEYS.sampleAnswers, mockSampleAnswers)
      const loadedTrainingExamples = loadFromStorage(STORAGE_KEYS.trainingExamples, mockTrainingExamples)

      setTopics(Array.isArray(loadedTopics) ? loadedTopics : mockTopics)
        setSubtopics(Array.isArray(loadedSubtopics) ? loadedSubtopics : mockSubtopics)
      setQuestions(Array.isArray(loadedQuestions) ? loadedQuestions : mockQuestions)
      setKpis(Array.isArray(loadedKpis) ? loadedKpis : mockKPIs)
      setCompanyCodes(Array.isArray(loadedCompanyCodes) ? loadedCompanyCodes : mockCompanyCodes)
      setSampleAnswers(Array.isArray(loadedSampleAnswers) ? loadedSampleAnswers : mockSampleAnswers)
      setTrainingExamples(Array.isArray(loadedTrainingExamples) ? loadedTrainingExamples : mockTrainingExamples)
      }
    }

    loadData()
  }, [])

  // Removed redundant auto-restore - we now load directly from Supabase tables

  // Save global data to localStorage whenever it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.topics, topics)
  }, [topics])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.questions, questions)
  }, [questions])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.kpis, kpis)
  }, [kpis])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.companyCodes, companyCodes)
  }, [companyCodes])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.subtopics, subtopics)
  }, [subtopics])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.sampleAnswers, sampleAnswers)
  }, [sampleAnswers])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.trainingExamples, trainingExamples)
  }, [trainingExamples])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.users, users)
  }, [users])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.subscriptions, subscriptions)
  }, [subscriptions])

  // Topic management functions
  const addTopic = async (topicData: Omit<Topic, 'id' | 'createdAt' | 'updatedAt' | 'subtopics'>) => {
    // Validate input
    const titleValidation = validateTopicTitle(topicData.title)
    if (!titleValidation.isValid) {
      throw new Error(titleValidation.error || 'Invalid topic title')
    }

    // Check for duplicates
    const existingTopic = topics.find(t => t.title.toLowerCase() === topicData.title.toLowerCase())
    if (existingTopic) {
      throw new Error('A topic with this title already exists')
    }

    const newTopic: Topic = {
      ...topicData,
      title: sanitizeInput(topicData.title),
      description: sanitizeInput(topicData.description),
      subtopics: [],
      id: `topic_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    // Update local state
    setTopics(prev => [...prev, newTopic])
    
    // Sync to Supabase
    try {
      await supabaseDataService.upsertTopic(newTopic)
      console.log('✅ Topic synced to Supabase:', newTopic.id)
    } catch (error) {
      console.warn('⚠️ Failed to sync topic to Supabase:', error)
    }
  }

  const updateTopic = async (id: string, updates: Partial<Topic>) => {
    let updatedTopic: Topic | null = null
    
    setTopics(prev => prev.map(topic => {
      if (topic.id === id) {
        updatedTopic = { ...topic, ...updates, updatedAt: new Date().toISOString() }
        return updatedTopic
      }
      return topic
    }))
    
    // Sync to Supabase
    if (updatedTopic) {
      try {
        await supabaseDataService.upsertTopic(updatedTopic)
        console.log('✅ Topic update synced to Supabase:', id)
      } catch (error) {
        console.warn('⚠️ Failed to sync topic update to Supabase:', error)
      }
    }
  }

  const deleteTopic = async (id: string) => {
    setTopics(prev => prev.filter(topic => topic.id !== id))
    // Also delete related questions, KPIs, and subtopics
    setQuestions(prev => prev.filter(question => question.topicId !== id))
    setKpis(prev => prev.filter(kpi => kpi.topicId !== id))
    setSubtopics(prev => prev.filter(subtopic => subtopic.topicId !== id))
    
    // Sync to Supabase
    try {
      await supabaseDataService.deleteTopic(id)
      console.log('✅ Topic deletion synced to Supabase:', id)
    } catch (error) {
      console.warn('⚠️ Failed to sync topic deletion to Supabase:', error)
    }
  }

  const addSubtopic = async (subtopicData: Omit<Subtopic, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSubtopic: Subtopic = {
      ...subtopicData,
      id: `subtopic_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setSubtopics(prev => [...prev, newSubtopic])
    // Update the topic's subtopics array
    setTopics(prev => prev.map(topic => 
      topic.id === subtopicData.topicId 
        ? { ...topic, subtopics: [...topic.subtopics, newSubtopic] }
        : topic
    ))
    
    // Sync to Supabase
    try {
      await supabaseDataService.upsertSubtopic(newSubtopic)
      console.log('✅ Subtopic synced to Supabase:', newSubtopic.id)
    } catch (error) {
      console.warn('⚠️ Failed to sync subtopic to Supabase:', error)
    }
  }

  const updateSubtopic = async (id: string, updates: Partial<Subtopic>) => {
    let updatedSubtopic: Subtopic | null = null
    
    setSubtopics(prev => prev.map(subtopic => {
      if (subtopic.id === id) {
        updatedSubtopic = { ...subtopic, ...updates, updatedAt: new Date().toISOString() }
        return updatedSubtopic
      }
      return subtopic
    }))
    
    // Sync to Supabase
    if (updatedSubtopic) {
      try {
        await supabaseDataService.upsertSubtopic(updatedSubtopic)
        console.log('✅ Subtopic update synced to Supabase:', id)
      } catch (error) {
        console.warn('⚠️ Failed to sync subtopic update to Supabase:', error)
      }
    }
  }

  const deleteSubtopic = async (id: string) => {
    console.log('DataContext deleteSubtopic called with ID:', id)
    console.log('Current subtopics before deletion:', subtopics.map(s => ({ id: s.id, title: s.title })))
    
    const subtopic = subtopics.find(s => s.id === id)
    console.log('Found subtopic to delete:', subtopic)
    
    if (subtopic) {
      setSubtopics(prev => {
        const filtered = prev.filter(s => s.id !== id)
        console.log('Subtopics after filtering:', filtered.map(s => ({ id: s.id, title: s.title })))
        return filtered
      })
      // Update the topic's subtopics array
      setTopics(prev => prev.map(topic => 
        topic.id === subtopic.topicId 
          ? { ...topic, subtopics: topic.subtopics.filter(s => s.id !== id) }
          : topic
      ))
      
      // Sync to Supabase
      try {
        await supabaseDataService.deleteSubtopic(id)
        console.log('✅ Subtopic deletion synced to Supabase:', id)
      } catch (error) {
        console.warn('⚠️ Failed to sync subtopic deletion to Supabase:', error)
      }
    } else {
      console.error('Subtopic not found with ID:', id)
    }
  }

  const addQuestion = async (questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Validate input
    const promptValidation = validateQuestionPrompt(questionData.prompt)
    if (!promptValidation.isValid) {
      throw new Error(promptValidation.error || 'Invalid question prompt')
    }

    // Validate topic exists
    const topic = (topics || []).find(t => t.id === questionData.topicId)
    if (!topic) {
      throw new Error('Invalid topic ID')
    }

    const newQuestion: Question = {
      ...questionData,
      prompt: sanitizeInput(questionData.prompt),
      connectedKPIs: questionData.connectedKPIs || [],
      id: `question_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setQuestions(prev => [...prev, newQuestion])
    
    // Sync to Supabase
    try {
      await supabaseDataService.upsertQuestion(newQuestion)
      console.log('✅ Question synced to Supabase:', newQuestion.id)
    } catch (error) {
      console.warn('⚠️ Failed to sync question to Supabase:', error)
    }
  }

  const updateQuestion = async (id: string, updates: Partial<Question>) => {
    let updatedQuestion: Question | null = null
    
    setQuestions(prev => prev.map(question => {
      if (question.id === id) {
        updatedQuestion = { ...question, ...updates, updatedAt: new Date().toISOString() }
        return updatedQuestion
      }
      return question
    }))
    
    // Sync to Supabase
    if (updatedQuestion) {
      try {
        await supabaseDataService.upsertQuestion(updatedQuestion)
        console.log('✅ Question update synced to Supabase:', id)
      } catch (error) {
        console.warn('⚠️ Failed to sync question update to Supabase:', error)
      }
    }
  }

  const deleteQuestion = async (id: string) => {
    setQuestions(prev => prev.filter(question => question.id !== id))
    
    // Sync to Supabase
    try {
      await supabaseDataService.deleteQuestion(id)
      console.log('✅ Question deletion synced to Supabase:', id)
    } catch (error) {
      console.warn('⚠️ Failed to sync question deletion to Supabase:', error)
    }
  }

  const addKPI = async (kpiData: Omit<KPI, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Ensure KPIs always have a subtopicId
    if (!kpiData.subtopicId) {
      throw new Error('KPIs must belong to a specific subtopic')
    }
    
    const newKPI: KPI = {
      ...kpiData,
      connectedQuestions: kpiData.connectedQuestions || [],
      id: `kpi_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setKpis(prev => [...prev, newKPI])
    
    // Sync to Supabase
    try {
      await supabaseDataService.upsertKPI(newKPI)
      console.log('✅ KPI synced to Supabase:', newKPI.id)
    } catch (error) {
      console.warn('⚠️ Failed to sync KPI to Supabase:', error)
    }
  }

  const updateKPI = async (id: string, updates: Partial<KPI>) => {
    let updatedKPI: KPI | null = null
    
    setKpis(prev => prev.map(kpi => {
      if (kpi.id === id) {
        updatedKPI = { ...kpi, ...updates, updatedAt: new Date().toISOString() }
        return updatedKPI
      }
      return kpi
    }))
    
    // Sync to Supabase
    if (updatedKPI) {
      try {
        await supabaseDataService.upsertKPI(updatedKPI)
        console.log('✅ KPI update synced to Supabase:', id)
      } catch (error) {
        console.warn('⚠️ Failed to sync KPI update to Supabase:', error)
      }
    }
  }

  const deleteKPI = async (id: string) => {
    setKpis(prev => prev.filter(kpi => kpi.id !== id))
    
    // Sync to Supabase
    try {
      await supabaseDataService.deleteKPI(id)
      console.log('✅ KPI deletion synced to Supabase:', id)
    } catch (error) {
      console.warn('⚠️ Failed to sync KPI deletion to Supabase:', error)
    }
  }

  const connectKPIToQuestion = async (kpiId: string, questionId: string) => {
    let updatedKPI: KPI | null = null
    let updatedQuestion: Question | null = null

    setKpis(prev => prev.map(kpi => {
      if (kpi.id === kpiId) {
        updatedKPI = { ...kpi, connectedQuestions: [...kpi.connectedQuestions, questionId] }
        return updatedKPI
      }
      return kpi
    }))

    setQuestions(prev => prev.map(question => {
      if (question.id === questionId) {
        updatedQuestion = { ...question, connectedKPIs: [...question.connectedKPIs, kpiId] }
        return updatedQuestion
      }
      return question
    }))

    // Sync to Supabase
    try {
      if (updatedKPI) await supabaseDataService.upsertKPI(updatedKPI)
      if (updatedQuestion) await supabaseDataService.upsertQuestion(updatedQuestion)
      console.log('✅ KPI-Question connection synced to Supabase')
    } catch (error) {
      console.warn('⚠️ Failed to sync KPI-Question connection to Supabase:', error)
    }
  }

  const disconnectKPIFromQuestion = async (kpiId: string, questionId: string) => {
    let updatedKPI: KPI | null = null
    let updatedQuestion: Question | null = null

    setKpis(prev => prev.map(kpi => {
      if (kpi.id === kpiId) {
        updatedKPI = { ...kpi, connectedQuestions: kpi.connectedQuestions.filter(id => id !== questionId) }
        return updatedKPI
      }
      return kpi
    }))

    setQuestions(prev => prev.map(question => {
      if (question.id === questionId) {
        updatedQuestion = { ...question, connectedKPIs: question.connectedKPIs.filter(id => id !== kpiId) }
        return updatedQuestion
      }
      return question
    }))

    // Sync to Supabase
    try {
      if (updatedKPI) await supabaseDataService.upsertKPI(updatedKPI)
      if (updatedQuestion) await supabaseDataService.upsertQuestion(updatedQuestion)
      console.log('✅ KPI-Question disconnection synced to Supabase')
    } catch (error) {
      console.warn('⚠️ Failed to sync KPI-Question disconnection to Supabase:', error)
    }
  }

  const addCompanyCode = async (companyData: Omit<CompanyCode, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCompanyCode: CompanyCode = {
      ...companyData,
      id: `company_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setCompanyCodes(prev => [...prev, newCompanyCode])

    // Sync to Supabase
    try {
      await supabaseDataService.upsertCompanyCode(newCompanyCode)
      console.log('✅ Company code synced to Supabase:', newCompanyCode.id)
    } catch (error) {
      console.warn('⚠️ Failed to sync company code to Supabase:', error)
    }
  }

  // Create user via serverless function to prevent admin session hijacking
  const createUserForCompany = async (email: string, companyCode: string, companyName: string) => {
    try {
      console.log('🔄 Creating user via serverless function:', { email, companyCode, companyName })
      
      // Check if user already exists in public.users
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, email, company_code')
        .eq('email', email)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking existing user:', checkError)
        throw new Error(`Failed to check existing user: ${checkError.message}`)
      }

      if (existingUser) {
        console.log('⚠️ User already exists in public.users:', existingUser)
        
        // If user exists but has different company code, update it
        if (existingUser.company_code !== companyCode) {
          console.log('🔄 Updating existing user with new company code')
          const { error: updateError } = await supabase
            .from('users')
            .update({
              company_code: companyCode,
              company_name: companyName,
              updated_at: new Date().toISOString()
            })
            .eq('email', email)

          if (updateError) {
            console.error('❌ Failed to update existing user:', updateError)
            throw new Error(`Failed to update existing user: ${updateError.message}`)
          }

          console.log('✅ Updated existing user with new company code')
          return { success: true, userId: existingUser.id }
        } else {
          console.log('✅ User already exists with correct company code')
          return { success: true, userId: existingUser.id }
        }
      }

      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session found')
      }

      // Store current admin session to restore later
      const adminSession = session

      // Create user in Supabase Auth first (this is required for login)
      console.log('🔄 Creating user in Supabase Auth...')
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: companyCode.toUpperCase(), // Company code is the password
        options: {
          data: {
            name: email.split('@')[0],
            company_code: companyCode,
            company_name: companyName
          }
        }
      })

      console.log('🔄 Supabase Auth signUp result:', { authData, authError })

      if (authError) {
        console.error('❌ Failed to create user in Supabase Auth:', authError)
        throw new Error(`Failed to create user in Supabase Auth: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('No user data returned from Supabase Auth')
      }

      // Create user profile in our users table using the Auth UUID
      const userProfileData = {
        id: authData.user.id, // Use the UUID from Supabase Auth
        email: email,
        name: email.split('@')[0],
        role: 'user',
        company_code: companyCode,
        company_name: companyName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('🔄 Creating/updating user profile with data:', userProfileData)

      const { error: profileError } = await supabase
        .from('users')
        .upsert([userProfileData], { onConflict: 'id' })

      if (profileError) {
        console.error('❌ Failed to create/update user profile:', profileError)
        throw new Error(`Failed to create/update user profile: ${profileError.message}`)
      }

      // Restore admin session to prevent redirect
      console.log('🔄 Restoring admin session...')
      await supabase.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token
      })

      console.log('✅ User created successfully in both auth.users and public.users:', { email, userId: authData.user.id })
      return { success: true, userId: authData.user.id }

    } catch (error) {
      console.error('❌ Error creating user:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Remove user when email is removed from company
  const removeUserForCompany = async (email: string, companyCode: string) => {
    try {
      console.log('🔄 Removing user from Supabase:', { email, companyCode })
      
      // Find user by email and company code
      const { data: userData, error: findError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .eq('company_code', companyCode)
        .single()

      if (findError || !userData) {
        console.warn('⚠️ User not found for removal:', { email, companyCode })
        return { success: true } // Not an error if user doesn't exist
      }

      // Note: Cannot delete users via anon key - would need service role key
      // For now, just delete from our users table
      console.log('⚠️ Cannot delete from Supabase Auth with anon key - user profile removed from database only')

      // Delete user profile from our users table
      const { error: profileError } = await supabase
        .from('users')
        .delete()
        .eq('id', userData.id)

      if (profileError) {
        console.error('❌ Failed to delete user profile:', profileError)
        throw new Error(`Failed to delete user profile: ${profileError.message}`)
      }

      console.log('✅ User removed successfully:', { email, userId: userData.id })
      return { success: true }

    } catch (error) {
      console.error('❌ Error removing user:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  const updateCompanyCode = async (id: string, updates: Partial<CompanyCode>) => {
    let updatedCompany: CompanyCode | null = null
    let previousCompany: CompanyCode | null = null

    setCompanyCodes(prev => prev.map(company => {
      if (company.id === id) {
        previousCompany = company
        updatedCompany = { ...company, ...updates, updatedAt: new Date().toISOString() }
        return updatedCompany
      }
      return company
    }))

    // Handle user removal when emails are removed
    if (previousCompany && updatedCompany && updates.authorizedEmails) {
      const previousEmails = (previousCompany as CompanyCode).authorizedEmails || []
      const updatedEmails = updates.authorizedEmails
      const removedEmails = previousEmails.filter(
        (email: string) => !updatedEmails.includes(email)
      )
      
      // Remove users for emails that were removed from the company code
      for (const email of removedEmails) {
        try {
          await removeUserForCompany(email, (previousCompany as CompanyCode).code)
        } catch (error) {
          console.error('Error handling user removal:', error)
        }
      }
    }

    // Sync to Supabase
    if (updatedCompany) {
      try {
        await supabaseDataService.upsertCompanyCode(updatedCompany)
        console.log('✅ Company code update synced to Supabase:', id)
      } catch (error) {
        console.warn('⚠️ Failed to sync company code update to Supabase:', error)
      }
    }
  }

  const deleteCompanyCode = async (id: string) => {
    setCompanyCodes(prev => prev.filter(company => company.id !== id))

    // Sync to Supabase
    try {
      await supabaseDataService.deleteCompanyCode(id)
      console.log('✅ Company code deletion synced to Supabase:', id)
    } catch (error) {
      console.warn('⚠️ Failed to sync company code deletion to Supabase:', error)
    }
  }

  const addSampleAnswer = async (answerData: Omit<SampleAnswer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSampleAnswer: SampleAnswer = {
      ...answerData,
      id: `sample_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setSampleAnswers(prev => [...prev, newSampleAnswer])

    // Sync to Supabase
    try {
      await supabaseDataService.upsertSampleAnswer(newSampleAnswer)
      console.log('✅ Sample answer synced to Supabase:', newSampleAnswer.id)
    } catch (error) {
      console.warn('⚠️ Failed to sync sample answer to Supabase:', error)
    }
  }

  const updateSampleAnswer = async (id: string, updates: Partial<SampleAnswer>) => {
    let updatedAnswer: SampleAnswer | null = null

    setSampleAnswers(prev => prev.map(answer => {
      if (answer.id === id) {
        updatedAnswer = { ...answer, ...updates, updatedAt: new Date().toISOString() }
        return updatedAnswer
      }
      return answer
    }))

    // Sync to Supabase
    if (updatedAnswer) {
      try {
        await supabaseDataService.upsertSampleAnswer(updatedAnswer)
        console.log('✅ Sample answer update synced to Supabase:', id)
      } catch (error) {
        console.warn('⚠️ Failed to sync sample answer update to Supabase:', error)
      }
    }
  }

  const deleteSampleAnswer = async (id: string) => {
    setSampleAnswers(prev => prev.filter(answer => answer.id !== id))

    // Sync to Supabase
    try {
      await supabaseDataService.deleteSampleAnswer(id)
      console.log('✅ Sample answer deletion synced to Supabase:', id)
    } catch (error) {
      console.warn('⚠️ Failed to sync sample answer deletion to Supabase:', error)
    }
  }

  const addTrainingExample = async (exampleData: Omit<TrainingExample, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTrainingExample: TrainingExample = {
      ...exampleData,
      id: `training_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setTrainingExamples(prev => [...prev, newTrainingExample])

    // Sync to Supabase
    try {
      await supabaseDataService.upsertTrainingExample(newTrainingExample)
      console.log('✅ Training example synced to Supabase:', newTrainingExample.id)
    } catch (error) {
      console.warn('⚠️ Failed to sync training example to Supabase:', error)
    }
  }

  const updateTrainingExample = async (id: string, updates: Partial<TrainingExample>) => {
    let updatedExample: TrainingExample | null = null

    setTrainingExamples(prev => prev.map(example => {
      if (example.id === id) {
        updatedExample = { ...example, ...updates, updatedAt: new Date().toISOString() }
        return updatedExample
      }
      return example
    }))

    // Sync to Supabase
    if (updatedExample) {
      try {
        await supabaseDataService.upsertTrainingExample(updatedExample)
        console.log('✅ Training example update synced to Supabase:', id)
      } catch (error) {
        console.warn('⚠️ Failed to sync training example update to Supabase:', error)
      }
    }
  }

  const deleteTrainingExample = async (id: string) => {
    setTrainingExamples(prev => prev.filter(example => example.id !== id))

    // Sync to Supabase
    try {
      await supabaseDataService.deleteTrainingExample(id)
      console.log('✅ Training example deletion synced to Supabase:', id)
    } catch (error) {
      console.warn('⚠️ Failed to sync training example deletion to Supabase:', error)
    }
  }

  const addUser = (userData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newUser: UserProfile = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setUsers(prev => [...prev, newUser])
  }

  const updateUser = (id: string, updates: Partial<UserProfile>) => {
    setUsers(prev => prev.map(user => 
      user.id === id 
        ? { ...user, ...updates, updatedAt: new Date().toISOString() }
        : user
    ))
  }

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id))
  }

  const getUser = (id: string) => {
    return users.find(user => user.id === id)
  }

  const getUserByEmail = (email: string) => {
    return users.find(user => user.email === email)
  }

  const addSubscription = (subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSubscription: Subscription = {
      ...subscriptionData,
      id: `subscription_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setSubscriptions(prev => [...prev, newSubscription])
  }

  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
    setSubscriptions(prev => prev.map(subscription => 
      subscription.id === id 
        ? { ...subscription, ...updates, updatedAt: new Date().toISOString() }
        : subscription
    ))
  }

  const deleteSubscription = (id: string) => {
    setSubscriptions(prev => prev.filter(subscription => subscription.id !== id))
  }

  const getSubscription = (userId: string) => {
    return subscriptions.find(subscription => subscription.userId === userId)
  }

  const extendSubscription = (userId: string, days: number) => {
    const subscription = getSubscription(userId)
    if (subscription) {
      const newExpiryDate = new Date(subscription.endDate)
      newExpiryDate.setDate(newExpiryDate.getDate() + days)
      updateSubscription(subscription.id, { endDate: newExpiryDate.toISOString() })
    }
  }

  const checkSubscriptionExpiry = () => {
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const expired: UserProfile[] = []
    const expiringSoon: UserProfile[] = []
    
    subscriptions.forEach(subscription => {
      const expiryDate = new Date(subscription.endDate)
      const user = getUser(subscription.userId)
      
      if (user) {
        if (expiryDate <= now) {
          expired.push(user)
        } else if (expiryDate <= sevenDaysFromNow) {
          expiringSoon.push(user)
        }
      }
    })
    
    return { expired, expiringSoon }
  }

  const updateSubscriptionReminderStatus = (subscriptionId: string, reminderType: 'sevenDays' | 'oneDay') => {
    updateSubscription(subscriptionId, { 
      reminderSent: {
        sevenDays: reminderType === 'sevenDays',
        oneDay: reminderType === 'oneDay'
      }
    })
  }

  const getUserAttempts = async (userId: string): Promise<Attempt[]> => {
    try {
      const { data, error } = await supabase
        .from('attempts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user attempts:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserAttempts:', error)
      return []
    }
  }

  const getUserAttemptItems = async (userId: string): Promise<AttemptItem[]> => {
    try {
      const { data, error } = await supabase
        .from('attempt_items')
        .select(`
          *,
          attempts!inner(user_id)
        `)
        .eq('attempts.user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user attempt items:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserAttemptItems:', error)
      return []
    }
  }

  const createAttempt = async (userId: string, topicId: string, selectedQuestionIds: string[]): Promise<Attempt> => {
    const newAttempt: Attempt = {
      id: `attempt_${Date.now()}`,
      userId,
      topicId,
      selectedQuestionIds,
      startTime: new Date().toISOString(),
      status: 'in_progress',
      totalTime: selectedQuestionIds.length * 3, // 3 minutes per question
      timeRemaining: selectedQuestionIds.length * 3 * 60, // in seconds
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    try {
      const { error } = await supabase
        .from('attempts')
        .insert({
          id: newAttempt.id,
          user_id: newAttempt.userId,
          topic_id: newAttempt.topicId,
          selected_question_ids: newAttempt.selectedQuestionIds,
          status: newAttempt.status,
          start_time: newAttempt.startTime,
          total_time: newAttempt.totalTime,
          time_remaining: newAttempt.timeRemaining,
          created_at: newAttempt.createdAt,
          updated_at: newAttempt.updatedAt
        })

      if (error) {
        console.error('Error creating attempt:', error)
        throw new Error(`Failed to create attempt: ${error.message}`)
      }

      console.log('✅ Attempt created in Supabase:', newAttempt.id)
    return newAttempt
    } catch (error) {
      console.error('Error in createAttempt:', error)
      throw error
    }
  }

  const updateAttempt = async (id: string, updates: Partial<Attempt>) => {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('attempts')
        .update(updateData)
        .eq('id', id)

      if (error) {
        console.error('Error updating attempt:', error)
        throw new Error(`Failed to update attempt: ${error.message}`)
      }

      console.log('✅ Attempt updated in Supabase:', id)
    } catch (error) {
      console.error('Error in updateAttempt:', error)
      throw error
    }
  }

  const getAttempt = async (id: string): Promise<Attempt | undefined> => {
    console.log('🔍 getAttempt called with id:', id)
    
    try {
      const { data, error } = await supabase
        .from('attempts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('❌ Attempt not found in Supabase:', id)
          return undefined
        }
        console.error('Error fetching attempt:', error)
        return undefined
      }

      console.log('✅ Found attempt in Supabase:', data.id)
      return data
    } catch (error) {
      console.error('Error in getAttempt:', error)
      return undefined
    }
  }

  const createAttemptItem = async (attemptId: string, questionId: string, answer: string): Promise<AttemptItem> => {
    const newAttemptItem: AttemptItem = {
      id: `attempt_item_${Date.now()}`,
      attemptId,
      questionId,
      answer,
      kpisDetected: [],
      kpisMissing: [],
      score: 0,
      maxScore: 3,
      feedback: '',
      isEvaluated: false,
      durationSec: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    try {
      const { error } = await supabase
        .from('attempt_items')
        .insert({
          id: newAttemptItem.id,
          attempt_id: newAttemptItem.attemptId,
          question_id: newAttemptItem.questionId,
          answer: newAttemptItem.answer,
          score: newAttemptItem.score,
          feedback: newAttemptItem.feedback,
          is_evaluated: newAttemptItem.isEvaluated,
          duration_sec: newAttemptItem.durationSec,
          created_at: newAttemptItem.createdAt,
          updated_at: newAttemptItem.updatedAt
        })

      if (error) {
        console.error('Error creating attempt item:', error)
        throw new Error(`Failed to create attempt item: ${error.message}`)
      }

      console.log('✅ Attempt item created in Supabase:', newAttemptItem.id)
      return newAttemptItem
    } catch (error) {
      console.error('Error in createAttemptItem:', error)
      throw error
    }
  }

  const updateAttemptItem = async (id: string, updates: Partial<AttemptItem>) => {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('attempt_items')
        .update(updateData)
        .eq('id', id)

      if (error) {
        console.error('Error updating attempt item:', error)
        throw new Error(`Failed to update attempt item: ${error.message}`)
      }

      console.log('✅ Attempt item updated in Supabase:', id)
    } catch (error) {
      console.error('Error in updateAttemptItem:', error)
      throw error
    }
  }

  const getAttemptItems = async (attemptId: string): Promise<AttemptItem[]> => {
    try {
      const { data, error } = await supabase
        .from('attempt_items')
        .select('*')
        .eq('attempt_id', attemptId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching attempt items:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAttemptItems:', error)
      return []
    }
  }

  const selectRandomQuestions = (topicId: string): string[] => {
    // Get all subtopics for this topic
    const topicSubtopics = subtopics.filter(s => s.topicId === topicId && s.isActive)
    
    // Select one random question from each subtopic
    const selectedQuestions: string[] = []
    
    for (const subtopic of topicSubtopics) {
      const subtopicQuestions = questions.filter(q => q.subtopicId === subtopic.id && q.isActive)
      
      if (subtopicQuestions.length > 0) {
        // Randomly select one question from this subtopic
        const randomIndex = Math.floor(Math.random() * subtopicQuestions.length)
        selectedQuestions.push(subtopicQuestions[randomIndex].id)
      }
    }
    
    console.log(`📝 Selected ${selectedQuestions.length} questions from ${topicSubtopics.length} subtopics for topic ${topicId}`)
    return selectedQuestions
  }

  const clearAllData = () => {
    setTopics([])
    setQuestions([])
    setKpis([])
    setCompanyCodes([])
    setSubtopics([])
    setSampleAnswers([])
    setTrainingExamples([])
    setUsers([])
    setSubscriptions([])
  }

  const exportAllData = async (): Promise<DataSnapshot> => {
    const allAttempts: Attempt[] = []
    const allAttemptItems: AttemptItem[] = []
    
    for (const user of users) {
      try {
        const userAttempts = await getUserAttempts(user.id)
        const userAttemptItems = await getUserAttemptItems(user.id)
        allAttempts.push(...userAttempts)
        allAttemptItems.push(...userAttemptItems)
      } catch (error) {
        console.error(`Error loading data for user ${user.id}:`, error)
      }
    }
    
    return {
      topics,
      questions,
      kpis,
      companyCodes,
      subtopics,
      sampleAnswers,
      trainingExamples,
      users,
      subscriptions,
      attempts: allAttempts,
      attemptItems: allAttemptItems,
      metadata: {
        version: '1.0',
        timestamp: new Date().toISOString(),
        recordCount: topics.length + questions.length + kpis.length + companyCodes.length + 
                    (subtopics || []).length + sampleAnswers.length + trainingExamples.length + 
                    users.length + subscriptions.length + allAttempts.length + allAttemptItems.length
      }
    }
  }

  const importAllData = (snapshot: DataSnapshot) => {
    setTopics(snapshot.topics)
    setQuestions(snapshot.questions)
    setKpis(snapshot.kpis)
    setCompanyCodes(snapshot.companyCodes)
    setSubtopics(Array.isArray(snapshot.subtopics) ? snapshot.subtopics : [])
    setSampleAnswers(snapshot.sampleAnswers)
    setTrainingExamples(snapshot.trainingExamples)
    setUsers(snapshot.users)
    setSubscriptions(snapshot.subscriptions)
    
    // Import user-specific data
    snapshot.users.forEach(user => {
      const userAttempts = snapshot.attempts.filter(attempt => attempt.userId === user.id)
      const userAttemptItems = snapshot.attemptItems.filter(item => 
        userAttempts.some(attempt => attempt.id === item.attemptId)
      )
      
      saveToStorage(STORAGE_KEYS.attempts(user.id), userAttempts)
      saveToStorage(STORAGE_KEYS.attemptItems(user.id), userAttemptItems)
    })
  }

  return (
    <DataContext.Provider value={{
      // Global data
      topics,
      questions,
      kpis,
      companyCodes,
      subtopics,
      sampleAnswers,
      trainingExamples,
      users,
      subscriptions,
      
      // Topic management
      addTopic,
      updateTopic,
      deleteTopic,
      
      // Subtopic management
      addSubtopic,
      updateSubtopic,
      deleteSubtopic,
      
      // Question management
      addQuestion,
      updateQuestion,
      deleteQuestion,
      
      // KPI management
      addKPI,
      updateKPI,
      deleteKPI,
      connectKPIToQuestion,
      disconnectKPIFromQuestion,
      
      // Company code management
      addCompanyCode,
      updateCompanyCode,
      deleteCompanyCode,
      
      // Sample answer management
      addSampleAnswer,
      updateSampleAnswer,
      deleteSampleAnswer,
      
      // Training example management
      addTrainingExample,
      updateTrainingExample,
      deleteTrainingExample,
      
      // User management
      addUser,
      updateUser,
      deleteUser,
      getUser,
      getUserByEmail,
      
      // Subscription management
      addSubscription,
      updateSubscription,
      deleteSubscription,
      getSubscription,
      extendSubscription,
      checkSubscriptionExpiry,
      updateSubscriptionReminderStatus,
      
      // User-specific attempt management
      getUserAttempts,
      getUserAttemptItems,
      createAttempt,
      updateAttempt,
      getAttempt,
      createAttemptItem,
      updateAttemptItem,
      getAttemptItems,
      selectRandomQuestions,
      
      // Exam data persistence (Supabase)
      saveExamAttempt: ExamDataService.saveAttempt,
      saveExamAttemptItem: ExamDataService.saveAttemptItem,
      saveExamResult: ExamDataService.saveExamResult,
      getUserExamHistory: ExamDataService.getUserExamHistory,
      getUserDetailedAnswers: ExamDataService.getUserAttemptItems,
      getCompanyExamStats: ExamDataService.getCompanyExamStats,
      
      // User management for companies
      createUserForCompany,
      removeUserForCompany,
      
      // Data management
      clearAllData,
      exportAllData,
      importAllData,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
