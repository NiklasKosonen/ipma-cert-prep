import React, { useState, useEffect } from 'react'
import { Users, Trophy, TrendingUp, Calendar, Eye, Download, Search } from 'lucide-react'
import { UserDataService, ExamResult } from '../../services/userDataService'
import { useData } from '../../contexts/DataContext'

interface TrainerStats {
  totalUsers: number
  totalExams: number
  averageScore: number
  passedExams: number
  activeUsers: number
}

interface UserWithResults {
  id: string
  email: string
  name: string
  companyCode: string
  companyName: string
  examResults: ExamResult[]
  lastActivity: string
  totalExams: number
  averageScore: number
}

const TrainerDashboard: React.FC = () => {
  const { topics } = useData()
  const [user, setUser] = useState<any>(null)
  const [usersWithResults, setUsersWithResults] = useState<UserWithResults[]>([])
  const [stats, setStats] = useState<TrainerStats>({
    totalUsers: 0,
    totalExams: 0,
    averageScore: 0,
    passedExams: 0,
    activeUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserWithResults | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPassed, setFilterPassed] = useState<'all' | 'passed' | 'failed'>('all')

  useEffect(() => {
    loadTrainerData()
  }, [])

  const loadTrainerData = async () => {
    try {
      setLoading(true)
      const userDataService = UserDataService.getInstance()
      
      // Get current user
      const currentUser = await userDataService.getCurrentUser()
      if (!currentUser || (currentUser.role !== 'trainer' && currentUser.role !== 'admin')) {
        // Redirect to login if not trainer/admin
        window.location.href = '/login'
        return
      }
      
      setUser(currentUser)
      
      // Get all exam results (trainers can see company data)
      const results = await userDataService.getAllExamResults()
      
      // Group results by user
      const userMap = new Map<string, UserWithResults>()
      
      results.forEach(result => {
        const userId = result.userId
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            id: userId,
            email: result.users?.email || 'Unknown',
            name: result.users?.name || 'Unknown User',
            companyCode: result.users?.company_code || 'Unknown',
            companyName: result.users?.company_name || 'Unknown Company',
            examResults: [],
            lastActivity: result.completedAt,
            totalExams: 0,
            averageScore: 0
          })
        }
        
        const userData = userMap.get(userId)!
        userData.examResults.push(result)
        userData.totalExams++
        userData.averageScore = Math.round(
          userData.examResults.reduce((sum, r) => sum + r.score, 0) / userData.examResults.length
        )
        
        // Update last activity if this result is more recent
        if (new Date(result.completedAt) > new Date(userData.lastActivity)) {
          userData.lastActivity = result.completedAt
        }
      })
      
      const users = Array.from(userMap.values())
      setUsersWithResults(users)
      
      // Calculate stats
      const dashboardStats: TrainerStats = {
        totalUsers: users.length,
        totalExams: results.length,
        averageScore: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length) : 0,
        passedExams: results.filter(r => r.score >= 80).length,
        activeUsers: users.filter(u => {
          const lastActivity = new Date(u.lastActivity)
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          return lastActivity > thirtyDaysAgo
        }).length
      }
      
      setStats(dashboardStats)
    } catch (error) {
      console.error('Error loading trainer data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewUserDetails = (userData: UserWithResults) => {
    setSelectedUser(userData)
    setShowUserDetails(true)
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

  const filteredUsers = usersWithResults.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesFilter = true
    if (filterPassed === 'passed') {
      matchesFilter = user.averageScore >= 80
    } else if (filterPassed === 'failed') {
      matchesFilter = user.averageScore < 80
    }
    
    return matchesSearch && matchesFilter
  })

  const exportData = () => {
    const csvData = usersWithResults.map(user => ({
      'Name': user.name,
      'Email': user.email,
      'Company': user.companyName,
      'Total Exams': user.totalExams,
      'Average Score': user.averageScore,
      'Last Activity': formatDate(user.lastActivity)
    }))
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `company-exam-results-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trainer dashboard...</p>
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
              <Users className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Trainer Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name || 'Trainer'}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportData}
                className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </button>
              <button
                onClick={() => window.location.href = '/admin'}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Admin Console
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Trophy className="h-6 w-6 text-purple-600" />
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
              <div className="p-2 bg-orange-100 rounded-lg">
                <Trophy className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Passed Exams</p>
                <p className="text-2xl font-bold text-gray-900">{stats.passedExams}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Calendar className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Company Users</h2>
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                {/* Filter */}
                <select
                  value={filterPassed}
                  onChange={(e) => setFilterPassed(e.target.value as 'all' | 'passed' | 'failed')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Users</option>
                  <option value="passed">Passed (≥80%)</option>
                  <option value="failed">Failed (&lt;80%)</option>
                </select>
              </div>
            </div>
          </div>
          
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">No users match your search criteria.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredUsers.map((userData) => (
                <div key={userData.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{userData.name}</h3>
                        <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(userData.averageScore)}`}>
                          {userData.averageScore >= 80 ? 'PASSING' : 'NEEDS IMPROVEMENT'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                          {userData.email}
                        </div>
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {userData.companyName}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Last active: {formatDate(userData.lastActivity)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{userData.averageScore}%</div>
                        <div className="text-sm text-gray-600">Average Score</div>
                        <div className="text-sm text-gray-600">{userData.totalExams} exams</div>
                      </div>
                      <button
                        onClick={() => handleViewUserDetails(userData)}
                        className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name} - Exam History</h2>
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Company</p>
                    <p className="text-gray-900">{selectedUser.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Exams</p>
                    <p className="text-gray-900">{selectedUser.totalExams}</p>
                  </div>
                </div>
              </div>

              {/* Exam Results */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Exam Results</h3>
                {selectedUser.examResults.map((result) => {
                  const topic = topics.find(t => t.id === result.attemptId.split('_')[1])
                  return (
                    <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">
                          {topic?.title || 'Exam'} - {formatDate(result.completedAt)}
                        </h4>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(result.score)}`}>
                          {result.score}%
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Score: {result.correctAnswers}/{result.totalQuestions} correct</p>
                        <p>Time spent: {formatDuration(result.timeSpent)}</p>
                        <p>Status: {result.score >= 80 ? 'PASSED' : 'NOT PASSED'}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TrainerDashboard
