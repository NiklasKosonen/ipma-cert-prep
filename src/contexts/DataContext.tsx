import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Topic, Question, KPI, CompanyCode, Subtopic, SampleAnswer, TrainingExample, Attempt, AttemptItem, UserProfile, Subscription } from '../types'
import { mockTopics, mockQuestions, mockKPIs, mockCompanyCodes, mockSubtopics, mockSampleAnswers, mockTrainingExamples } from '../lib/mockData'
import { validateTopicTitle, validateQuestionPrompt, sanitizeInput } from '../lib/validation'

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
      if (Array.isArray(parsed)) {
        return parsed
      } else {
        console.warn(`Invalid data format for ${key}, using fallback`)
        return fallback
      }
    }
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error)
    // In production, you might want to report this to a monitoring service
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
    
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error)
    // In production, you might want to report this to a monitoring service
    // and potentially implement a fallback storage mechanism
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
  addTopic: (topic: Omit<Topic, 'id' | 'createdAt' | 'updatedAt' | 'subtopics'>) => void
  updateTopic: (id: string, updates: Partial<Topic>) => void
  deleteTopic: (id: string) => void
  
  // Subtopic management
  addSubtopic: (subtopic: Omit<Subtopic, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateSubtopic: (id: string, updates: Partial<Subtopic>) => void
  deleteSubtopic: (id: string) => void
  
  // Question management
  addQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateQuestion: (id: string, updates: Partial<Question>) => void
  deleteQuestion: (id: string) => void
  
  // KPI management
  addKPI: (kpi: Omit<KPI, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateKPI: (id: string, updates: Partial<KPI>) => void
  deleteKPI: (id: string) => void
  connectKPIToQuestion: (kpiId: string, questionId: string) => void
  disconnectKPIFromQuestion: (kpiId: string, questionId: string) => void
  
  // Company code management
  addCompanyCode: (company: Omit<CompanyCode, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateCompanyCode: (id: string, updates: Partial<CompanyCode>) => void
  deleteCompanyCode: (id: string) => void
  
  // Sample answer management
  addSampleAnswer: (answer: Omit<SampleAnswer, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateSampleAnswer: (id: string, updates: Partial<SampleAnswer>) => void
  deleteSampleAnswer: (id: string) => void
  
  // Training example management
  addTrainingExample: (example: Omit<TrainingExample, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTrainingExample: (id: string, updates: Partial<TrainingExample>) => void
  deleteTrainingExample: (id: string) => void
  
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
  
  // User-specific attempt management
  getUserAttempts: (userId: string) => Attempt[]
  getUserAttemptItems: (userId: string) => AttemptItem[]
  createAttempt: (userId: string, topicId: string, selectedQuestionIds: string[]) => Attempt
  updateAttempt: (id: string, updates: Partial<Attempt>) => void
  getAttempt: (id: string) => Attempt | undefined
  createAttemptItem: (attemptId: string, questionId: string, answer: string) => AttemptItem
  updateAttemptItem: (id: string, updates: Partial<AttemptItem>) => void
  getAttemptItems: (attemptId: string) => AttemptItem[]
  selectRandomQuestions: (topicId: string) => string[]
  
  // Data management
  clearAllData: () => void
  clearUserData: (userId: string) => void
  exportAllData: () => any
  importAllData: (data: any) => void
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

  // Load global data from localStorage on mount
  useEffect(() => {
    setTopics(loadFromStorage(STORAGE_KEYS.topics, mockTopics))
    setQuestions(loadFromStorage(STORAGE_KEYS.questions, mockQuestions))
    setKpis(loadFromStorage(STORAGE_KEYS.kpis, mockKPIs))
    setCompanyCodes(loadFromStorage(STORAGE_KEYS.companyCodes, mockCompanyCodes))
    setSubtopics(loadFromStorage(STORAGE_KEYS.subtopics, mockSubtopics))
    setSampleAnswers(loadFromStorage(STORAGE_KEYS.sampleAnswers, mockSampleAnswers))
    setTrainingExamples(loadFromStorage(STORAGE_KEYS.trainingExamples, mockTrainingExamples))
    setUsers(loadFromStorage(STORAGE_KEYS.users, []))
    setSubscriptions(loadFromStorage(STORAGE_KEYS.subscriptions, []))
  }, [])

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

  const addTopic = (topicData: Omit<Topic, 'id' | 'createdAt' | 'updatedAt' | 'subtopics'>) => {
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
    setTopics(prev => [...prev, newTopic])
  }

  const updateTopic = (id: string, updates: Partial<Topic>) => {
    setTopics(prev => prev.map(topic => 
      topic.id === id 
        ? { ...topic, ...updates, updatedAt: new Date().toISOString() }
        : topic
    ))
  }

  const deleteTopic = (id: string) => {
    setTopics(prev => prev.filter(topic => topic.id !== id))
    // Also delete related questions, KPIs, and subtopics
    setQuestions(prev => prev.filter(question => question.topicId !== id))
    setKpis(prev => prev.filter(kpi => kpi.topicId !== id))
    setSubtopics(prev => prev.filter(subtopic => subtopic.topicId !== id))
  }

  const addSubtopic = (subtopicData: Omit<Subtopic, 'id' | 'createdAt' | 'updatedAt'>) => {
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
  }

  const updateSubtopic = (id: string, updates: Partial<Subtopic>) => {
    setSubtopics(prev => prev.map(subtopic => 
      subtopic.id === id 
        ? { ...subtopic, ...updates, updatedAt: new Date().toISOString() }
        : subtopic
    ))
  }

  const deleteSubtopic = (id: string) => {
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
    } else {
      console.error('Subtopic not found with ID:', id)
    }
  }

  const addQuestion = (questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Validate input
    const promptValidation = validateQuestionPrompt(questionData.prompt)
    if (!promptValidation.isValid) {
      throw new Error(promptValidation.error || 'Invalid question prompt')
    }

    // Validate topic exists
    const topic = topics.find(t => t.id === questionData.topicId)
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
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(prev => prev.map(question => 
      question.id === id 
        ? { ...question, ...updates, updatedAt: new Date().toISOString() }
        : question
    ))
  }

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(question => question.id !== id))
  }

  const addKPI = (kpiData: Omit<KPI, 'id' | 'createdAt' | 'updatedAt'>) => {
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
  }

  const updateKPI = (id: string, updates: Partial<KPI>) => {
    setKpis(prev => prev.map(kpi => 
      kpi.id === id 
        ? { ...kpi, ...updates, updatedAt: new Date().toISOString() }
        : kpi
    ))
  }

  const deleteKPI = (id: string) => {
    setKpis(prev => prev.filter(kpi => kpi.id !== id))
  }

  const connectKPIToQuestion = (kpiId: string, questionId: string) => {
    // Add KPI to question's connectedKPIs
    setQuestions(prev => prev.map(question => 
      question.id === questionId 
        ? { 
            ...question, 
            connectedKPIs: question.connectedKPIs.includes(kpiId) 
              ? question.connectedKPIs 
              : [...question.connectedKPIs, kpiId],
            updatedAt: new Date().toISOString()
          }
        : question
    ))
    
    // Add question to KPI's connectedQuestions
    setKpis(prev => prev.map(kpi => 
      kpi.id === kpiId 
        ? { 
            ...kpi, 
            connectedQuestions: kpi.connectedQuestions.includes(questionId) 
              ? kpi.connectedQuestions 
              : [...kpi.connectedQuestions, questionId],
            updatedAt: new Date().toISOString()
          }
        : kpi
    ))
  }

  const disconnectKPIFromQuestion = (kpiId: string, questionId: string) => {
    // Remove KPI from question's connectedKPIs
    setQuestions(prev => prev.map(question => 
      question.id === questionId 
        ? { 
            ...question, 
            connectedKPIs: question.connectedKPIs.filter(id => id !== kpiId),
            updatedAt: new Date().toISOString()
          }
        : question
    ))
    
    // Remove question from KPI's connectedQuestions
    setKpis(prev => prev.map(kpi => 
      kpi.id === kpiId 
        ? { 
            ...kpi, 
            connectedQuestions: kpi.connectedQuestions.filter(id => id !== questionId),
            updatedAt: new Date().toISOString()
          }
        : kpi
    ))
  }

  const addCompanyCode = (companyData: Omit<CompanyCode, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCompany: CompanyCode = {
      ...companyData,
      id: `company_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setCompanyCodes(prev => [...prev, newCompany])
  }

  const updateCompanyCode = (id: string, updates: Partial<CompanyCode>) => {
    setCompanyCodes(prev => prev.map(company => 
      company.id === id 
        ? { ...company, ...updates, updatedAt: new Date().toISOString() }
        : company
    ))
  }

  const deleteCompanyCode = (id: string) => {
    setCompanyCodes(prev => prev.filter(company => company.id !== id))
  }

  const addSampleAnswer = (answerData: Omit<SampleAnswer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAnswer: SampleAnswer = {
      ...answerData,
      id: `sample_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setSampleAnswers(prev => [...prev, newAnswer])
  }

  const updateSampleAnswer = (id: string, updates: Partial<SampleAnswer>) => {
    setSampleAnswers(prev => prev.map(answer => 
      answer.id === id 
        ? { ...answer, ...updates, updatedAt: new Date().toISOString() }
        : answer
    ))
  }

  const deleteSampleAnswer = (id: string) => {
    setSampleAnswers(prev => prev.filter(answer => answer.id !== id))
  }

  const addTrainingExample = (exampleData: Omit<TrainingExample, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newExample: TrainingExample = {
      ...exampleData,
      id: `training_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setTrainingExamples(prev => [...prev, newExample])
  }

  const updateTrainingExample = (id: string, updates: Partial<TrainingExample>) => {
    setTrainingExamples(prev => prev.map(example => 
      example.id === id 
        ? { ...example, ...updates, updatedAt: new Date().toISOString() }
        : example
    ))
  }

  const deleteTrainingExample = (id: string) => {
    setTrainingExamples(prev => prev.filter(example => example.id !== id))
  }

  const clearUserData = (userId: string) => {
    // Clear user-specific data
    localStorage.removeItem(STORAGE_KEYS.attempts(userId))
    localStorage.removeItem(STORAGE_KEYS.attemptItems(userId))
  }

  const clearAllData = () => {
    // Clear global data
    setTopics([])
    setQuestions([])
    setKpis([])
    setCompanyCodes([])
    setSubtopics([])
    setSampleAnswers([])
    setTrainingExamples([])
    setUsers([])
    setSubscriptions([])
    
    // Clear localStorage
    const globalKeys = [
      STORAGE_KEYS.topics,
      STORAGE_KEYS.questions,
      STORAGE_KEYS.kpis,
      STORAGE_KEYS.companyCodes,
      STORAGE_KEYS.subtopics,
      STORAGE_KEYS.sampleAnswers,
      STORAGE_KEYS.trainingExamples,
      STORAGE_KEYS.users,
      STORAGE_KEYS.subscriptions,
      STORAGE_KEYS.userSessions
    ]
    
    globalKeys.forEach(key => {
      localStorage.removeItem(key)
    })
    
    // Clear all user-specific data
    users.forEach(user => {
      clearUserData(user.id)
    })
  }

  const exportAllData = () => {
    const allData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      global: {
        topics,
        questions,
        kpis,
        companyCodes,
        subtopics,
        sampleAnswers,
        trainingExamples,
        users,
        subscriptions
      },
      userSpecific: {} as Record<string, any>
    }
    
    // Include user-specific data
    users.forEach(user => {
      allData.userSpecific[user.id] = {
        attempts: getUserAttempts(user.id),
        attemptItems: getUserAttemptItems(user.id)
      }
    })
    
    return allData
  }

  const importAllData = (data: any) => {
    if (!data || !data.global) {
      throw new Error('Invalid data format')
    }
    
    // Import global data
    if (data.global.topics) setTopics(data.global.topics)
    if (data.global.questions) setQuestions(data.global.questions)
    if (data.global.kpis) setKpis(data.global.kpis)
    if (data.global.companyCodes) setCompanyCodes(data.global.companyCodes)
    if (data.global.subtopics) setSubtopics(data.global.subtopics)
    if (data.global.sampleAnswers) setSampleAnswers(data.global.sampleAnswers)
    if (data.global.trainingExamples) setTrainingExamples(data.global.trainingExamples)
    if (data.global.users) setUsers(data.global.users)
    if (data.global.subscriptions) setSubscriptions(data.global.subscriptions)
    
    // Import user-specific data
    if (data.userSpecific) {
      Object.keys(data.userSpecific).forEach(userId => {
        const userData = data.userSpecific[userId]
        if (userData.attempts) {
          saveToStorage(STORAGE_KEYS.attempts(userId), userData.attempts)
        }
        if (userData.attemptItems) {
          saveToStorage(STORAGE_KEYS.attemptItems(userId), userData.attemptItems)
        }
      })
    }
  }

  // Attempt management functions
  // User management functions
  const addUser = (userData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newUser: UserProfile = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
    // Also delete user-specific data
    clearUserData(id)
  }

  const getUser = (id: string) => {
    return users.find(u => u.id === id)
  }

  const getUserByEmail = (email: string) => {
    return users.find(u => u.email === email)
  }

  // Subscription management functions
  const addSubscription = (subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSubscription: Subscription = {
      ...subscriptionData,
      id: `sub_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
    return subscriptions.find(s => s.userId === userId)
  }

  const extendSubscription = (userId: string, days: number) => {
    const subscription = subscriptions.find(s => s.userId === userId)
    if (subscription) {
      const currentEndDate = new Date(subscription.endDate)
      const newEndDate = new Date(currentEndDate.getTime() + (days * 24 * 60 * 60 * 1000))
      
      updateSubscription(subscription.id, {
        endDate: newEndDate.toISOString()
      })
    }
  }

  const checkSubscriptionExpiry = () => {
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000))
    
    const expired: UserProfile[] = []
    const expiringSoon: UserProfile[] = []
    
    subscriptions.forEach(subscription => {
      if (!subscription.isActive) return
      
      const endDate = new Date(subscription.endDate)
      const user = users.find(u => u.id === subscription.userId)
      
      if (!user) return
      
      if (endDate <= now) {
        expired.push(user)
      } else if (endDate <= sevenDaysFromNow) {
        expiringSoon.push(user)
      }
    })
    
    return { expired, expiringSoon }
  }

  const updateSubscriptionReminderStatus = (subscriptionId: string, reminderType: 'sevenDays' | 'oneDay') => {
    setSubscriptions(prev => prev.map(subscription => 
      subscription.id === subscriptionId 
        ? { 
            ...subscription, 
            reminderSent: {
              ...subscription.reminderSent,
              [reminderType]: true
            },
            updatedAt: new Date().toISOString()
          }
        : subscription
    ))
  }

  // User-specific attempt management functions
  const getUserAttempts = (userId: string): Attempt[] => {
    const userAttempts = loadFromStorage<Attempt>(STORAGE_KEYS.attempts(userId), [])
    return userAttempts
  }

  const getUserAttemptItems = (userId: string): AttemptItem[] => {
    const userAttemptItems = loadFromStorage<AttemptItem>(STORAGE_KEYS.attemptItems(userId), [])
    return userAttemptItems
  }

  const createAttempt = (userId: string, topicId: string, selectedQuestionIds: string[]): Attempt => {
    const topic = topics.find(t => t.id === topicId)
    if (!topic) throw new Error('Topic not found')
    
    const topicSubtopics = subtopics.filter(s => s.topicId === topicId)
    const totalTime = topicSubtopics.length * 3 // 3 minutes per subtopic
    
    const newAttempt: Attempt = {
      id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      topicId,
      selectedQuestionIds,
      startTime: new Date().toISOString(),
      status: 'in_progress',
      totalTime,
      timeRemaining: totalTime * 60, // Convert to seconds
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Save to user-specific storage
    const userAttempts = getUserAttempts(userId)
    const updatedAttempts = [...userAttempts, newAttempt]
    saveToStorage(STORAGE_KEYS.attempts(userId), updatedAttempts)
    
    return newAttempt
  }

  const updateAttempt = (id: string, updates: Partial<Attempt>): void => {
    // Find the attempt first to get the userId
    let foundAttempt: Attempt | undefined
    let userId: string | undefined
    
    // Search through all users' attempts
    users.forEach(user => {
      const userAttempts = getUserAttempts(user.id)
      const attempt = userAttempts.find(a => a.id === id)
      if (attempt) {
        foundAttempt = attempt
        userId = user.id
      }
    })
    
    if (!foundAttempt || !userId) {
      throw new Error('Attempt not found')
    }
    
    const userAttempts = getUserAttempts(userId)
    const updatedAttempts = userAttempts.map(attempt => 
      attempt.id === id 
        ? { ...attempt, ...updates, updatedAt: new Date().toISOString() }
        : attempt
    )
    saveToStorage(STORAGE_KEYS.attempts(userId), updatedAttempts)
  }

  const getAttempt = (id: string): Attempt | undefined => {
    // Search through all users' attempts
    for (const user of users) {
      const userAttempts = getUserAttempts(user.id)
      const attempt = userAttempts.find(a => a.id === id)
      if (attempt) return attempt
    }
    return undefined
  }

  const createAttemptItem = (attemptId: string, questionId: string, answer: string): AttemptItem => {
    // Find the attempt to get the userId
    const attempt = getAttempt(attemptId)
    if (!attempt) throw new Error('Attempt not found')
    
    const newAttemptItem: AttemptItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      attemptId,
      questionId,
      answer,
      kpisDetected: [],
      kpisMissing: [],
      score: 0,
      maxScore: 0,
      feedback: '',
      isEvaluated: false,
      durationSec: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Save to user-specific storage
    const userAttemptItems = getUserAttemptItems(attempt.userId)
    const updatedItems = [...userAttemptItems, newAttemptItem]
    saveToStorage(STORAGE_KEYS.attemptItems(attempt.userId), updatedItems)
    
    return newAttemptItem
  }

  const updateAttemptItem = (id: string, updates: Partial<AttemptItem>): void => {
    // Find the attempt item first to get the userId
    let userId: string | undefined
    
    // Search through all users' attempt items
    users.forEach(user => {
      const userAttemptItems = getUserAttemptItems(user.id)
      const item = userAttemptItems.find(i => i.id === id)
      if (item) {
        userId = user.id
      }
    })
    
    if (!userId) {
      throw new Error('Attempt item not found')
    }
    
    const userAttemptItems = getUserAttemptItems(userId)
    const updatedItems = userAttemptItems.map(item => 
      item.id === id 
        ? { ...item, ...updates, updatedAt: new Date().toISOString() }
        : item
    )
    saveToStorage(STORAGE_KEYS.attemptItems(userId), updatedItems)
  }

  const getAttemptItems = (attemptId: string): AttemptItem[] => {
    // Find the attempt to get the userId
    const attempt = getAttempt(attemptId)
    if (!attempt) return []
    
    const userAttemptItems = getUserAttemptItems(attempt.userId)
    return userAttemptItems.filter(item => item.attemptId === attemptId)
  }

  const selectRandomQuestions = (topicId: string): string[] => {
    const topicSubtopics = subtopics.filter(s => s.topicId === topicId && s.isActive)
    const selectedQuestions: string[] = []
    
    topicSubtopics.forEach(subtopic => {
      const subtopicQuestions = questions.filter(q => q.subtopicId === subtopic.id && q.isActive)
      if (subtopicQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * subtopicQuestions.length)
        selectedQuestions.push(subtopicQuestions[randomIndex].id)
      }
    })
    
    return selectedQuestions
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
      
      // Data management
      clearAllData,
      clearUserData,
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
