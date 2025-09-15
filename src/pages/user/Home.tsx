import { Link } from 'react-router-dom'
import { Play, Clock, BarChart3 } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useData } from '../../contexts/DataContext'

export const UserHome = () => {
  const { t } = useLanguage()
  const { topics } = useData()

  // Mock recent attempts data
  const recentAttempts = [
    {
      id: '1',
      topic: 'Project Planning and Control',
      score: 3,
      date: '2024-01-15',
      duration: '12:30',
    },
    {
      id: '2',
      topic: 'Risk Management',
      score: 2,
      date: '2024-01-14',
      duration: '15:45',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('topics.title')}</h1>
          <p className="mt-2 text-gray-600">
            Choose a topic to start practicing and improve your IPMA Level C skills.
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
                <p className="text-sm font-medium text-gray-500">Total Practices</p>
                <p className="text-2xl font-semibold text-gray-900">12</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Time Spent</p>
                <p className="text-2xl font-semibold text-gray-900">3h 24m</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Score</p>
                <p className="text-2xl font-semibold text-gray-900">2.4/3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {topics.filter(topic => topic.isActive).map((topic) => (
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
                    Active
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  3 questions available
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/practice/${topic.id}`}
                    className="btn-primary flex items-center space-x-1"
                  >
                    <Play className="w-4 h-4" />
                    <span>Practice</span>
                  </Link>
                  <Link
                    to={`/exam-selection?topic=${topic.id}`}
                    className="btn-secondary flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Exam</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Attempts */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Practice Sessions</h2>
            <Link
              to="/app/history"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              View all
            </Link>
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
                      {attempt.score === 3 ? 'Excellent' : 
                       attempt.score === 2 ? 'Good' : 
                       attempt.score === 1 ? 'Needs Improvement' : 'Poor'}
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
    </div>
  )
}
