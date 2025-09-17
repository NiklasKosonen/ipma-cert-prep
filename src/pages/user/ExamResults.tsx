import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import { Attempt, AttemptItem } from '../../types'
import { CheckCircle, XCircle, AlertCircle, ArrowLeft, Target } from 'lucide-react'

const ExamResults: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>()
  const navigate = useNavigate()
  const { 
    getAttempt, 
    getAttemptItems, 
    questions,
    subtopics,
    topics,
    kpis
  } = useData()

  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [attemptItems, setAttemptItems] = useState<AttemptItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!attemptId) {
      navigate('/app/home')
      return
    }

    const currentAttempt = getAttempt(attemptId)
    if (!currentAttempt) {
      navigate('/app/home')
      return
    }

    setAttempt(currentAttempt)
    setAttemptItems(getAttemptItems(attemptId))
    setLoading(false)
  }, [attemptId, getAttempt, getAttemptItems, navigate])

  if (loading || !attempt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  // Calculate overall score
  const totalScore = attemptItems.reduce((sum, item) => sum + (item.score || 0), 0)
  const maxScore = attemptItems.length * 3
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0
  const passed = percentage >= 50

  // Get question context
  const getQuestionContext = (questionId: string) => {
    const question = questions.find(q => q.id === questionId)
    const subtopic = subtopics.find(s => s.id === question?.subtopicId)
    const topic = topics.find(t => t.id === subtopic?.topicId)
    const questionKPIs = kpis.filter(k => question?.connectedKPIs.includes(k.id))

    return { question, subtopic, topic, questionKPIs }
  }

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 2.5) return 'text-green-600 bg-green-100'
    if (score >= 2.0) return 'text-yellow-600 bg-yellow-100'
    if (score >= 1.0) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  // Get overall result color
  const getOverallResultColor = () => {
    if (passed) return 'text-green-600 bg-green-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/app/home')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-gray-900">Exam Results</h1>
              <p className="text-gray-600">
                {topics.find(t => t.id === attempt.topicId)?.title}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Overall Results */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {passed ? (
                <CheckCircle className="h-16 w-16 text-green-600" />
              ) : (
                <XCircle className="h-16 w-16 text-red-600" />
              )}
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {passed ? 'Congratulations!' : 'Keep Learning!'}
            </h2>
            
            <p className="text-xl text-gray-600 mb-6">
              {passed ? 'You passed the exam!' : 'You need to improve your score.'}
            </p>

            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${getOverallResultColor()}`}>
                  {totalScore}/{maxScore}
                </div>
                <p className="text-sm text-gray-600 mt-2">Total Score</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {percentage.toFixed(0)}%
                </div>
                <p className="text-sm text-gray-600 mt-2">Percentage</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {attemptItems.length}
                </div>
                <p className="text-sm text-gray-600 mt-2">Questions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Question Results */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <Target className="h-6 w-6 mr-2 text-blue-600" />
            Question-by-Question Results
          </h3>
          
          {attemptItems.map((item, index) => {
            const { question, subtopic, topic } = getQuestionContext(item.questionId)
            
            return (
              <div key={item.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        Question {index + 1}
                      </span>
                      <span className="text-sm text-gray-500">
                        {topic?.title} - {subtopic?.title}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      {question?.prompt}
                    </h4>
                  </div>
                  
                  <div className={`px-4 py-2 rounded-full text-lg font-bold ${getScoreColor(item.score || 0)}`}>
                    {item.score || 0}/3
                  </div>
                </div>

                {/* Your Answer */}
                <div className="mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">Your Answer:</h5>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800">{item.answer}</p>
                  </div>
                </div>

                {/* KPI Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-medium text-green-900 mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Detected KPIs
                    </h5>
                    {item.kpisDetected && item.kpisDetected.length > 0 ? (
                      <ul className="space-y-1">
                        {item.kpisDetected.map(kpiId => {
                          const kpi = kpis.find(k => k.id === kpiId)
                          return kpi ? (
                            <li key={kpiId} className="text-sm text-green-800">✓ {kpi.name}</li>
                          ) : null
                        })}
                      </ul>
                    ) : (
                      <p className="text-sm text-green-800">No KPIs detected</p>
                    )}
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h5 className="font-medium text-red-900 mb-2 flex items-center">
                      <XCircle className="h-4 w-4 mr-2" />
                      Missing KPIs
                    </h5>
                    {item.kpisMissing && item.kpisMissing.length > 0 ? (
                      <ul className="space-y-1">
                        {item.kpisMissing.map(kpiId => {
                          const kpi = kpis.find(k => k.id === kpiId)
                          return kpi ? (
                            <li key={kpiId} className="text-sm text-red-800">✗ {kpi.name}</li>
                          ) : null
                        })}
                      </ul>
                    ) : (
                      <p className="text-sm text-red-800">All KPIs covered!</p>
                    )}
                  </div>
                </div>

                {/* AI Feedback */}
                {item.feedback && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-900 mb-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      AI Feedback
                    </h5>
                    <p className="text-sm text-blue-800">{item.feedback}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/app/home')}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExamResults