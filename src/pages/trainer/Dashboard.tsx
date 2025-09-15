import { useState } from 'react'
import { Search, Download, Eye, Calendar, Users, BarChart3 } from 'lucide-react'
import { mockCompanyCodes } from '../../lib/mockData'

export const TrainerDashboard = () => {
  // const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('all')
  const [selectedTopic, setSelectedTopic] = useState('all')
  // const [dateRange, setDateRange] = useState('all')

  // Mock learner results data
  const learnerResults = [
    {
      id: '1',
      learnerName: 'John Doe',
      email: 'john.doe@techsolutions.com',
      companyCode: 'TECH002',
      companyName: 'Tech Solutions Ltd',
      topic: 'Project Planning and Control',
      question: 'Describe the key components of a project charter...',
      answer: 'A project charter should include clear objectives, scope definition, success criteria, and stakeholder identification...',
      detectedKPIs: ['Project Charter', 'Work Breakdown Structure'],
      missingKPIs: ['Schedule Management'],
      score: 2,
      feedback: 'Good effort! You\'ve addressed Project Charter and Work Breakdown Structure. Consider also discussing Schedule Management to strengthen your response.',
      submittedAt: '2024-01-15T14:30:00Z',
      duration: '12:30',
    },
    {
      id: '2',
      learnerName: 'Jane Smith',
      email: 'jane.smith@acme.com',
      companyCode: 'ACME001',
      companyName: 'Acme Corporation',
      topic: 'Risk Management',
      question: 'Outline a comprehensive risk management process...',
      answer: 'The risk management process should include identification, assessment, mitigation planning, and monitoring...',
      detectedKPIs: ['Risk Identification', 'Risk Mitigation'],
      missingKPIs: [],
      score: 3,
      feedback: 'Excellent work! You\'ve covered all the key areas: Risk Identification, Risk Mitigation. Your answer demonstrates comprehensive understanding of the topic.',
      submittedAt: '2024-01-15T10:15:00Z',
      duration: '15:45',
    },
    {
      id: '3',
      learnerName: 'Mike Johnson',
      email: 'mike.johnson@techsolutions.com',
      companyCode: 'TECH002',
      companyName: 'Tech Solutions Ltd',
      topic: 'Project Planning and Control',
      question: 'Explain the difference between Gantt charts and PERT diagrams...',
      answer: 'Gantt charts show tasks over time while PERT diagrams show dependencies...',
      detectedKPIs: ['Schedule Management'],
      missingKPIs: ['Project Charter', 'Work Breakdown Structure'],
      score: 1,
      feedback: 'You\'ve made a start by mentioning Schedule Management. To improve, try to incorporate Project Charter and Work Breakdown Structure in your answer.',
      submittedAt: '2024-01-14T16:20:00Z',
      duration: '18:20',
    },
  ]

  const filteredResults = learnerResults.filter(result => {
    const matchesSearch = result.learnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.topic.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCompany = selectedCompany === 'all' || result.companyCode === selectedCompany
    const matchesTopic = selectedTopic === 'all' || result.topic === selectedTopic
    
    return matchesSearch && matchesCompany && matchesTopic
  })

  const exportToCSV = () => {
    const headers = [
      'Learner Name', 'Email', 'Company', 'Topic', 'Score', 'Detected KPIs', 
      'Missing KPIs', 'Submitted At', 'Duration', 'Feedback'
    ]
    
    const csvContent = [
      headers.join(','),
      ...filteredResults.map(result => [
        `"${result.learnerName}"`,
        `"${result.email}"`,
        `"${result.companyName}"`,
        `"${result.topic}"`,
        result.score,
        `"${result.detectedKPIs.join('; ')}"`,
        `"${result.missingKPIs.join('; ')}"`,
        result.submittedAt,
        result.duration,
        `"${result.feedback}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `learner-results-${new Date().toISOString().split('T')[0]}.csv`
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Coach Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Monitor learner progress and provide guidance for IPMA Level C certification preparation.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Learners</p>
                <p className="text-2xl font-semibold text-gray-900">24</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Sessions</p>
                <p className="text-2xl font-semibold text-gray-900">8</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">This Week</p>
                <p className="text-2xl font-semibold text-gray-900">12</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Score</p>
                <p className="text-2xl font-semibold text-gray-900">2.1/3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search learners, topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 input-field w-64"
                />
              </div>
              
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="input-field w-48"
              >
                <option value="all">All Companies</option>
                {mockCompanyCodes.map(company => (
                  <option key={company.id} value={company.code}>
                    {company.companyName}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="input-field w-48"
              >
                <option value="all">All Topics</option>
                <option value="Project Planning and Control">Project Planning and Control</option>
                <option value="Risk Management">Risk Management</option>
              </select>
            </div>
            
            <button
              onClick={exportToCSV}
              className="btn-outline flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Learner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Topic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KPIs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {result.learnerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {result.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{result.companyName}</div>
                      <div className="text-sm text-gray-500">{result.companyCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{result.topic}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(result.score)}`}>
                        {result.score}/3 - {getScoreLabel(result.score)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="text-green-600">
                          ✓ {result.detectedKPIs.length} detected
                        </div>
                        {result.missingKPIs.length > 0 && (
                          <div className="text-orange-600">
                            ○ {result.missingKPIs.length} missing
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(result.submittedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredResults.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500">
                Try adjusting your filters to see learner results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
