import React, { useState, useEffect } from 'react'
import { Clock, Trophy, TrendingUp, Calendar, Eye, ArrowRight, LogOut } from 'lucide-react'
import { UserDataService, ExamResult } from '../../services/userDataService'
import { useData } from '../../contexts/DataContext'

interface DashboardStats {
  totalExams: number
  averageScore: number
  passedExams: number
  totalTimeSpent: number
  lastExamDate: string | null
}

const UserDashboard: React.FC = () => {
  const { topics } = useData()
  const [user, setUser] = useState<any>(null)
  const [examResults, setExamResults] = useState<ExamResult[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalExams: 0,
    averageScore: 0,
    passedExams: 0,
    totalTimeSpent: 0,
    lastExamDate: null
  })
  const [loading, setLoading] = useState(true)
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null)
  const [showEvaluation, setShowEvaluation] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      const userDataService = UserDataService.getInstance()
      
      // Get current user
      const currentUser = await userDataService.getCurrentUser()
      if (!currentUser) {
        // Redirect to login if no user
        window.location.href = '/login'
        return
      }
      
      setUser(currentUser)
      
      // Get user's exam results
      const results = await userDataService.getUserExamResults()
      setExamResults(results)
      
      // Calculate stats
      const dashboardStats: DashboardStats = {
        totalExams: results.length,
        averageScore: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length) : 0,
        passedExams: results.filter(r => r.score >= 80).length,
        totalTimeSpent: results.reduce((sum, r) => sum + r.timeSpent, 0),
        lastExamDate: results.length > 0 ? results[0].completedAt : null
      }
      
      setStats(dashboardStats)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const userDataService = UserDataService.getInstance()
      await userDataService.signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleViewEvaluation = (result: ExamResult) => {
    setSelectedResult(result)
    setShowEvaluation(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getPassStatus = (score: number) => {
    return score >= 80 ? 'PASSED' : 'NOT PASSED'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name || 'User'}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/practice'}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Take Exam
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalExams}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Passed Exams</p>
                <p className="text-2xl font-bold text-gray-900">{stats.passedExams}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Time</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.totalTimeSpent)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Exams */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Exam Results</h2>
          </div>
          
          {examResults.length === 0 ? (
            <div className="p-8 text-center">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No exams taken yet</h3>
              <p className="text-gray-600 mb-4">Start your learning journey by taking your first exam!</p>
              <button
                onClick={() => window.location.href = '/practice'}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Take Your First Exam
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {examResults.map((result) => {
                const topic = topics.find(t => t.id === result.attemptId.split('_')[1]) // Extract topic from attempt
                return (
                  <div key={result.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {topic?.title || 'Exam'}
                          </h3>
                          <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(result.score)}`}>
                            {getPassStatus(result.score)}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(result.completedAt)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDuration(result.timeSpent)}
                          </div>
                          <div className="flex items-center">
                            <Trophy className="h-4 w-4 mr-1" />
                            {result.correctAnswers}/{result.totalQuestions} correct
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{result.score}%</div>
                          <div className="text-sm text-gray-600">Score</div>
                        </div>
                        <button
                          onClick={() => handleViewEvaluation(result)}
                          className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Evaluation Modal */}
      {showEvaluation && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Exam Evaluation</h2>
                <button
                  onClick={() => setShowEvaluation(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Score Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">{selectedResult.score}%</div>
                  <div className="text-green-800 font-medium">Overall Score</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">{selectedResult.correctAnswers}</div>
                  <div className="text-blue-800 font-medium">Correct Answers</div>
                  <div className="text-blue-600 text-sm">out of {selectedResult.totalQuestions}</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">{formatDuration(selectedResult.timeSpent)}</div>
                  <div className="text-purple-800 font-medium">Time Spent</div>
                </div>
              </div>

              {/* Detailed Feedback */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Overall Feedback</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {selectedResult.evaluation.detailedFeedback}
                  </p>
                </div>
              </div>

              {/* Strengths and Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-green-700 mb-4">Strengths</h3>
                  <div className="space-y-2">
                    {selectedResult.evaluation.strengths.length > 0 ? (
                      selectedResult.evaluation.strengths.map((strength: string, index: number) => (
                        <div key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-700">{strength}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No specific strengths identified</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-red-700 mb-4">Areas for Improvement</h3>
                  <div className="space-y-2">
                    {selectedResult.evaluation.weaknesses.length > 0 ? (
                      selectedResult.evaluation.weaknesses.map((weakness: string, index: number) => (
                        <div key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-700">{weakness}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No specific weaknesses identified</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-blue-700 mb-4">Recommendations</h3>
                <div className="space-y-3">
                  {selectedResult.evaluation.recommendations.map((recommendation: string, index: number) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowEvaluation(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => window.location.href = '/practice'}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  Take Another Exam
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserDashboard
