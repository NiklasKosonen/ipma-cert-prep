import { useState } from 'react'
import { Download, Calendar, Clock, BarChart3 } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'

export const UserHistory = () => {
  const { t } = useLanguage()
  const [filter, setFilter] = useState('all')

  // Mock history data
  const historyData = [
    {
      id: '1',
      topic: 'Project Planning and Control',
      date: '2024-01-15',
      time: '14:30',
      duration: '12:30',
      score: 3,
      totalQuestions: 3,
      correctAnswers: 3,
      feedback: 'Excellent work! You\'ve covered all the key areas: Project Charter, Work Breakdown Structure, Schedule Management.',
    },
    {
      id: '2',
      topic: 'Risk Management',
      date: '2024-01-14',
      time: '10:15',
      duration: '15:45',
      score: 2,
      totalQuestions: 3,
      correctAnswers: 2,
      feedback: 'Good effort! You\'ve addressed Risk Identification and Risk Mitigation. Consider also discussing risk assessment to strengthen your response.',
    },
    {
      id: '3',
      topic: 'Project Planning and Control',
      date: '2024-01-12',
      time: '16:20',
      duration: '18:20',
      score: 1,
      totalQuestions: 3,
      correctAnswers: 1,
      feedback: 'You\'ve made a start by mentioning Project Charter. To improve, try to incorporate Work Breakdown Structure and Schedule Management in your answer.',
    },
  ]

  const filteredData = filter === 'all' 
    ? historyData 
    : historyData.filter(item => 
        filter === 'excellent' ? item.score === 3 :
        filter === 'good' ? item.score === 2 :
        filter === 'needs-improvement' ? item.score === 1 :
        item.score === 0
      )

  const exportToCSV = () => {
    const headers = ['Date', 'Topic', 'Score', 'Duration', 'Feedback']
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        item.date,
        `"${item.topic}"`,
        item.score,
        item.duration,
        `"${item.feedback}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `practice-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getScoreColor = (score: number) => {
    switch (score) {
      case 3: return 'text-green-600 bg-green-100'
      case 2: return 'text-yellow-600 bg-yellow-100'
      case 1: return 'text-orange-600 bg-orange-100'
      default: return 'text-red-600 bg-red-100'
    }
  }

  const getScoreLabel = (score: number) => {
    switch (score) {
      case 3: return 'Excellent'
      case 2: return 'Good'
      case 1: return 'Needs Improvement'
      default: return 'Poor'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('history.title')}</h1>
          <p className="mt-2 text-gray-600">
            Track your practice sessions and monitor your progress over time.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Sessions</p>
                <p className="text-2xl font-semibold text-gray-900">{historyData.length}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Time</p>
                <p className="text-2xl font-semibold text-gray-900">46m 35s</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Score</p>
                <p className="text-2xl font-semibold text-gray-900">2.0/3</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Success Rate</p>
                <p className="text-2xl font-semibold text-gray-900">67%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Export */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <label className="text-sm font-medium text-gray-700">Filter by score:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field w-auto"
              >
                <option value="all">All Scores</option>
                <option value="excellent">Excellent (3)</option>
                <option value="good">Good (2)</option>
                <option value="needs-improvement">Needs Improvement (1)</option>
                <option value="poor">Poor (0)</option>
              </select>
            </div>
            
            <button
              onClick={exportToCSV}
              className="btn-outline flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('history.export')}
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {filteredData.map((item) => (
            <div key={item.id} className="card">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 mb-4 lg:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.topic}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(item.score)}`}>
                      {getScoreLabel(item.score)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {item.date} at {item.time}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {item.duration}
                    </div>
                    <div>
                      Score: {item.score}/3
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-sm">
                    {item.feedback}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {item.score}/3
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.correctAnswers}/{item.totalQuestions} correct
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="card text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No practice sessions found</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'Start practicing to see your history here.'
                : 'No sessions match the selected filter.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
