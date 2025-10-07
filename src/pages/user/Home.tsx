import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Play, Clock, BarChart3, Filter, X, AlertCircle, Target, BookOpen } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useData } from '../../contexts/DataContext'
import { useAuthSupabase as useAuth } from '../../hooks/useAuthSupabase'
import { Attempt } from '../../types'

export const UserHome = () => {
  const { t, language } = useLanguage()
  const { topics, subtopics, getUserAttempts, getUserAttemptItems, selectRandomQuestions, createAttempt, getTopicsByLanguage, getSubtopicsByLanguage } = useData()
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('')
  const [showExamInstructions, setShowExamInstructions] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<any>(null)
  const [userAttempts, setUserAttempts] = useState<Attempt[]>([])
  const [userAttemptItems, setUserAttemptItems] = useState<any[]>([])
  
  // Language-specific data state
  const [currentTopics, setCurrentTopics] = useState(topics)
  const [currentSubtopics, setCurrentSubtopics] = useState(subtopics)
  const [dataLoading, setDataLoading] = useState(false)
  
  // Load language-specific data when language changes
  useEffect(() => {
    const loadLanguageData = async () => {
      setDataLoading(true)
      try {
        const [topicsData, subtopicsData] = await Promise.all([
          getTopicsByLanguage(language),
          getSubtopicsByLanguage(language)
        ])
        
        setCurrentTopics(topicsData)
        setCurrentSubtopics(subtopicsData)
        
        console.log(`✅ Loaded ${language} data for user home:`, {
          topics: topicsData.length,
          subtopics: subtopicsData.length
        })
      } catch (error) {
        console.error(`❌ Error loading ${language} data for user home:`, error)
        setCurrentTopics([])
        setCurrentSubtopics([])
      } finally {
        setDataLoading(false)
      }
    }
    
    loadLanguageData()
  }, [language, getTopicsByLanguage, getSubtopicsByLanguage])
  
  // Load user attempts
  useEffect(() => {
    const loadUserAttempts = async () => {
      if (!user) {
        setUserAttempts([])
        return
      }
      
      try {
        const attempts = await getUserAttempts(user.id)
        const attemptItems = await getUserAttemptItems(user.id)
        setUserAttempts(attempts)
        setUserAttemptItems(attemptItems)
      } catch (error) {
        console.error('Error loading user attempts:', error)
        setUserAttempts([])
        setUserAttemptItems([])
      }
    }
    
    loadUserAttempts()
  }, [user, getUserAttempts, getUserAttemptItems])

  // Show loading state while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  // Calculate statistics
  const totalAttempts = userAttempts.length
  const totalTimeSpent = userAttempts.reduce((total, attempt) => {
    const subtopicCount = subtopics.filter(s => s.topicId === attempt.topicId).length
    return total + (subtopicCount * 3) // 3 minutes per subtopic
  }, 0)
  
  // Calculate average score from actual attempt items
  const totalScore = userAttemptItems.reduce((sum, item) => sum + (item.score || 0), 0)
  const totalQuestions = userAttemptItems.length
  const averageScore = totalQuestions > 0 ? totalScore / totalQuestions : 0

  // Filter attempts by selected topic
  const filteredAttempts = userAttempts.filter(attempt => 
    !selectedTopicFilter || attempt.topicId === selectedTopicFilter
  )

  // Get recent attempts (last 5)
  const recentAttempts = filteredAttempts
    .sort((a, b) => new Date(b.submittedAt || b.createdAt).getTime() - new Date(a.submittedAt || a.createdAt).getTime())
    .slice(0, 5)
    .map(attempt => {
      const topic = currentTopics.find(t => t.id === attempt.topicId)
      const subtopicCount = currentSubtopics.filter(s => s.topicId === attempt.topicId).length
      const duration = `${subtopicCount * 3} min`
      const date = new Date(attempt.submittedAt || attempt.createdAt).toLocaleDateString('fi-FI')
      
      // Calculate score from attempt items
      const attemptItemsForAttempt = userAttemptItems.filter(item => item.attemptId === attempt.id)
      const totalScore = attemptItemsForAttempt.reduce((sum, item) => sum + (item.score || 0), 0)
      
      return {
        id: attempt.id,
        topic: topic?.title || 'Tuntematon aihe',
        score: totalScore,
        date,
        duration,
        topicId: attempt.topicId
      }
    })

  // Handle exam button click - show popup instead of navigating
  const handleExamClick = (topic: any) => {
    setSelectedTopic(topic)
    setShowExamInstructions(true)
  }

  // Start exam from popup
  const handleStartExam = async () => {
    console.log('🚀 Start Exam clicked, user:', user?.email, 'role:', user?.role, 'loading:', loading)
    console.log('🚀 User object details:', { 
      id: user?.id, 
      email: user?.email, 
      role: user?.role, 
      companyCode: user?.companyCode,
      fullUser: user 
    })
    
    if (loading) {
      console.log('⏳ Auth still loading, please wait...')
      return
    }
    
    if (!user) {
      console.log('❌ No user found, redirecting to login')
      navigate('/auth/company')
      return
    }

    try {
      // Select random questions (one per subtopic)
      console.log('🚀 Starting exam for topic:', selectedTopic.title, 'ID:', selectedTopic.id)
      const selectedQuestionIds = selectRandomQuestions(selectedTopic.id)
      console.log('🚀 Selected question IDs:', selectedQuestionIds)
      
      if (selectedQuestionIds.length === 0) {
        alert('No questions available for this topic. Please add questions first.')
        return
      }

      // Create attempt record in Supabase
      const attempt = await createAttempt(user.id, selectedTopic.id, selectedQuestionIds)
      
      console.log('🚀 Starting exam:', {
        attemptId: attempt.id,
        topicId: selectedTopic.id,
        questionCount: selectedQuestionIds.length,
        duration: attempt.totalTime,
        userEmail: user.email,
        userRole: user.role
      })
      
      setShowExamInstructions(false)
      
      // Navigate directly to exam page
      console.log('🔄 Navigating to:', `/exam/${attempt.id}`)
      console.log('🔄 Attempt details:', attempt)
      navigate(`/exam/${attempt.id}`)
    } catch (error) {
      console.error('Error starting exam:', error)
      alert('Error starting exam. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('topics.title')}</h1>
          <p className="mt-2 text-gray-600">
            {t('chooseTopicPractice')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Play className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{t('totalPractices')}</p>
                <p className="text-2xl font-semibold text-gray-900">{totalAttempts}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{t('timeSpent')}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Math.floor(totalTimeSpent / 60)}h {totalTimeSpent % 60}m
                </p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{t('averageScore')}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {averageScore.toFixed(1)}/3
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {dataLoading ? (
            <div className="col-span-full text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading {language === 'fi' ? 'Finnish' : 'English'} topics...</p>
            </div>
          ) : (
            currentTopics.filter(topic => topic.isActive).map((topic) => (
            <div key={topic.id} className="card hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {topic.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {topic.description}
                  </p>
                </div>
                <div className="ml-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {t('active')}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {t('questionsAvailable')}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleExamClick(topic)}
                    className="btn-secondary flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>{t('exam')}</span>
                  </button>
                </div>
              </div>
            </div>
            ))
          )}
        </div>

        {/* Topic Filter */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Tenttihistoria</h2>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedTopicFilter}
                onChange={(e) => setSelectedTopicFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Kaikki aiheet</option>
                {currentTopics.filter(topic => topic.isActive).map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {filteredAttempts.length} tenttisuoritusta
              {selectedTopicFilter && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {topics.find(t => t.id === selectedTopicFilter)?.title}
                </span>
              )}
            </div>
            <Link
              to="/app/history"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              {t('viewAll')}
            </Link>
          </div>
        </div>

        {/* Recent Attempts */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{t('recentPracticeSessions')}</h2>
          </div>
          
          <div className="space-y-4">
            {recentAttempts.map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{attempt.topic}</h4>
                  <p className="text-sm text-gray-500">
                    {attempt.date} • {attempt.duration}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      Score: {attempt.score}/3
                    </div>
                    <div className="text-xs text-gray-500">
                      {attempt.score === 3 ? t('excellent') : 
                       attempt.score === 2 ? t('good') : 
                       attempt.score === 1 ? t('needsImprovement') : t('poor')}
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    attempt.score === 3 ? 'bg-green-500' :
                    attempt.score === 2 ? 'bg-yellow-500' :
                    attempt.score === 1 ? 'bg-orange-500' : 'bg-red-500'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Exam Instructions Popup */}
      {showExamInstructions && selectedTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
                  Tentti: {selectedTopic.title}
                </h2>
                <button
                  onClick={() => setShowExamInstructions(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Exam Instructions */}
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Tenttiohjeet
                  </h3>
                  <div className="space-y-2 text-blue-800">
                    <p><strong>Tentin rakenne:</strong> Yksi kysymys per aliaihe valitusta aiheesta</p>
                    <p><strong>Aikajakso:</strong> 3 minuuttia kysymystä kohti (yhteensä: {subtopics.filter(s => s.topicId === selectedTopic.id).length * 3} minuuttia)</p>
                    <p><strong>Vastausmuoto:</strong> Vastaa jokaiseen kysymykseen 3-5 lauseella tai luettelopisteinä</p>
                    <p><strong>Navigointi:</strong> Voit siirtyä kysymysten välillä vapaasti</p>
                    <p><strong>Automaattinen lähetys:</strong> Tenti lähetetään automaattisesti kun aika loppuu</p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Läpäisykriteerit
                  </h3>
                  <div className="space-y-2 text-green-800">
                    <p>✓ <strong>KPI:t vaadittu:</strong> Vastauksistasi tulee löytyä aiheeseen liittyviä avainindikaattoreita</p>
                    <p>✓ <strong>Kokonaispisteet:</strong> Vähintään 50% kokonaispisteistä saavutettava</p>
                    <p>✓ <strong>AI-arviointi:</strong> Vastaukset arvioidaan automaattisesti KPI:iden perusteella</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3">
                    Pisteytysjärjestelmä
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm text-yellow-800">
                    <div>
                      <p><strong>3 pistettä:</strong> ≥3 KPI havaittu</p>
                      <p><strong>2 pistettä:</strong> 2 KPI havaittu</p>
                    </div>
                    <div>
                      <p><strong>1 piste:</strong> 1 KPI havaittu</p>
                      <p><strong>0 pistettä:</strong> 0 KPI havaittu</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowExamInstructions(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Takaisin
                  </button>
                  <button
                    onClick={handleStartExam}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                  >
                    Aloita tentti
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
