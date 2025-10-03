import React, { useState, useEffect } from 'react'
import { useAuthSupabase as useAuth } from '../../hooks/useAuthSupabase'
import { useData } from '../../contexts/DataContext'
import { Attempt, AttemptItem } from '../../types'
import { 
  BarChart3, 
  Clock, 
  Target, 
  TrendingUp, 
  Filter,
  User
} from 'lucide-react'

const Profile: React.FC = () => {
  const { user } = useAuth()
  const { getUserAttempts, getUserAttemptItems, topics } = useData()
  
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [attemptItems, setAttemptItems] = useState<AttemptItem[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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

  // Filter attempts by selected topic
  const filteredAttempts = selectedTopic 
    ? attempts.filter(attempt => attempt.topicId === selectedTopic)
    : attempts

  // Calculate statistics
  const calculateStats = () => {
    const totalExams = filteredAttempts.length
    const totalTime = filteredAttempts.reduce((sum, attempt) => {
      const duration = attempt.totalTime || 0
      return sum + duration
    }, 0)
    
    const totalScore = filteredAttempts.reduce((sum, attempt) => {
      const attemptItemsForAttempt = attemptItems.filter(item => item.attemptId === attempt.id)
      const attemptScore = attemptItemsForAttempt.reduce((itemSum, item) => itemSum + (item.score || 0), 0)
      return sum + attemptScore
    }, 0)
    
    const maxPossibleScore = filteredAttempts.reduce((sum, attempt) => {
      const attemptItemsForAttempt = attemptItems.filter(item => item.attemptId === attempt.id)
      return sum + (attemptItemsForAttempt.length * 3) // 3 points per question
    }, 0)
    
    const averageScore = totalExams > 0 ? totalScore / totalExams : 0
    const averageScorePercentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0
    const passRate = totalExams > 0 
      ? (filteredAttempts.filter(attempt => {
          const attemptItemsForAttempt = attemptItems.filter(item => item.attemptId === attempt.id)
          const attemptScore = attemptItemsForAttempt.reduce((sum, item) => sum + (item.score || 0), 0)
          const maxScore = attemptItemsForAttempt.length * 3
          const percentage = maxScore > 0 ? (attemptScore / maxScore) * 100 : 0
          return percentage >= 50 // Pass criteria: 50% or higher
        }).length / totalExams) * 100
      : 0

    return {
      totalExams,
      totalTime,
      averageScore: averageScore.toFixed(1),
      averageScorePercentage: averageScorePercentage.toFixed(1),
      passRate: passRate.toFixed(1),
      totalScore,
      maxPossibleScore
    }
  }

  const stats = calculateStats()

  // Get topic name
  const getTopicName = (topicId: string) => {
    return topics.find(t => t.id === topicId)?.title || 'Unknown Topic'
  }

  // Format time in minutes
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}min`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <User className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Topic Filter */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filter by Topic</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTopic(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedTopic === null
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

          {/* Total Study Time */}
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
                <p className="text-3xl font-bold text-gray-900">{stats.averageScorePercentage}%</p>
                <p className="text-xs text-gray-500">{stats.averageScore}/{stats.maxPossibleScore > 0 ? (stats.maxPossibleScore / filteredAttempts.length).toFixed(1) : 0} avg</p>
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
                <p className="text-xs text-gray-500">≥50% to pass</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Recent Exams */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Exams</h2>
          
          {filteredAttempts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No exams found for the selected filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAttempts
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 10)
                .map(attempt => {
                  const attemptItemsForAttempt = attemptItems.filter(item => item.attemptId === attempt.id)
                  const attemptScore = attemptItemsForAttempt.reduce((sum, item) => sum + (item.score || 0), 0)
                  const maxScore = attemptItemsForAttempt.length * 3
                  const percentage = maxScore > 0 ? (attemptScore / maxScore) * 100 : 0
                  const passed = percentage >= 50

                  return (
                    <div key={attempt.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {getTopicName(attempt.topicId)}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              passed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {passed ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {attemptItemsForAttempt.length} questions • {formatTime(attempt.totalTime || 0)} • {new Date(attempt.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {attemptScore}/{maxScore}
                          </p>
                          <p className="text-sm text-gray-600">
                            {percentage.toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
