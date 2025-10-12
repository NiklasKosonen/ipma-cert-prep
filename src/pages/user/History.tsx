import { useState, useEffect } from 'react'
import { Download, Calendar, Clock, BarChart3, Filter, Target, TrendingUp, CheckCircle, XCircle, X } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { useAuthSupabase as useAuth } from '../../hooks/useAuthSupabase'
import { Attempt, AttemptItem } from '../../types'

export const UserHistory = () => {
  const { getUserAttempts, getUserAttemptItems, topics, subtopics, questions } = useData()
  const { user } = useAuth()
  const [selectedTopic, setSelectedTopic] = useState<string>('all')
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [attemptItems, setAttemptItems] = useState<AttemptItem[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal state for viewing exam details
  const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return

      try {
        const userAttempts = await getUserAttempts(user.id)
        const userAttemptItems = await getUserAttemptItems(user.id)
        setAttempts(userAttempts)
        setAttemptItems(userAttemptItems)
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [user?.id, getUserAttempts, getUserAttemptItems])

  // Filter attempts
  const filteredAttempts = attempts.filter(attempt => {
    if (selectedTopic !== 'all' && attempt.topicId !== selectedTopic) return false
    return true
  })

  // Calculate statistics for selected topic
  const calculateTopicStats = () => {
    const topicAttempts = selectedTopic === 'all' ? attempts : attempts.filter(a => a.topicId === selectedTopic)
    const topicAttemptItems = selectedTopic === 'all' ? attemptItems : attemptItems.filter(item => 
      topicAttempts.some(attempt => attempt.id === item.attemptId)
    )

    const totalExams = topicAttempts.length
    const totalTime = topicAttempts.reduce((sum, attempt) => {
      const subtopicCount = subtopics.filter(s => s.topicId === attempt.topicId).length
      return sum + (subtopicCount * 3) // 3 minutes per subtopic
    }, 0)

    const totalScore = topicAttemptItems.reduce((sum, item) => sum + (item.score || 0), 0)
    const totalQuestions = topicAttemptItems.length
    const averageScore = totalQuestions > 0 ? totalScore / totalQuestions : 0
    const maxPossibleScore = totalQuestions * 3
    const averagePercentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0

    // Calculate pass rate (80% questions answered + 50% points earned)
    const passedExams = topicAttempts.filter(attempt => {
      const attemptItemsForAttempt = topicAttemptItems.filter(item => item.attemptId === attempt.id)
      const answeredQuestions = attemptItemsForAttempt.filter(item => item.answer && item.answer.trim().length > 0).length
      const totalQuestionsForAttempt = attemptItemsForAttempt.length
      const attemptScore = attemptItemsForAttempt.reduce((sum, item) => sum + (item.score || 0), 0)
      const maxScoreForAttempt = totalQuestionsForAttempt * 3
      
      const questionsAnsweredPercentage = totalQuestionsForAttempt > 0 ? (answeredQuestions / totalQuestionsForAttempt) * 100 : 0
      const pointsPercentage = maxScoreForAttempt > 0 ? (attemptScore / maxScoreForAttempt) * 100 : 0
      
      return questionsAnsweredPercentage >= 80 && pointsPercentage >= 50
    }).length

    const passRate = totalExams > 0 ? (passedExams / totalExams) * 100 : 0

    return {
      totalExams,
      totalTime,
      averageScore: averageScore.toFixed(1),
      averagePercentage: averagePercentage.toFixed(1),
      passRate: passRate.toFixed(1),
      totalScore,
      maxPossibleScore
    }
  }

  const stats = calculateTopicStats()

  // Get topic name
  const getTopicName = (topicId: string) => {
    return topics.find(t => t.id === topicId)?.title || 'Unknown Topic'
  }

  // Format time
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}min`
  }

  // Check if exam passed
  const isExamPassed = (attempt: Attempt) => {
    const attemptItemsForAttempt = attemptItems.filter(item => item.attemptId === attempt.id)
    const answeredQuestions = attemptItemsForAttempt.filter(item => item.answer && item.answer.trim().length > 0).length
    const totalQuestionsForAttempt = attemptItemsForAttempt.length
    const attemptScore = attemptItemsForAttempt.reduce((sum, item) => sum + (item.score || 0), 0)
    const maxScoreForAttempt = totalQuestionsForAttempt * 3
    
    const questionsAnsweredPercentage = totalQuestionsForAttempt > 0 ? (answeredQuestions / totalQuestionsForAttempt) * 100 : 0
    const pointsPercentage = maxScoreForAttempt > 0 ? (attemptScore / maxScoreForAttempt) * 100 : 0
    
    return questionsAnsweredPercentage >= 80 && pointsPercentage >= 50
  }

  // Modal functions
  const openAttemptModal = (attempt: Attempt) => {
    setSelectedAttempt(attempt)
    setModalOpen(true)
  }

  const closeAttemptModal = () => {
    setSelectedAttempt(null)
    setModalOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading history...</p>
        </div>
      </div>
    )
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Topic', 'Score', 'Duration', 'Passed', 'Questions Answered']
    const csvContent = [
      headers.join(','),
      ...filteredAttempts.map(attempt => {
        const attemptItemsForAttempt = attemptItems.filter(item => item.attemptId === attempt.id)
        const totalScore = attemptItemsForAttempt.reduce((sum, item) => sum + (item.score || 0), 0)
        const answeredQuestions = attemptItemsForAttempt.filter(item => item.answer && item.answer.trim().length > 0).length
        const passed = isExamPassed(attempt)
        const date = new Date(attempt.createdAt).toLocaleDateString()
        const subtopicCount = subtopics.filter(s => s.topicId === attempt.topicId).length
        const duration = `${subtopicCount * 3} min`
        
        return [
          date,
          `"${getTopicName(attempt.topicId)}"`,
          totalScore,
          duration,
          passed ? 'Yes' : 'No',
          answeredQuestions
        ].join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `practice-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Exam History</h1>
          <p className="mt-2 text-gray-600">
            Track your practice sessions and monitor your progress over time.
          </p>
        </div>

        {/* Topic Filter */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filter by Topic</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTopic('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedTopic === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Topics
            </button>
            {topics.map(topic => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTopic === topic.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {topic.title}
              </button>
            ))}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Exams */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalExams}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {/* Total Time */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Time</p>
                <p className="text-3xl font-bold text-gray-900">{formatTime(stats.totalTime)}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">{stats.averagePercentage}%</p>
                <p className="text-xs text-gray-500">{stats.averageScore}/{stats.maxPossibleScore > 0 ? (stats.maxPossibleScore / stats.totalExams).toFixed(1) : 0} avg</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          {/* Pass Rate */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                <p className="text-3xl font-bold text-gray-900">{stats.passRate}%</p>
                <p className="text-xs text-gray-500">≥80% answered + ≥50% points</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={exportToCSV}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export to CSV</span>
          </button>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {filteredAttempts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No exam history found for the selected filter.</p>
            </div>
          ) : (
            filteredAttempts
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((attempt) => {
                const attemptItemsForAttempt = attemptItems.filter(item => item.attemptId === attempt.id)
                const totalScore = attemptItemsForAttempt.reduce((sum, item) => sum + (item.score || 0), 0)
                const answeredQuestions = attemptItemsForAttempt.filter(item => item.answer && item.answer.trim().length > 0).length
                const totalQuestions = attemptItemsForAttempt.length
                const passed = isExamPassed(attempt)
                const date = new Date(attempt.createdAt).toLocaleDateString()
                const subtopicCount = subtopics.filter(s => s.topicId === attempt.topicId).length
                const duration = `${subtopicCount * 3} min`
                
                return (
                  <div 
                    key={attempt.id} 
                    className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow duration-200"
                    onClick={() => openAttemptModal(attempt)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1 mb-4 lg:mb-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {getTopicName(attempt.topicId)}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {passed ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              passed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {passed ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {date}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {duration}
                          </div>
                          <div className="flex items-center">
                            <BarChart3 className="w-4 h-4 mr-1" />
                            {answeredQuestions}/{totalQuestions} questions answered
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {totalScore}/{totalQuestions * 3}
                          </div>
                          <div className="text-sm text-gray-500">
                            {((totalScore / (totalQuestions * 3)) * 100).toFixed(0)}% score
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
          )}
        </div>
      </div>

      {/* Exam Details Modal */}
      {modalOpen && selectedAttempt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {getTopicName(selectedAttempt.topicId)} - Exam Details
              </h2>
              <button 
                onClick={closeAttemptModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Exam Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Score</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {attemptItems
                        .filter(item => item.attemptId === selectedAttempt.id)
                        .reduce((sum, item) => sum + (item.score || 0), 0)}
                      /{attemptItems.filter(item => item.attemptId === selectedAttempt.id).length * 3}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className={`text-lg font-semibold ${isExamPassed(selectedAttempt) ? 'text-green-600' : 'text-red-600'}`}>
                      {isExamPassed(selectedAttempt) ? 'Passed' : 'Failed'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="text-lg font-medium">
                      {new Date(selectedAttempt.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="text-lg font-medium">
                      {subtopics.filter(s => s.topicId === selectedAttempt.topicId).length * 3} min
                    </p>
                  </div>
                </div>
              </div>

              {/* Questions and Answers */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Questions and Answers</h3>
                
                {attemptItems
                  .filter(item => item.attemptId === selectedAttempt.id)
                  .sort((a, b) => {
                    // Sort by creation time
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                  })
                  .map((item, idx) => {
                    const question = questions.find(q => q.id === item.questionId)
                    
                    return (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">
                            Question {idx + 1}
                          </h4>
                          <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              (item.score || 0) >= 2 ? 'bg-green-100 text-green-800' :
                              (item.score || 0) >= 1 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.score || 0}/3 points
                            </span>
                          </div>
                        </div>
                        
                        {question && (
                          <div className="mb-4">
                            <p className="text-gray-700 leading-relaxed">{question.prompt}</p>
                          </div>
                        )}
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <h5 className="font-medium text-blue-900 mb-2">Your Answer:</h5>
                          <p className="text-blue-800 leading-relaxed">
                            {item.answer || 'No answer provided'}
                          </p>
                        </div>
                        
                        {item.feedback && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                            <h5 className="font-medium text-gray-900 mb-2">AI Feedback:</h5>
                            <p className="text-gray-700 leading-relaxed">{item.feedback}</p>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          {item.kpisDetected && item.kpisDetected.length > 0 && (
                            <div>
                              <span className="font-medium text-green-700">KPIs Detected:</span>
                              <span className="ml-1 text-green-600">
                                {item.kpisDetected.join(', ')}
                              </span>
                            </div>
                          )}
                          {item.kpisMissing && item.kpisMissing.length > 0 && (
                            <div>
                              <span className="font-medium text-red-700">KPIs Missing:</span>
                              <span className="ml-1 text-red-600">
                                {item.kpisMissing.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
            
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closeAttemptModal}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
