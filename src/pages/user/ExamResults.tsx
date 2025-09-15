import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import { Attempt, AttemptItem, ExamResult } from '../../types'

const ExamResults: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>()
  const navigate = useNavigate()
  const { getAttempt, getAttemptItems, questions, subtopics, topics } = useData()
  
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [results, setResults] = useState<ExamResult | null>(null)

  useEffect(() => {
    if (!attemptId) return

    const currentAttempt = getAttempt(attemptId)
    if (!currentAttempt) {
      navigate('/exam-selection')
      return
    }

    setAttempt(currentAttempt)

    // Calculate results
    const attemptItems = getAttemptItems(attemptId)
    const examResults = calculateExamResults(currentAttempt, attemptItems)
    setResults(examResults)
  }, [attemptId, getAttempt, getAttemptItems, navigate])

  const calculateExamResults = (attempt: Attempt, items: AttemptItem[]): ExamResult => {
    const totalQuestions = attempt.selectedQuestionIds.length
    let totalKpis = 0
    let kpisDetected = 0
    let kpisMissing = 0
    let totalScore = 0
    let maxScore = 0

    const questionResults: AttemptItem[] = []

    attempt.selectedQuestionIds.forEach(questionId => {
      const question = questions.find(q => q.id === questionId)
      const item = items.find(i => i.questionId === questionId)
      
      if (question && item) {
        const questionKPIs = question.connectedKPIs.length
        totalKpis += questionKPIs
        kpisDetected += item.kpisDetected.length
        kpisMissing += item.kpisMissing.length
        totalScore += item.score
        maxScore += item.maxScore
        
        questionResults.push(item)
      }
    })

    const kpiPercentage = totalKpis > 0 ? (kpisDetected / totalKpis) * 100 : 0
    const scorePercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0

    const passed = kpiPercentage >= 80 && scorePercentage >= 50

    return {
      attemptId: attempt.id,
      totalQuestions,
      totalKpis,
      kpisDetected,
      kpisMissing,
      totalScore,
      maxScore,
      kpiPercentage,
      scorePercentage,
      passed,
      feedback: passed 
        ? 'Congratulations! You have passed the exam.'
        : 'Unfortunately, you did not meet the passing criteria. Review the feedback and try again.',
      questionResults
    }
  }

  const getQuestionContext = (questionId: string) => {
    const question = questions.find(q => q.id === questionId)
    const subtopic = subtopics.find(s => s.id === question?.subtopicId)
    const topic = topics.find(t => t.id === subtopic?.topicId)
    return { question, subtopic, topic }
  }

  const handleRetakeExam = () => {
    if (attempt) {
      navigate(`/exam-selection?topic=${attempt.topicId}`)
    }
  }

  const handleBackToHome = () => {
    navigate('/user/home')
  }

  if (!attempt || !results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  const topic = topics.find(t => t.id === attempt.topicId)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Exam Results</h1>
            <p className="text-xl text-gray-600 mb-6">
              Topic: {topic?.title}
            </p>
            
            {/* Overall Result */}
            <div className={`inline-flex items-center px-6 py-3 rounded-full text-xl font-semibold ${
              results.passed 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {results.passed ? '✓ PASSED' : '✗ NOT PASSED'}
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {results.kpiPercentage.toFixed(1)}%
            </div>
            <div className="text-gray-600">KPIs Detected</div>
            <div className="text-sm text-gray-500">
              {results.kpisDetected} / {results.totalKpis} KPIs
            </div>
            <div className={`text-sm font-medium mt-2 ${
              results.kpiPercentage >= 80 ? 'text-green-600' : 'text-red-600'
            }`}>
              {results.kpiPercentage >= 80 ? '✓ Requirement Met' : '✗ Below 80%'}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {results.scorePercentage.toFixed(1)}%
            </div>
            <div className="text-gray-600">Score Achieved</div>
            <div className="text-sm text-gray-500">
              {results.totalScore} / {results.maxScore} points
            </div>
            <div className={`text-sm font-medium mt-2 ${
              results.scorePercentage >= 50 ? 'text-green-600' : 'text-red-600'
            }`}>
              {results.scorePercentage >= 50 ? '✓ Requirement Met' : '✗ Below 50%'}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {results.totalQuestions}
            </div>
            <div className="text-gray-600">Questions Answered</div>
            <div className="text-sm text-gray-500">
              {attempt.status === 'timeout' ? 'Auto-submitted' : 'Manually submitted'}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-gray-600 mb-2">
              {attempt.totalTime}
            </div>
            <div className="text-gray-600">Minutes Allocated</div>
            <div className="text-sm text-gray-500">
              {attempt.status === 'timeout' ? 'Time expired' : 'Completed on time'}
            </div>
          </div>
        </div>

        {/* Detailed Question Results */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Question-by-Question Feedback</h2>
          
          <div className="space-y-6">
            {results.questionResults.map((item, index) => {
              const { question, subtopic, topic } = getQuestionContext(item.questionId)
              
              if (!question) return null

              return (
                <div key={item.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          Question {index + 1}
                        </span>
                        <span className="text-sm text-gray-500">
                          {topic?.title} - {subtopic?.title}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {question.prompt}
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        item.score > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.score}/{item.maxScore}
                      </div>
                      <div className="text-sm text-gray-500">points</div>
                    </div>
                  </div>

                  {/* Answer */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Your Answer:</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">{item.answer || 'No answer provided'}</p>
                    </div>
                  </div>

                  {/* KPIs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">✓ KPIs Detected:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {item.kpisDetected.length > 0 ? (
                          item.kpisDetected.map((kpi, i) => (
                            <li key={i} className="text-green-600">{kpi}</li>
                          ))
                        ) : (
                          <li className="text-gray-500">None detected</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-700 mb-2">✗ KPIs Missing:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {item.kpisMissing.length > 0 ? (
                          item.kpisMissing.map((kpi, i) => (
                            <li key={i} className="text-red-600">{kpi}</li>
                          ))
                        ) : (
                          <li className="text-gray-500">All KPIs covered</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Feedback */}
                  {item.feedback && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">AI Feedback:</h4>
                      <p className="text-blue-800">{item.feedback}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleRetakeExam}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 font-medium"
          >
            Retake Exam
          </button>
          <button
            onClick={handleBackToHome}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-4 focus:ring-gray-200 font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExamResults
