import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import { Question, Attempt, AttemptItem } from '../../types'
import { evaluateAnswer } from '../../lib/evaluationEngine'

const Exam: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>()
  const navigate = useNavigate()
  const { 
    getAttempt, 
    updateAttempt, 
    getAttemptItems, 
    createAttemptItem, 
    updateAttemptItem,
    questions,
    subtopics,
    topics,
    kpis
  } = useData()

  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [examQuestions, setExamQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load attempt and questions
  useEffect(() => {
    if (!attemptId) return

    const currentAttempt = getAttempt(attemptId)
    if (!currentAttempt) {
      navigate('/exam-selection')
      return
    }

    setAttempt(currentAttempt)
    setTimeRemaining(currentAttempt.timeRemaining)

    // Load questions for this attempt
    const attemptQuestions = currentAttempt.selectedQuestionIds
      .map(id => questions.find(q => q.id === id))
      .filter((q): q is Question => q !== undefined)

    setExamQuestions(attemptQuestions)

    // Load existing answers
    const existingItems = getAttemptItems(attemptId)
    const existingAnswers: Record<string, string> = {}
    existingItems.forEach(item => {
      existingAnswers[item.questionId] = item.answer
    })
    setAnswers(existingAnswers)
  }, [attemptId, getAttempt, questions, getAttemptItems, navigate])

  // Timer countdown
  useEffect(() => {
    if (!attempt || attempt.status !== 'in_progress') return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - auto submit
          handleSubmitExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [attempt])

  // Auto-save answers
  const saveAnswer = useCallback((questionId: string, answer: string) => {
    if (!attemptId) return

    setAnswers(prev => ({ ...prev, [questionId]: answer }))

    // Save to attempt items
    const existingItems = getAttemptItems(attemptId)
    const existingItem = existingItems.find(item => item.questionId === questionId)

    if (existingItem) {
      updateAttemptItem(existingItem.id, { answer })
    } else {
      createAttemptItem(attemptId, questionId, answer)
    }
  }, [attemptId, getAttemptItems, updateAttemptItem, createAttemptItem])

  // Format time display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Get question context
  const getQuestionContext = (question: Question) => {
    const subtopic = subtopics.find(s => s.id === question.subtopicId)
    const topic = topics.find(t => t.id === subtopic?.topicId)
    const questionKPIs = kpis.filter(k => question.connectedKPIs.includes(k.id))

    return { subtopic, topic, questionKPIs }
  }

  // Submit exam
  const handleSubmitExam = async () => {
    if (!attempt || !attemptId) return

    setIsSubmitting(true)

    try {
      // Update attempt status
      updateAttempt(attempt.id, {
        status: 'completed',
        endTime: new Date().toISOString(),
        timeRemaining: 0
      })

      // Evaluate each answer
      const attemptItems = getAttemptItems(attemptId)
      const questionResults: AttemptItem[] = []

      for (const question of examQuestions) {
        const answer = answers[question.id] || ''
        const existingItem = attemptItems.find(item => item.questionId === question.id)

        if (answer.trim()) {
          // Evaluate the answer
          const evaluation = await evaluateAnswer(answer, question.connectedKPIs)
          
          const result: AttemptItem = existingItem ? {
            ...existingItem,
            answer,
            kpisDetected: evaluation.toteutuneet_kpi,
            kpisMissing: evaluation.puuttuvat_kpi,
            score: evaluation.pisteet,
            maxScore: 3, // Maximum score for this evaluation system
            feedback: evaluation.sanallinen_arvio,
            isEvaluated: true,
            updatedAt: new Date().toISOString()
          } : {
            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            attemptId,
            questionId: question.id,
            answer,
            kpisDetected: evaluation.toteutuneet_kpi,
            kpisMissing: evaluation.puuttuvat_kpi,
            score: evaluation.pisteet,
            maxScore: 3, // Maximum score for this evaluation system
            feedback: evaluation.sanallinen_arvio,
            isEvaluated: true,
            durationSec: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          if (existingItem) {
            updateAttemptItem(existingItem.id, result)
          } else {
            createAttemptItem(attemptId, question.id, answer)
          }

          questionResults.push(result)
        }
      }

      // Navigate to results
      navigate(`/exam-results/${attemptId}`)
    } catch (error) {
      console.error('Error submitting exam:', error)
      alert('Error submitting exam. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!attempt || !examQuestions.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">IPMA Certification Exam</h1>
              <p className="text-gray-600">
                Topic: {topics.find(t => t.id === attempt.topicId)?.title}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${
                timeRemaining < 300 ? 'text-red-600' : 'text-blue-600'
              }`}>
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-gray-500">
                3min × {examQuestions.length} questions
              </p>
              <p className="text-xs text-gray-400">
                {timeRemaining < 300 ? 'Time running out!' : 'Time remaining'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {examQuestions.map((question, index) => {
            const { subtopic, topic, questionKPIs } = getQuestionContext(question)
            
            return (
              <div key={question.id} className="bg-white rounded-lg shadow-lg p-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      Question {index + 1} of {examQuestions.length}
                    </span>
                    <span className="text-sm text-gray-500">
                      {topic?.title} - {subtopic?.title}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {question.prompt}
                  </h2>

                  {/* KPI Requirements */}
                  {questionKPIs.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <h3 className="font-medium text-yellow-900 mb-2">Key Points to Address:</h3>
                      <ul className="list-disc list-inside space-y-1 text-yellow-800">
                        {questionKPIs.map(kpi => (
                          <li key={kpi.id}>{kpi.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Answer:
                  </label>
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => saveAnswer(question.id, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={6}
                    placeholder="Answer with 3-5 sentences or bullet points..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Aim for 3-5 sentences or bullet points covering the key points above.
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Submit Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => handleSubmitExam()}
            disabled={isSubmitting}
            className={`px-8 py-4 rounded-lg text-xl font-semibold transition-colors ${
              isSubmitting
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 focus:ring-4 focus:ring-green-200'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Exam'}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            You can review and modify your answers before submitting
          </p>
        </div>
      </div>
    </div>
  )
}

export default Exam
