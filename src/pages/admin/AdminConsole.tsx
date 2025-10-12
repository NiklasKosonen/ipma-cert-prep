import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { Topic, Subtopic, KPI, Question, TrainingExample, CompanyCode } from '../../types'
import AIEvaluationRules, { EvaluationRule } from '../../components/AIEvaluationRules'
import { evaluateAnswer } from '../../lib/evaluationEngine'
import { User, Users, Settings, TestTube } from 'lucide-react'

const AdminConsole: React.FC = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { 
    topics, subtopics, kpis, questions, trainingExamples, companyCodes, sampleAnswers, users, subscriptions,
    updateTopic, deleteTopic, addTopicWithLanguage,
    updateSubtopic, deleteSubtopic, addSubtopicWithLanguage,
    updateKPI, deleteKPI, addKPIWithLanguage,
    updateQuestion, deleteQuestion, addQuestionWithLanguage,
    addTrainingExample, updateTrainingExample, deleteTrainingExample,
    addCompanyCode, updateCompanyCode, deleteCompanyCode,
    createUserForCompany, removeUserForCompany,
    getTopicsByLanguage, getSubtopicsByLanguage, getKPIsByLanguage, getQuestionsByLanguage,
    getAIEvaluationCriteria, getAIEvaluationCriteriaWithIds, addAIEvaluationCriteria, updateAIEvaluationCriteria, deleteAIEvaluationCriteria,
    createAttempt, createAttemptItem, updateAttempt
  } = useData()

  // Auto backup removed - data now syncs to Supabase in real-time
  const [activeTab, setActiveTab] = useState('topics')
  const [adminLanguage, setAdminLanguage] = useState<'fi' | 'en'>('fi')
  const handleAddQuestion = async () => {
    if (!newQuestion.subtopicId || !newQuestion.prompt.trim()) {
      alert('Please select a subtopic and enter a question prompt')
      return
    }

    try {
      const questionToAdd = {
        ...newQuestion,
        prompt: newQuestion.prompt.trim(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await addQuestionWithLanguage(questionToAdd, adminLanguage)
      
      // Reset form
      setNewQuestion({
        subtopicId: '',
        topicId: '',
        prompt: '',
        connectedKPIs: [],
        isActive: true
      })
      
      // Refresh language-specific data after adding
      await loadLanguageData(adminLanguage)
      
      alert(`✅ Question added to ${adminLanguage === 'fi' ? 'Finnish' : 'English'} database!`)
    } catch (error) {
      console.error('Error adding question:', error)
      alert(`❌ Error adding question: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  // Topic states
  const [newTopic, setNewTopic] = useState({ title: '', description: '', isActive: true })
  
  // Training Example states
  const [newTrainingExample, setNewTrainingExample] = useState<Partial<TrainingExample>>({
    questionId: '',
    answerText: '',
    qualityRating: 0,
    detectedKPIs: [],
    feedback: '',
    exampleType: 'training'
  })
  // const [editingTrainingExample, setEditingTrainingExample] = useState<string | null>(null)
  // const [editTrainingExample, setEditTrainingExample] = useState<Partial<TrainingExample>>({})
  
  // Company Code states
  const [newCompanyCode, setNewCompanyCode] = useState<Partial<CompanyCode>>({
    code: '',
    companyName: '',
    adminEmail: '',
    authorizedEmails: [],
    maxUsers: 1,
    expiresAt: '',
    isActive: true
  })
  const [newEmail, setNewEmail] = useState('')
  const [editingCompanyCode, setEditingCompanyCode] = useState<CompanyCode | null>(null)
  
  // User management states
  const [selectedCompanyForUsers, setSelectedCompanyForUsers] = useState<string>('')
  const [newUserEmail, setNewUserEmail] = useState('')
  // const [editingCompanyCode, setEditingCompanyCode] = useState<string | null>(null)
  // const [editCompanyCode, setEditCompanyCode] = useState<Partial<CompanyCode>>({...})

  // Test data generator states
  const [testDataConfig, setTestDataConfig] = useState({
    userEmail: '',
    topicId: '',
    numAttempts: 5,
    language: 'fi' as 'fi' | 'en'
  })
  const [isGeneratingTestData, setIsGeneratingTestData] = useState(false)
  
  // Company emails management (to be implemented later)
  // const [companyEmails, setCompanyEmails] = useState<Record<string, string[]>>({})
  // const [newEmail, setNewEmail] = useState<string>('')
  
  // AI Evaluation Rules state
  const [evaluationRules, setEvaluationRules] = useState<EvaluationRule[]>([
    { id: 'rule1', description: 'Vastaus sisältää ≥3 KPI:tä', points: 3, kpiCount: 3, condition: 'at_least' },
    { id: 'rule2', description: 'Vastaus sisältää tasan 2 KPI:ta', points: 2, kpiCount: 2, condition: 'exactly' },
    { id: 'rule3', description: 'Vastaus sisältää tasan 1 KPI:n', points: 1, kpiCount: 1, condition: 'exactly' },
    { id: 'rule4', description: 'Vastaus ei sisällä KPI:ta', points: 0, kpiCount: 0, condition: 'exactly' }
  ])
  
  const [aiTips, setAiTips] = useState<string[]>([])
  const [aiTipsWithIds, setAiTipsWithIds] = useState<{id: string, tip_text: string}[]>([])
  const [aiTipsLoading, setAiTipsLoading] = useState(false)

  // Language-specific data state
  const [currentTopics, setCurrentTopics] = useState<Topic[]>([])
  const [currentSubtopics, setCurrentSubtopics] = useState<Subtopic[]>([])
  const [currentKPIs, setCurrentKPIs] = useState<KPI[]>([])
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  // Load language-specific data from Supabase
  const loadLanguageData = async (language: 'fi' | 'en') => {
    setDataLoading(true)
    try {
      const [topicsData, subtopicsData, kpisData, questionsData] = await Promise.all([
        getTopicsByLanguage(language),
        getSubtopicsByLanguage(language),
        getKPIsByLanguage(language),
        getQuestionsByLanguage(language)
      ])
      
      setCurrentTopics(topicsData)
      setCurrentSubtopics(subtopicsData)
      setCurrentKPIs(kpisData)
      setCurrentQuestions(questionsData)
      
      console.log(`✅ Loaded ${language} data:`, {
        topics: topicsData.length,
        subtopics: subtopicsData.length,
        kpis: kpisData.length,
        questions: questionsData.length
      })
    } catch (error) {
      console.error(`❌ Error loading ${language} data:`, error)
      setCurrentTopics([])
      setCurrentSubtopics([])
      setCurrentKPIs([])
      setCurrentQuestions([])
    } finally {
      setDataLoading(false)
    }
  }

  // Load AI evaluation criteria from Supabase
  const loadAITips = async (language: 'fi' | 'en') => {
    setAiTipsLoading(true)
    try {
      const [tips, tipsWithIds] = await Promise.all([
        getAIEvaluationCriteria(language),
        getAIEvaluationCriteriaWithIds(language)
      ])
      setAiTips(tips)
      setAiTipsWithIds(tipsWithIds)
    } catch (error) {
      console.error('Error loading AI tips:', error)
      setAiTips([])
      setAiTipsWithIds([])
    } finally {
      setAiTipsLoading(false)
    }
  }

  // Handle AI tips changes with Supabase integration
  const handleAITipsChange = async (newTips: string[]) => {
    setAiTips(newTips)
    // Note: Individual add/update/delete operations will be handled by the AIEvaluationRules component
  }

  // Load data when language changes or component mounts
  React.useEffect(() => {
    loadLanguageData(adminLanguage)
  }, [adminLanguage, getTopicsByLanguage, getSubtopicsByLanguage, getKPIsByLanguage, getQuestionsByLanguage])

  // Initial load when component mounts
  React.useEffect(() => {
    loadLanguageData(adminLanguage)
  }, [])

  // Load AI tips when language changes or AI evaluation tab is opened
  React.useEffect(() => {
    if (activeTab === 'ai-evaluation') {
      loadAITips(adminLanguage)
    }
  }, [activeTab, adminLanguage])
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [editTopic, setEditTopic] = useState({ title: '', description: '' })
  
  // Training Example handlers
  const handleAddTrainingExample = () => {
    if (newTrainingExample.questionId && newTrainingExample.answerText) {
      addTrainingExample({
        questionId: newTrainingExample.questionId,
        answerText: newTrainingExample.answerText,
        qualityRating: newTrainingExample.qualityRating || 0,
        detectedKPIs: newTrainingExample.detectedKPIs || [],
        feedback: newTrainingExample.feedback || '',
        exampleType: 'training'
      })
      setNewTrainingExample({
        questionId: '',
       // answerText: '',
        //qualityRating: 0,
        detectedKPIs: [],
        feedback: '',
        exampleType: 'training'
      })
    }
  }

  // Test data generator functions
  const generateSyntheticAnswer = (_question: Question) => {
    // Simple random answer generator (can be enhanced)
    const templates = [
      "This involves understanding key concepts and applying them systematically.",
      "The approach requires careful analysis and strategic implementation.",
      "Critical factors include stakeholder engagement and resource allocation.",
      "Effective project management requires clear communication and risk assessment.",
      "Success depends on proper planning, execution, and monitoring processes.",
      "Key competencies include leadership, problem-solving, and decision-making skills.",
      "The methodology focuses on iterative development and continuous improvement.",
      "Important considerations include budget management and timeline adherence."
    ]
    return templates[Math.floor(Math.random() * templates.length)]
  }

  const generateTestAttempts = async () => {
    if (!testDataConfig.userEmail || !testDataConfig.topicId) {
      alert('Please select user and topic')
      return
    }
    
    const user = users.find(u => u.email === testDataConfig.userEmail)
    if (!user) {
      alert('User not found with that email')
      return
    }
    
    setIsGeneratingTestData(true)
    
    try {
      // Get language-specific data
      const [, subtopicsData, questionsData, kpisData] = await Promise.all([
        getTopicsByLanguage(testDataConfig.language),
        getSubtopicsByLanguage(testDataConfig.language),
        getQuestionsByLanguage(testDataConfig.language),
        getKPIsByLanguage(testDataConfig.language)
      ])
      
      // Get topic subtopics
      const topicSubtopics = subtopicsData.filter(s => s.topicId === testDataConfig.topicId && s.isActive)
      
      for (let i = 0; i < testDataConfig.numAttempts; i++) {
        // Select random questions for this topic
        const selectedQuestions: string[] = []
        
        for (const subtopic of topicSubtopics) {
          const subtopicQuestions = questionsData.filter(q => q.subtopicId === subtopic.id && q.isActive)
          if (subtopicQuestions.length > 0) {
            const randomIndex = Math.floor(Math.random() * subtopicQuestions.length)
            selectedQuestions.push(subtopicQuestions[randomIndex].id)
          }
        }
        
        if (selectedQuestions.length === 0) {
          console.warn(`No questions found for topic ${testDataConfig.topicId}`)
          continue
        }
        
        // Create attempt
        const attempt = await createAttempt(user.id, testDataConfig.topicId, selectedQuestions)
        
        // For each question, generate synthetic answer and evaluate
        for (const questionId of selectedQuestions) {
          const question = questionsData.find(q => q.id === questionId)
          if (!question) continue
          
          // Generate random answer
          const syntheticAnswer = generateSyntheticAnswer(question)
          
          // Get KPIs for evaluation
          const questionKPIs = kpisData.filter(k => question.connectedKPIs.includes(k.id))
          
          // Call AI evaluation
          const evaluation = await evaluateAnswer(
            syntheticAnswer,
            questionKPIs.map(k => k.name),
            testDataConfig.language,
            [] // no AI criteria for test data
          )
          
          // Save attempt item with evaluation
          await createAttemptItem(attempt.id, questionId, syntheticAnswer, {
            kpisDetected: evaluation.toteutuneet_kpi,
            kpisMissing: evaluation.puuttuvat_kpi,
            score: evaluation.pisteet,
            feedback: evaluation.sanallinen_arvio
          })
        }
        
        // Update attempt as completed
        const totalScore = selectedQuestions.length * 3 // Will be calculated properly in real scenario
        await updateAttempt(attempt.id, {
          status: 'completed',
          endTime: new Date().toISOString(),
          score: totalScore,
          passed: true // Simplified for test data
        })
        
        console.log(`✅ Generated test attempt ${i + 1}/${testDataConfig.numAttempts}`)
      }
      
      alert(`✅ Generated ${testDataConfig.numAttempts} test attempts for ${testDataConfig.userEmail}!`)
      
      // Reset form
      setTestDataConfig({
        userEmail: '',
        topicId: '',
        numAttempts: 5,
        language: 'fi'
      })
      
    } catch (error) {
      console.error('Error generating test attempts:', error)
      alert(`❌ Error generating test attempts: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGeneratingTestData(false)
    }
  }

  const handleEditTrainingExample = (_id: string) => {
    // const trainingExample = trainingExamples.find(te => te.id === id)
    // if (trainingExample) {
    //   setEditingTrainingExample(id)
    //   setEditTrainingExample(trainingExample)
    // }
  }

  // const handleUpdateTrainingExample = () => {
  //   if (editingTrainingExample && editTrainingExample) {
  //     updateTrainingExample(editingTrainingExample, editTrainingExample)
  //     setEditingTrainingExample(null)
  //     setEditTrainingExample({})
  //   }
  // }

  const handleDeleteTrainingExample = (id: string) => {
    if (confirm('Haluatko varmasti poistaa tämän harjoitusesimerkin?')) {
      deleteTrainingExample(id)
    }
  }

  // Company Code handlers
  const handleAddCompanyCode = () => {
    if (newCompanyCode.code && newCompanyCode.companyName) {
      addCompanyCode({
        code: newCompanyCode.code,
        companyName: newCompanyCode.companyName,
        adminEmail: '', // Not required anymore
        authorizedEmails: newCompanyCode.authorizedEmails || [],
        maxUsers: newCompanyCode.maxUsers || 10,
        expiresAt: newCompanyCode.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        isActive: true
      })
      setNewCompanyCode({
        code: '',
        companyName: '',
        adminEmail: '',
        maxUsers: 10,
        expiresAt: '',
        isActive: true
      })
    }
  }

  // Edit/Update company code removed - will be reimplemented with new design
  // const handleEditCompanyCode = (id: string) => {...}
  // const handleUpdateCompanyCode = () => {...}

  const handleDeleteCompanyCode = (id: string) => {
    if (confirm('Haluatko varmasti poistaa tämän yrityskoodin?')) {
      deleteCompanyCode(id)
    }
  }

  const generateAIEvaluation = async (trainingExample: TrainingExample) => {
    try {
      // Mock AI evaluation - in real implementation, this would call an AI service
      const selectedKPIs = kpis.filter(kpi => trainingExample.detectedKPIs.includes(kpi.id))
      const kpiNames = selectedKPIs.map(kpi => kpi.name).join(', ')
      
      let feedback = ''
      if (trainingExample.qualityRating >= 3) {
        feedback = `Erinomainen vastaus! Vastaus sisältää useita KPI:ta (${kpiNames}) ja osoittaa syvällistä ymmärrystä aiheesta. Vastaus on strukturoitu ja perusteltu hyvin.`
      } else if (trainingExample.qualityRating === 2) {
        feedback = `Hyvä vastaus. Vastaus sisältää muutaman KPI:n (${kpiNames}) ja osoittaa hyvää ymmärrystä aiheesta. Vastaus voisi olla vielä tarkemmin perusteltu.`
      } else if (trainingExample.qualityRating === 1) {
        feedback = `Kohtalainen vastaus. Vastaus sisältää jonkin verran KPI:a (${kpiNames}) mutta puuttuu syvällisempi analyysi. Suosittelemme tarkentamaan vastausta.`
      } else {
        feedback = `Vastaus vaatii parantamista. Vastaus ei sisällä KPI:ta tai vastaus ei vastaa kysymykseen riittävällä tasolla. Suosittelemme uudelleen miettimään vastausta.`
      }
      
      return feedback
    } catch (error) {
      console.error('AI evaluation failed:', error)
      return 'AI-arviointi epäonnistui. Yritä uudelleen.'
    }
  }

  // Subtopic states
  const [newSubtopic, setNewSubtopic] = useState({ title: '', description: '', topicId: '', isActive: true })
  const [editingSubtopic, setEditingSubtopic] = useState<Subtopic | null>(null)
  const [editSubtopic, setEditSubtopic] = useState({ title: '', description: '', topicId: '', isActive: true })

  // KPI states
  const [newKPI, setNewKPI] = useState({ name: '', isEssential: true, topicId: '', subtopicId: '' })
  const [editingKPI, setEditingKPI] = useState<KPI | null>(null)
  const [editKPI, setEditKPI] = useState({ name: '', isEssential: true, topicId: '', subtopicId: '' })

  // Question states
  const [newQuestion, setNewQuestion] = useState({ prompt: '', topicId: '', subtopicId: '', connectedKPIs: [] as string[], isActive: true })
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [editQuestion, setEditQuestion] = useState({ prompt: '', topicId: '', subtopicId: '', connectedKPIs: [] as string[], isActive: true })

  const handleAddTopic = async () => {
    if (newTopic.title.trim()) {
      try {
        await addTopicWithLanguage(newTopic, adminLanguage)
        setNewTopic({ title: '', description: '', isActive: true })
        alert(`✅ Topic added to ${adminLanguage === 'fi' ? 'Finnish' : 'English'} database!`)
      } catch (error) {
        console.error('Error adding topic:', error)
        alert(`❌ Error adding topic: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  const handleUpdateTopic = async () => {
    if (editingTopic && editTopic.title.trim()) {
      try {
        await updateTopic(editingTopic.id, editTopic)
        setEditingTopic(null)
        setEditTopic({ title: '', description: '' })
        // Refresh language-specific data after update
        await loadLanguageData(adminLanguage)
      } catch (error) {
        console.error('Error updating topic:', error)
        alert(`❌ Error updating topic: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  const handleDeleteTopic = async (topicId: string) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      try {
        await deleteTopic(topicId)
        // Refresh language-specific data after deletion
        await loadLanguageData(adminLanguage)
      } catch (error) {
        console.error('Error deleting topic:', error)
        alert(`❌ Error deleting topic: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  const handleAddSubtopic = async () => {
    if (newSubtopic.title.trim() && newSubtopic.topicId) {
      try {
        await addSubtopicWithLanguage(newSubtopic, adminLanguage)
        setNewSubtopic({ title: '', description: '', topicId: '', isActive: true })
        // Refresh language-specific data after adding
        await loadLanguageData(adminLanguage)
        alert(`✅ Subtopic added to ${adminLanguage === 'fi' ? 'Finnish' : 'English'} database!`)
      } catch (error) {
        console.error('Error adding subtopic:', error)
        alert(`❌ Error adding subtopic: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  const handleUpdateSubtopic = async () => {
    if (editingSubtopic && editSubtopic.title.trim()) {
      try {
        console.log('Updating subtopic:', editingSubtopic.id, 'with data:', editSubtopic)
        await updateSubtopic(editingSubtopic.id, editSubtopic)
        setEditingSubtopic(null)
        setEditSubtopic({ title: '', description: '', topicId: '', isActive: true })
        // Refresh language-specific data after update
        await loadLanguageData(adminLanguage)
      } catch (error) {
        console.error('Error updating subtopic:', error)
        alert(`❌ Error updating subtopic: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  const handleDeleteSubtopic = async (subtopicId: string) => {
    console.log('Attempting to delete subtopic:', subtopicId)
    if (window.confirm(`Are you sure you want to delete this subtopic? (ID: ${subtopicId})`)) {
      try {
        console.log('Confirmed deletion of subtopic:', subtopicId)
        await deleteSubtopic(subtopicId)
        // Refresh language-specific data after deletion
        await loadLanguageData(adminLanguage)
      } catch (error) {
        console.error('Error deleting subtopic:', error)
        alert(`❌ Error deleting subtopic: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  const handleAddKPI = async () => {
    console.log('🔍 Adding KPI:', newKPI)
    if (newKPI.name.trim() && newKPI.subtopicId) {
      try {
        const kpiData = {
          ...newKPI,
          connectedQuestions: []
        }
        console.log('✅ KPI data:', kpiData)
        await addKPIWithLanguage(kpiData, adminLanguage)
        setNewKPI({ name: '', isEssential: true, topicId: '', subtopicId: '' })
        // Refresh language-specific data after adding
        await loadLanguageData(adminLanguage)
        alert(`✅ KPI added to ${adminLanguage === 'fi' ? 'Finnish' : 'English'} database!`)
        console.log('✅ KPI added successfully')
      } catch (error) {
        console.error('Error adding KPI:', error)
        alert(`❌ Error adding KPI: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } else {
      console.log('❌ KPI validation failed:', { name: newKPI.name.trim(), subtopicId: newKPI.subtopicId })
    }
  }

  const handleUpdateKPI = () => {
    if (editingKPI && editKPI.name.trim()) {
      updateKPI(editingKPI.id, editKPI)
      setEditingKPI(null)
      setEditKPI({ name: '', isEssential: true, topicId: '', subtopicId: '' })
    }
  }

  const handleDeleteKPI = (kpiId: string) => {
    if (window.confirm('Are you sure you want to delete this KPI?')) {
      deleteKPI(kpiId)
    }
  }


  const handleUpdateQuestion = () => {
    if (editingQuestion && editQuestion.prompt.trim()) {
      updateQuestion(editingQuestion.id, editQuestion)
      setEditingQuestion(null)
      setEditQuestion({ prompt: '', topicId: '', subtopicId: '', connectedKPIs: [], isActive: true })
    }
  }

  const handleDeleteQuestion = (questionId: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      deleteQuestion(questionId)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Admin Navigation Menu */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Admin Console</h1>
              
              {/* Role Switcher */}
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate('/user')}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  title="Switch to User View"
                >
                  <User className="h-4 w-4 mr-1" />
                  User View
                </button>
                <button
                  onClick={() => navigate('/trainer')}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  title="Switch to Trainer View"
                >
                  <Users className="h-4 w-4 mr-1" />
                  Trainer View
                </button>
                <button
                  onClick={() => navigate('/trainee')}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  title="Switch to Trainee View"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Trainee View
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <a
                href="/admin"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                🏠 Admin Dashboard
              </a>
              <a
                href="/user"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                👤 User View
              </a>
              <a
                href="/trainer"
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                🎓 Trainer View
              </a>
              <a
                href="/"
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                🏡 Landing Page
              </a>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'topics', label: t('topics') },
              { id: 'subtopics', label: t('subtopics') },
              { id: 'kpis', label: t('kpis') },
              { id: 'questions', label: t('questions') },
              { id: 'training-examples', label: t('trainingExamples') },
              { id: 'company-codes', label: t('companyCodes') },
              { id: 'test-data', label: 'Test Data Generator' },
              { id: 'backup', label: 'Backup & Sync' },
              { id: 'ai-evaluation', label: t('aiEvaluation') }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Language Selection */}
          <div className="p-4 bg-blue-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Content Language:</span>
                <select
                  value={adminLanguage}
                  onChange={(e) => setAdminLanguage(e.target.value as 'fi' | 'en')}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="fi">🇫🇮 Finnish (Suomi)</option>
                  <option value="en">🇬🇧 English</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                {adminLanguage === 'fi' 
                  ? 'Adding content to Finnish database' 
                  : 'Adding content to English database'}
              </div>
            </div>
          </div>

          {/* Topics Tab */}
          {activeTab === 'topics' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Topics Management</h2>
                <button
                  onClick={handleAddTopic}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Add Topic
                </button>
              </div>

              {/* Add Topic Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium mb-4">Add New Topic</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newTopic.title}
                      onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter topic title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newTopic.description}
                      onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter topic description"
                    />
                  </div>
                </div>
              </div>

              {/* Topics List */}
              <div className="space-y-4">
                {dataLoading ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading {adminLanguage === 'fi' ? 'Finnish' : 'English'} topics...</p>
                  </div>
                ) : (
                  currentTopics.map((topic) => (
                  <div key={topic.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    {editingTopic?.id === topic.id ? (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Edit Topic</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Title *
                            </label>
                            <input
                              type="text"
                              value={editTopic.title}
                              onChange={(e) => setEditTopic({ ...editTopic, title: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <input
                              type="text"
                              value={editTopic.description}
                              onChange={(e) => setEditTopic({ ...editTopic, description: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleUpdateTopic}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                          >
                            Update Topic
                          </button>
                          <button
                            onClick={() => setEditingTopic(null)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{topic.title}</h3>
                          <p className="text-gray-600 mt-1">{topic.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingTopic(topic)
                              setEditTopic({ title: topic.title, description: topic.description })
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTopic(topic.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
                )}
              </div>
            </div>
          )}

          {/* Subtopics Tab */}
          {activeTab === 'subtopics' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Subtopics Management</h2>
                <button
                  onClick={handleAddSubtopic}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Add Subtopic
                </button>
              </div>

              {/* Add Subtopic Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium mb-4">Add New Subtopic</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Topic *
                    </label>
                    <select
                      value={newSubtopic.topicId}
                      onChange={(e) => setNewSubtopic({ ...newSubtopic, topicId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a topic</option>
                      {currentTopics.map((topic) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newSubtopic.title}
                      onChange={(e) => setNewSubtopic({ ...newSubtopic, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter subtopic title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newSubtopic.description}
                      onChange={(e) => setNewSubtopic({ ...newSubtopic, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter subtopic description"
                    />
                  </div>
                </div>
              </div>

              {/* Subtopics List */}
              <div className="space-y-6">
                {dataLoading ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading {adminLanguage === 'fi' ? 'Finnish' : 'English'} subtopics...</p>
                  </div>
                ) : (
                  currentTopics.map((topic) => {
                    const topicSubtopics = (currentSubtopics || []).filter(s => s.topicId === topic.id)
                  if (topicSubtopics.length === 0) return null
                  
                  return (
                    <div key={topic.id} className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2">
                        {topic.title}
                      </h3>
                      <div className="space-y-3 ml-4">
                        {(currentSubtopics || []).filter(s => s.topicId === topic.id).map((subtopic) => (
                          <div key={subtopic.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      {editingSubtopic && editingSubtopic.id === subtopic.id ? (
                        <div className="space-y-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                          <h3 className="text-lg font-medium text-blue-900">
                            Edit Subtopic: {subtopic.title}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Topic *
                              </label>
                              <select
                                value={editSubtopic.topicId}
                                onChange={(e) => setEditSubtopic({ ...editSubtopic, topicId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select a topic</option>
                                {currentTopics.map((topic) => (
                                  <option key={topic.id} value={topic.id}>
                                    {topic.title}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title *
                              </label>
                              <input
                                type="text"
                                value={editSubtopic.title}
                                onChange={(e) => setEditSubtopic({ ...editSubtopic, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                              </label>
                              <input
                                type="text"
                                value={editSubtopic.description}
                                onChange={(e) => setEditSubtopic({ ...editSubtopic, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleUpdateSubtopic}
                              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                            >
                              Update Subtopic
                            </button>
                            <button
                              onClick={() => setEditingSubtopic(null)}
                              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {subtopic.title} (ID: {subtopic.id.slice(-4)})
                            </h3>
                            <p className="text-gray-600 mt-1">{subtopic.description}</p>
                            <p className="text-sm text-gray-500 mt-1">Under: {topic?.title || 'Unknown Topic'}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                console.log('Editing subtopic:', subtopic.id, subtopic.title)
                                setEditingSubtopic(subtopic)
                                setEditSubtopic({ 
                                  title: subtopic.title, 
                                  description: subtopic.description, 
                                  topicId: subtopic.topicId, 
                                  isActive: subtopic.isActive 
                                })
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                console.log('Delete button clicked for subtopic:', subtopic.id, subtopic.title)
                                handleDeleteSubtopic(subtopic.id)
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
                )}
              </div>
            </div>
          )}

          {/* KPIs Tab */}
          {activeTab === 'kpis' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">KPIs Management</h2>
              </div>

              {/* Add KPI Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium mb-4">Add New KPI</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtopic *
                    </label>
                    <select
                      value={newKPI.subtopicId}
                      onChange={(e) => {
                        const selectedSubtopicId = e.target.value
                        const selectedSubtopic = (currentSubtopics || []).find(s => s.id === selectedSubtopicId)
                        setNewKPI({ 
                          ...newKPI, 
                          subtopicId: selectedSubtopicId,
                          topicId: selectedSubtopic?.topicId || ''
                        })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a subtopic</option>
                      {(subtopics || []).map((subtopic) => {
                        const topic = topics.find(t => t.id === subtopic.topicId)
                        return (
                          <option key={subtopic.id} value={subtopic.id}>
                            {topic?.title} - {subtopic.title}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      KPI Name *
                    </label>
                    <input
                      type="text"
                      value={newKPI.name}
                      onChange={(e) => setNewKPI({ ...newKPI, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter KPI name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Essential
                    </label>
                    <select
                      value={newKPI.isEssential.toString()}
                      onChange={(e) => setNewKPI({ ...newKPI, isEssential: e.target.value === 'true' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleAddKPI}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Add KPI
                    </button>
                  </div>
                </div>
              </div>

              {/* KPIs List */}
              <div className="space-y-6">
                {/* Show all KPIs if no topics have KPIs */}
                {kpis.length > 0 && topics.every(topic => {
                  const topicSubtopics = (subtopics || []).filter(s => s.topicId === topic.id)
                  const topicKPIs = kpis.filter(k => {
                    if (k.topicId === topic.id) return true
                    return topicSubtopics.some(st => st.id === k.subtopicId)
                  })
                  return topicKPIs.length === 0
                }) && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2">
                      All KPIs ({kpis.length})
                    </h3>
                    <div className="space-y-2">
                      {kpis.map((kpi) => (
                        <div key={kpi.id} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-md font-medium text-gray-800">{kpi.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Topic: {topics.find(t => t.id === kpi.topicId)?.title || 'Unknown'}
                                {kpi.subtopicId && (
                                  <> | Subtopic: {(subtopics || []).find(s => s.id === kpi.subtopicId)?.title || 'Unknown'}</>
                                )}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Essential: {kpi.isEssential ? 'Yes' : 'No'}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingKPI(kpi)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteKPI(kpi.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {topics.map((topic) => {
                  const topicSubtopics = (subtopics || []).filter(s => s.topicId === topic.id)
                  // Show KPIs for this topic - either directly linked to topic or through subtopics
                  const topicKPIs = kpis.filter(k => {
                    // KPI directly linked to topic
                    if (k.topicId === topic.id) return true
                    // KPI linked to subtopic of this topic
                    return topicSubtopics.some(st => st.id === k.subtopicId)
                  })
                  if (topicKPIs.length === 0) return null
                  
                  return (
                    <div key={topic.id} className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2">
                        {topic.title}
                      </h3>
                      <div className="space-y-4 ml-4">
                        {(subtopics || []).filter(s => s.topicId === topic.id).map((subtopic) => {
                          const subtopicKPIs = kpis.filter(k => k.subtopicId === subtopic.id)
                          if (subtopicKPIs.length === 0) return null
                          
                          return (
                            <div key={subtopic.id} className="space-y-2">
                              <h4 className="text-md font-medium text-gray-700 border-l-2 border-gray-300 pl-3">
                                {subtopic.title}
                              </h4>
                              <div className="space-y-2 ml-4">
                                {subtopicKPIs.map((kpi) => (
                                  <div key={kpi.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      {editingKPI?.id === kpi.id ? (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Edit KPI: {kpi.name}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Subtopic *
                              </label>
                              <select
                                value={editKPI.subtopicId}
                                onChange={(e) => setEditKPI({ ...editKPI, subtopicId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select a subtopic</option>
                                {(subtopics || []).map((subtopic) => {
                                  const topic = topics.find(t => t.id === subtopic.topicId)
                                  return (
                                    <option key={subtopic.id} value={subtopic.id}>
                                      {topic?.title} - {subtopic.title}
                                    </option>
                                  )
                                })}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                KPI Name *
                              </label>
                              <input
                                type="text"
                                value={editKPI.name}
                                onChange={(e) => setEditKPI({ ...editKPI, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Essential
                              </label>
                              <select
                                value={editKPI.isEssential.toString()}
                                onChange={(e) => setEditKPI({ ...editKPI, isEssential: e.target.value === 'true' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                              </select>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={handleUpdateKPI}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                              >
                                Update
                              </button>
                              <button
                                onClick={() => setEditingKPI(null)}
                                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{kpi.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {topic?.title} - {subtopic?.title}
                            </p>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                              kpi.isEssential ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {kpi.isEssential ? 'Essential' : 'Non-essential'}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingKPI(kpi)
                                setEditKPI({ name: kpi.name, isEssential: kpi.isEssential, topicId: kpi.topicId, subtopicId: kpi.subtopicId })
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteKPI(kpi.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Questions Management</h2>
              </div>


              {/* Add Question Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium mb-4">Add New Question</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtopic *
                    </label>
                    <select
                      value={newQuestion.subtopicId}
                      onChange={(e) => {
                        const selectedSubtopic = (subtopics || []).find(s => s.id === e.target.value)
                        setNewQuestion({ 
                          ...newQuestion, 
                          subtopicId: e.target.value,
                          topicId: selectedSubtopic?.topicId || '',
                          isActive: true
                        })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a subtopic</option>
                      {(subtopics || []).map((subtopic) => {
                        const topic = topics.find(t => t.id === subtopic.topicId)
                        return (
                          <option key={subtopic.id} value={subtopic.id}>
                            {topic?.title} - {subtopic.title}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question Prompt *
                    </label>
                    <textarea
                      value={newQuestion.prompt}
                      onChange={(e) => setNewQuestion({ ...newQuestion, prompt: e.target.value, isActive: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Enter the question prompt"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Connect KPIs
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                      {kpis
                        .filter(k => k.subtopicId === newQuestion.subtopicId)
                        .map((kpi) => (
                          <label key={kpi.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              
                              checked={newQuestion.connectedKPIs.includes(kpi.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewQuestion({
                                    ...newQuestion,
                                    connectedKPIs: e.target.checked 
                                      ? [...newQuestion.connectedKPIs, kpi.id]
                                      : newQuestion.connectedKPIs.filter(id => id !== kpi.id),
                                    isActive: true
                                  })
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">{kpi.name}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                  
                  {/* Add Question Button - Moved below Connect KPIs */}
                  <div className="pt-4">
                    <button
                      onClick={handleAddQuestion}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Add Question
                    </button>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {questions.map((question) => {
                  const subtopic = (subtopics || []).find(s => s.id === question.subtopicId)
                  const topic = topics.find(t => t.id === subtopic?.topicId)
                  return (
                    <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      {editingQuestion?.id === question.id ? (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Edit Question</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Subtopic *
                              </label>
                              <select
                                value={editQuestion.subtopicId}
                                onChange={(e) => setEditQuestion({ ...editQuestion, subtopicId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select a subtopic</option>
                                {(subtopics || []).map((subtopic) => {
                                  const topic = topics.find(t => t.id === subtopic.topicId)
                                  return (
                                    <option key={subtopic.id} value={subtopic.id}>
                                      {topic?.title} - {subtopic.title}
                                    </option>
                                  )
                                })}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Question Prompt *
                              </label>
                              <textarea
                                value={editQuestion.prompt}
                                onChange={(e) => setEditQuestion({ ...editQuestion, prompt: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Connect KPIs
                              </label>
                              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                                {kpis
                                  .filter(k => k.subtopicId === editQuestion.subtopicId)
                                  .map((kpi) => (
                                    <label key={kpi.id} className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={editQuestion.connectedKPIs.includes(kpi.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setEditQuestion({
                                              ...editQuestion,
                                              connectedKPIs: [...editQuestion.connectedKPIs, kpi.id]
                                            })
                                          } else {
                                            setEditQuestion({
                                              ...editQuestion,
                                              connectedKPIs: editQuestion.connectedKPIs.filter(id => id !== kpi.id)
                                            })
                                          }
                                        }}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-sm">{kpi.name}</span>
                                    </label>
                                  ))}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={handleUpdateQuestion}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                              >
                                Update Question
                              </button>
                              <button
                                onClick={() => setEditingQuestion(null)}
                                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{question.prompt}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {topic?.title} - {subtopic?.title}
                            </p>
                            <div className="mt-2">
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                question.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {question.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            {question.connectedKPIs.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-600">Connected KPIs:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {question.connectedKPIs.map((kpiId) => {
                                    const kpi = kpis.find(k => k.id === kpiId)
                                    return kpi ? (
                                      <span key={kpiId} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                        {kpi.name}
                                      </span>
                                    ) : null
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => {
                                setEditingQuestion(question)
                                setEditQuestion({
                                  prompt: question.prompt,
                                  topicId: question.topicId,
                                  subtopicId: question.subtopicId || '',
                                  connectedKPIs: question.connectedKPIs,
                                  isActive: question.isActive
                                })
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Other tabs placeholder */}

          {activeTab === 'training-examples' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{t('trainingExamples')}</h2>
              </div>

              {/* Add Training Example Form */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('addTrainingExample')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('question')} *
                    </label>
                    <select
                      value={newTrainingExample.questionId || ''}
                      onChange={(e) => setNewTrainingExample({ ...newTrainingExample, questionId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Valitse kysymys</option>
                      {currentQuestions.map(question => {
                        const subtopic = (currentSubtopics || []).find(s => s.id === question.subtopicId)
                        const topic = currentTopics.find(t => t.id === subtopic?.topicId)
                        return (
                          <option key={question.id} value={question.id}>
                            {topic?.title} → {subtopic?.title} → {question.prompt}
                          </option>
                        )
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('grade')} (0-3)
                    </label>
                    <select
                      value={newTrainingExample.qualityRating || 0}
                      onChange={(e) => setNewTrainingExample({ ...newTrainingExample, qualityRating: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>{t('grade0')}</option>
                      <option value={1}>{t('grade1')}</option>
                      <option value={2}>{t('grade2')}</option>
                      <option value={3}>{t('grade3')}</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('exampleAnswer')} *
                  </label>
                  <textarea
                    value={newTrainingExample.answerText || ''}
                    onChange={(e) => setNewTrainingExample({ ...newTrainingExample, answerText: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Kirjoita mallivastaus tähän..."
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model Evaluation (Optional)
                    <span className="text-sm text-gray-500 ml-1">- Helps AI improve grading accuracy</span>
                  </label>
                  <textarea
                    value={newTrainingExample.feedback || ''}
                    onChange={(e) => setNewTrainingExample({ ...newTrainingExample, feedback: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Example: 'This answer demonstrates excellent understanding of stakeholder management (2 KPIs detected). The response shows clear knowledge of communication strategies and conflict resolution techniques.'"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Provide example feedback that shows how the AI should evaluate similar answers. This helps train the AI to give more accurate and consistent feedback.
                  </p>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('selectKPIs')}
                  </label>
                  {newTrainingExample.questionId ? (
                    (() => {
                      const selectedQuestion = currentQuestions.find(q => q.id === newTrainingExample.questionId)
                      const questionSubtopic = selectedQuestion ? (currentSubtopics || []).find(s => s.id === selectedQuestion.subtopicId) : null
                      const availableKPIs = questionSubtopic ? (currentKPIs || []).filter(kpi => kpi.subtopicId === questionSubtopic.id) : []
                      
                      return availableKPIs.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {availableKPIs.map(kpi => (
                            <label key={kpi.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={newTrainingExample.detectedKPIs?.includes(kpi.id) || false}
                                onChange={(e) => {
                                  const currentKPIs = newTrainingExample.detectedKPIs || []
                                  const updatedKPIs = e.target.checked
                                    ? [...currentKPIs, kpi.id]
                                    : currentKPIs.filter(id => id !== kpi.id)
                                  setNewTrainingExample({ ...newTrainingExample, detectedKPIs: updatedKPIs })
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{kpi.name}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No KPIs available for the selected question's subtopic.</p>
                      )
                    })()
                  ) : (
                    <p className="text-gray-500 text-sm">Please select a question first to see available KPIs.</p>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => setNewTrainingExample({
                      questionId: '',
                      answerText: '',
                      qualityRating: 0,
                      detectedKPIs: [],
                      feedback: '',
                      exampleType: 'training'
                    })}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleAddTrainingExample}
                    disabled={!newTrainingExample.questionId || !newTrainingExample.answerText}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('add')}
                  </button>
                </div>
              </div>

              {/* Training Examples List */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Harjoitusesimerkit</h3>
                  
                  {trainingExamples.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Ei harjoitusesimerkkejä vielä lisätty</p>
                  ) : (
                    <div className="space-y-4">
                      {trainingExamples.map((example) => {
                        const question = currentQuestions.find(q => q.id === example.questionId)
                        const subtopic = (currentSubtopics || []).find(s => s.id === question?.subtopicId)
                        const topic = currentTopics.find(t => t.id === subtopic?.topicId)
                        const selectedKPIs = currentKPIs.filter(kpi => example.detectedKPIs.includes(kpi.id))
                        
                        return (
                          <div key={example.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="text-sm text-blue-600 mb-1">
                                  {topic?.title} → {subtopic?.title}
                                </div>
                                <h4 className="font-medium text-gray-900 mb-2">
                                  {question?.prompt || 'Kysymys ei löytynyt'}
                                </h4>
                                <p className="text-sm text-gray-600 mb-2">
                                  {example.answerText}
                                </p>
                                <div className="flex items-center space-x-4">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    example.qualityRating >= 3 ? 'bg-green-100 text-green-800' :
                                    example.qualityRating === 2 ? 'bg-blue-100 text-blue-800' :
                                    example.qualityRating === 1 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {example.qualityRating} pistettä
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    KPI:t: {selectedKPIs.map(kpi => kpi.name).join(', ') || 'Ei valittu'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditTrainingExample(example.id)}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  {t('edit')}
                                </button>
                                <button
                                  onClick={() => handleDeleteTrainingExample(example.id)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  {t('delete')}
                                </button>
                              </div>
                            </div>
                            
                            {example.feedback && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <h5 className="text-sm font-medium text-gray-700 mb-1">{t('aiEvaluation')}:</h5>
                                <p className="text-sm text-gray-600">{example.feedback}</p>
                              </div>
                            )}
                            
                            {!example.feedback && (
                              <div className="mt-3">
                                <button
                                  onClick={async () => {
                                    const feedback = await generateAIEvaluation(example)
                                    updateTrainingExample(example.id, { feedback })
                                  }}
                                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                >
                                  {t('submitForEvaluation')}
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'company-codes' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{t('companyCodes')}</h2>
              </div>

              {/* Add Company Code Form */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Lisää yrityskoodi</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yrityskoodi *
                    </label>
                    <input
                      type="text"
                      value={newCompanyCode.code || ''}
                      onChange={(e) => setNewCompanyCode({ ...newCompanyCode, code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="esim. YRITYS2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yrityksen nimi *
                    </label>
                    <input
                      type="text"
                      value={newCompanyCode.companyName || ''}
                      onChange={(e) => setNewCompanyCode({ ...newCompanyCode, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="esim. Acme Corporation"
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maksimi käyttäjät *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newCompanyCode.maxUsers || 1}
                      onChange={(e) => setNewCompanyCode({ ...newCompanyCode, maxUsers: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Viimeinen voimassaolopäivä
                  </label>
                  <input
                    type="date"
                    value={newCompanyCode.expiresAt || ''}
                    onChange={(e) => setNewCompanyCode({ ...newCompanyCode, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>


                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => setNewCompanyCode({
                      code: '',
                      companyName: '',
                      adminEmail: '',
                      authorizedEmails: [],
                      maxUsers: 1,
                      expiresAt: '',
                      isActive: true
                    })}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleAddCompanyCode}
                    disabled={!newCompanyCode.code || !newCompanyCode.companyName}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Add Company
                  </button>
                </div>
              </div>

              {/* Company Codes List */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Yrityskoodit</h3>
                  
                  {companyCodes.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Ei yrityskoodeja vielä lisätty</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Koodi
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Yritys
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Sallitut sähköpostit
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Viimeinen päivä
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Toiminnot
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {companyCodes.map((code) => (
                            <tr key={code.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {code.code}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {code.companyName}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {code.authorizedEmails && code.authorizedEmails.length > 0 ? (
                                  <div className="space-y-1">
                                    {code.authorizedEmails.slice(0, 2).map((email, index) => (
                                      <div key={index} className="text-xs bg-blue-50 px-2 py-1 rounded">
                                        {email}
                                      </div>
                                    ))}
                                    {code.authorizedEmails.length > 2 && (
                                      <div className="text-xs text-gray-400">
                                        +{code.authorizedEmails.length - 2} muuta
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">Ei sähköposteja</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(code.expiresAt).toLocaleDateString('fi-FI')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  code.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {code.isActive ? 'Aktiivinen' : 'Poistettu käytöstä'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button
                                  onClick={() => setEditingCompanyCode(code)}
                                  className="text-blue-600 hover:text-blue-900 mr-2"
                                >
                                  Muokkaa
                                </button>
                                <button
                                  onClick={() => handleDeleteCompanyCode(code.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  {t('delete')}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* User Management Section - Only show if companies exist */}
              {companyCodes.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
            <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Käyttäjien hallinta</h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valitse yritys
                      </label>
                      <select
                        value={selectedCompanyForUsers || ''}
                        onChange={(e) => setSelectedCompanyForUsers(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Valitse yritys...</option>
                        {companyCodes.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.companyName} ({company.code})
                          </option>
                        ))}
                      </select>
              </div>
              
                    {selectedCompanyForUsers && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lisää käyttäjä
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="email"
                              value={newUserEmail}
                              onChange={(e) => setNewUserEmail(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="user@company.com"
                            />
                            <button
                              onClick={async () => {
                                if (!newUserEmail.trim()) {
                                  alert('Anna sähköpostiosoite')
                                  return
                                }

                                const selectedCompany = companyCodes.find(c => c.id === selectedCompanyForUsers)
                                if (!selectedCompany) return

                                // Create user in Supabase
                                const result = await createUserForCompany(
                                  newUserEmail.trim(),
                                  selectedCompany.code,
                                  selectedCompany.companyName
                                )

                                if (result.success) {
                                  console.log('✅ User created successfully:', newUserEmail)
                                  // Update the company code with the new email
                                  const updatedEmails = [...(selectedCompany.authorizedEmails || []), newUserEmail.trim()]
                                  updateCompanyCode(selectedCompany.id, { authorizedEmails: updatedEmails })
                                  setNewUserEmail('')
                                  alert('Käyttäjä lisätty onnistuneesti!')
                                } else {
                                  console.error('❌ Failed to create user:', result.error)
                                  alert(`Käyttäjän lisääminen epäonnistui: ${result.error}`)
                                }
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Lisää
                            </button>
                          </div>
              </div>
              
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Nykyiset käyttäjät</h4>
                          {(() => {
                            const selectedCompany = companyCodes.find(c => c.id === selectedCompanyForUsers)
                            const emails = selectedCompany?.authorizedEmails || []
                            
                            if (emails.length === 0) {
                              return <p className="text-gray-500 text-sm">Ei käyttäjiä lisätty</p>
                            }

                            return (
                              <div className="space-y-2">
                                {emails.map((email, index) => (
                                  <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                                    <span className="text-sm text-gray-700">{email}</span>
                                    <button
                                      onClick={async () => {
                                        if (confirm(`Haluatko varmasti poistaa käyttäjän ${email}?`)) {
                                          const selectedCompany = companyCodes.find(c => c.id === selectedCompanyForUsers)
                                          if (!selectedCompany) return

                                          // Remove user from Supabase
                                          const result = await removeUserForCompany(email, selectedCompany.code)

                                          if (result.success) {
                                            console.log('✅ User removed successfully:', email)
                                            // Update the company code
                                            const updatedEmails = emails.filter(e => e !== email)
                                            updateCompanyCode(selectedCompany.id, { authorizedEmails: updatedEmails })
                                            alert('Käyttäjä poistettu onnistuneesti!')
                                          } else {
                                            console.error('❌ Failed to remove user:', result.error)
                                            alert(`Käyttäjän poistaminen epäonnistui: ${result.error}`)
                                          }
                                        }
                                      }}
                                      className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                      Poista
                                    </button>
                      </div>
                                ))}
                      </div>
                            )
                          })()}
                    </div>
                  </div>
                    )}
                </div>
                </div>
              )}
            </div>
          )}

          {/* Company Code Edit Modal */}
          {editingCompanyCode && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Muokkaa yrityskoodia: {editingCompanyCode.code}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yrityksen nimi
                    </label>
                    <input
                      type="text"
                      value={editingCompanyCode.companyName}
                      onChange={(e) => setEditingCompanyCode({
                        ...editingCompanyCode,
                        companyName: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                      </div>

                      <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Viimeinen voimassaolopäivä
                    </label>
                    <input
                      type="date"
                      value={editingCompanyCode.expiresAt}
                      onChange={(e) => setEditingCompanyCode({
                        ...editingCompanyCode,
                        expiresAt: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                      </div>

                      <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sallitut sähköpostiosoitteet
                    </label>
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="esim. user@company.com"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              if (newEmail && !editingCompanyCode.authorizedEmails?.includes(newEmail)) {
                                setEditingCompanyCode({
                                  ...editingCompanyCode,
                                  authorizedEmails: [...(editingCompanyCode.authorizedEmails || []), newEmail]
                                })
                                setNewEmail('')
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (newEmail && !editingCompanyCode.authorizedEmails?.includes(newEmail)) {
                              // Add to local state first
                              setEditingCompanyCode({
                                ...editingCompanyCode,
                                authorizedEmails: [...(editingCompanyCode.authorizedEmails || []), newEmail]
                              })
                              
                              // Create user in Supabase
                              const result = await createUserForCompany(
                                newEmail, 
                                editingCompanyCode.code, 
                                editingCompanyCode.companyName
                              )
                              
                              if (result.success) {
                                console.log('✅ User created successfully:', newEmail)
                                setNewEmail('')
                              } else {
                                console.error('❌ Failed to create user:', result.error)
                                alert(`Failed to create user: ${result.error}`)
                                // Remove from local state if user creation failed
                                setEditingCompanyCode({
                                  ...editingCompanyCode,
                                  authorizedEmails: editingCompanyCode.authorizedEmails || []
                                })
                              }
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Lisää
                        </button>
                  </div>

                      {/* Display current emails */}
                      {editingCompanyCode.authorizedEmails && editingCompanyCode.authorizedEmails.length > 0 && (
                    <div className="space-y-2">
                          <p className="text-sm text-gray-600">Nykyiset sähköpostit:</p>
                          <div className="flex flex-wrap gap-2">
                            {editingCompanyCode.authorizedEmails.map((email, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                              >
                                {email}
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const emailToRemove = editingCompanyCode.authorizedEmails?.[index]
                                    if (emailToRemove) {
                                      // Remove user from Supabase
                                      const result = await removeUserForCompany(
                                        emailToRemove, 
                                        editingCompanyCode.code
                                      )
                                      
                                      if (result.success) {
                                        console.log('✅ User removed successfully:', emailToRemove)
                                        // Remove from local state
                                        setEditingCompanyCode({
                                          ...editingCompanyCode,
                                          authorizedEmails: editingCompanyCode.authorizedEmails?.filter((_, i) => i !== index) || []
                                        })
                                      } else {
                                        console.error('❌ Failed to remove user:', result.error)
                                        alert(`Failed to remove user: ${result.error}`)
                                      }
                                    }
                                  }}
                                  className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                      </div>
                      </div>
                      )}
                      </div>
                  </div>

                      <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={editingCompanyCode.isActive}
                      onChange={(e) => setEditingCompanyCode({
                        ...editingCompanyCode,
                        isActive: e.target.checked
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Aktiivinen
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setEditingCompanyCode(null)
                      setNewEmail('')
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Peruuta
                  </button>
                  <button
                    onClick={() => {
                      updateCompanyCode(editingCompanyCode.id, editingCompanyCode)
                      setEditingCompanyCode(null)
                      setNewEmail('')
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Tallenna muutokset
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Evaluation Rules Tab */}
          {activeTab === 'ai-evaluation' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{t('aiEvaluation')}</h2>
              </div>
              
              <AIEvaluationRules 
                rules={evaluationRules}
                onRulesChange={setEvaluationRules}
                tips={aiTips}
                onTipsChange={handleAITipsChange}
                language={adminLanguage}
                onAddTip={addAIEvaluationCriteria}
                onUpdateTip={updateAIEvaluationCriteria}
                onDeleteTip={deleteAIEvaluationCriteria}
                tipsLoading={aiTipsLoading}
                tipsWithIds={aiTipsWithIds}
              />
            </div>
          )}

          {/* Test Data Generator Tab */}
          {activeTab === 'test-data' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Test Data Generator</h2>
                <TestTube className="w-6 h-6 text-blue-600" />
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    Generate synthetic exam attempts for testing purposes. This will create N test attempts with 
                    randomized questions, synthetic answers, and AI evaluations.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* User Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select User
                    </label>
                    <select
                      value={testDataConfig.userEmail}
                      onChange={(e) => setTestDataConfig({ ...testDataConfig, userEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a user...</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.email}>
                          {user.email} ({user.name || 'No name'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Topic Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Topic
                    </label>
                    <select
                      value={testDataConfig.topicId}
                      onChange={(e) => setTestDataConfig({ ...testDataConfig, topicId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a topic...</option>
                      {currentTopics.map((topic) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Number of Attempts */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Attempts
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={testDataConfig.numAttempts}
                      onChange={(e) => setTestDataConfig({ ...testDataConfig, numAttempts: parseInt(e.target.value) || 5 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Language Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Language
                    </label>
                    <select
                      value={testDataConfig.language}
                      onChange={(e) => setTestDataConfig({ ...testDataConfig, language: e.target.value as 'fi' | 'en' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="fi">🇫🇮 Finnish</option>
                      <option value="en">🇬🇧 English</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={generateTestAttempts}
                    disabled={isGeneratingTestData || !testDataConfig.userEmail || !testDataConfig.topicId}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {isGeneratingTestData ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4" />
                        <span>Generate Test Attempts</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>Note:</strong> This will create {testDataConfig.numAttempts} exam attempts for {testDataConfig.userEmail || 'selected user'} 
                  using the {testDataConfig.language === 'fi' ? 'Finnish' : 'English'} content database.</p>
                  <p className="mt-1">Each attempt will include randomized questions, synthetic answers, and AI evaluations.</p>
                </div>
              </div>
            </div>
          )}

          {/* Backup & Sync Tab */}
          {activeTab === 'backup' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Backup & Data Sync</h2>
                  </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Supabase Sync Section - localStorage section removed (auto-sync active) */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Changes
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Save all your edits to localStorage. This ensures your changes are preserved.
                  </p>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        // Save each data type individually
                        localStorage.setItem('ipma_topics', JSON.stringify({
                          timestamp: new Date().toISOString(),
                          data: topics
                        }))
                        localStorage.setItem('ipma_questions', JSON.stringify({
                          timestamp: new Date().toISOString(),
                          data: questions
                        }))
                        localStorage.setItem('ipma_kpis', JSON.stringify({
                          timestamp: new Date().toISOString(),
                          data: kpis
                        }))
                        localStorage.setItem('ipma_company_codes', JSON.stringify({
                          timestamp: new Date().toISOString(),
                          data: companyCodes
                        }))
                        localStorage.setItem('ipma_subtopics', JSON.stringify({
                          timestamp: new Date().toISOString(),
                          data: subtopics
                        }))
                        localStorage.setItem('ipma_sample_answers', JSON.stringify({
                          timestamp: new Date().toISOString(),
                          data: sampleAnswers
                        }))
                        localStorage.setItem('ipma_training_examples', JSON.stringify({
                          timestamp: new Date().toISOString(),
                          data: trainingExamples
                        }))
                        localStorage.setItem('ipma_users', JSON.stringify({
                          timestamp: new Date().toISOString(),
                          data: users
                        }))
                        localStorage.setItem('ipma_subscriptions', JSON.stringify({
                          timestamp: new Date().toISOString(),
                          data: subscriptions
                        }))
                        
                        alert(`✅ All data saved to localStorage!\n\nTopics: ${topics.length}\nQuestions: ${questions.length}\nKPIs: ${kpis.length}\nCompany Codes: ${companyCodes.length}\nSubtopics: ${subtopics.length}\nSample Answers: ${sampleAnswers.length}\nTraining Examples: ${trainingExamples.length}\nUsers: ${users.length}\nSubscriptions: ${subscriptions.length}`)
                      }}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Save All Changes
                    </button>
                  </div>
                </div>

                {/* Supabase Sync Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Supabase Sync
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Sync your data to/from Supabase database for persistent storage across deployments.
                  </p>
                  
                  <p className="text-sm text-gray-500 italic">
                    Manual sync buttons removed - all changes are automatically synced to Supabase in real-time.
                  </p>
                </div>
              </div>

              {/* Info: Data is auto-synced to Supabase */}
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  <div>
                    <h4 className="text-sm font-medium text-green-800">Automatic Sync Active</h4>
                    <p className="text-sm text-green-700 mt-1">
                      All data changes are automatically saved to Supabase in real-time. Manual sync is available above if needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminConsole


 
