import { useState, useEffect } from 'react'
import { Clock, ArrowLeft, Trophy, AlertCircle, BookOpen, Play, Info } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuthSupabase } from '../../hooks/useAuthSupabase'
import { evaluateAnswer } from '../../lib/evaluationEngine'
import { Question, Topic, Subtopic, Attempt } from '../../types'

// Utility function to randomly select questions
const selectRandomQuestions = (questions: Question[], subtopics: Subtopic[]): Question[] => {
  const selectedQuestions: Question[] = []
  
  console.log('Selecting random questions:', {
    totalQuestions: questions.length,
    subtopics: subtopics.length,
    subtopicIds: subtopics.map(s => s.id)
  })
  
  // Group questions by subtopic
  const questionsBySubtopic = new Map<string, Question[]>()
  questions.forEach(question => {
    if (question.subtopicId && question.isActive) {
      if (!questionsBySubtopic.has(question.subtopicId)) {
        questionsBySubtopic.set(question.subtopicId, [])
      }
      questionsBySubtopic.get(question.subtopicId)!.push(question)
    }
  })
  
  console.log('Questions by subtopic:', Array.from(questionsBySubtopic.entries()).map(([id, qs]) => ({
    subtopicId: id,
    questionCount: qs.length
  })))
  
  // Select 1 random question from each subtopic
  subtopics.forEach(subtopic => {
    const subtopicQuestions = questionsBySubtopic.get(subtopic.id) || []
    if (subtopicQuestions.length > 0) {
      // Select 1 random question from this subtopic
      const randomIndex = Math.floor(Math.random() * subtopicQuestions.length)
      selectedQuestions.push(subtopicQuestions[randomIndex])
      console.log(`Selected question from subtopic ${subtopic.id}:`, subtopicQuestions[randomIndex].id)
    } else {
      console.warn(`No questions found for subtopic: ${subtopic.id} (${subtopic.title})`)
    }
  })
  
  console.log('Final selected questions:', selectedQuestions.length)
  return selectedQuestions
}

// Topic Selection Component
const TopicSelection = ({ onTopicSelect, topics, subtopics, loading, language }: { 
  onTopicSelect: (topic: Topic) => void,
  topics: Topic[],
  subtopics: Subtopic[],
  loading: boolean,
  language: 'fi' | 'en'
}) => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {language === 'fi' ? 'IPMA Level C -tutkinnon harjoittelu' : 'IPMA Level C Certification Practice'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === 'fi' 
              ? 'Valitse aihe aloittaaksesi harjoittelun. Jokainen aihe sisältää useita aliaiheita kattavilla kysymyksillä.'
              : 'Select a topic to start your practice session. Each topic contains multiple subtopics with comprehensive questions.'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">{language === 'fi' ? 'Ladataan aiheita...' : 'Loading topics...'}</p>
            </div>
          ) : (
            topics.filter(topic => topic.isActive).map(topic => {
            const topicSubtopics = subtopics.filter(s => s.topicId === topic.id && s.isActive)
            
            return (
              <div
                key={topic.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
                onClick={() => onTopicSelect(topic)}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                      <BookOpen className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {topic.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {topicSubtopics.length} {language === 'fi' ? 'aliaihetta' : 'subtopics'}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {topic.description || (language === 'fi' ? 'Ei kuvausta saatavilla' : 'No description available')}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {topicSubtopics.length * 3} {language === 'fi' ? 'minuuttia' : 'minutes'}
                    </div>
                    <div className="flex items-center text-primary-600 group-hover:text-primary-700">
                      <Play className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">{language === 'fi' ? 'Aloita' : 'Start'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
            })
          )}
        </div>
      </div>
    </div>
  )
}

// Topic Details Component
const TopicDetails = ({ topic, onStartExam, onBack, subtopics }: { 
  topic: Topic, 
  onStartExam: () => void, 
  onBack: () => void,
  subtopics: Subtopic[]
}) => {
  const topicSubtopics = subtopics.filter(s => s.topicId === topic.id && s.isActive)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Topics
            </button>
            
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mr-6">
                    <BookOpen className="w-8 h-8 text-primary-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{topic.title}</h1>
                    <p className="text-gray-600 text-lg">{topic.description || 'No description available'}</p>
                  </div>
                </div>
              </div>
              
              {/* Guidelines Section - Placeholder for user content */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Study Guidelines
                    </h3>
                    <p className="text-blue-800">
                      Guidelines and detailed information will be added here. This section will contain specific instructions, learning objectives, and preparation tips for this topic.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Subtopics */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Subtopics ({topicSubtopics.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topicSubtopics.map((subtopic, index) => (
                    <div key={subtopic.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{subtopic.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {subtopic.description || 'No description available'}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {index + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Exam Info */}
              <div className="bg-accent-50 border border-accent-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-accent-900 mb-3">
                  Exam Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-accent-600 mr-2" />
                    <span className="text-accent-800">
                      Duration: {topicSubtopics.length * 3} minutes
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Trophy className="w-4 h-4 text-accent-600 mr-2" />
                    <span className="text-accent-800">
                      Questions: {topicSubtopics.length}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-accent-600 mr-2" />
                    <span className="text-accent-800">
                      Pass Rate: 80%
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Start Button */}
              <div className="text-center">
                <button
                  onClick={onStartExam}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Play className="w-5 h-5 mr-2 inline" />
                  Start Exam
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Exam Component
const Exam = ({ topic, onBack, onComplete, questions, subtopics, kpis }: { 
  topic: Topic, 
  onBack: () => void, 
  onComplete: (results: any) => void,
  questions: Question[],
  subtopics: Subtopic[],
  kpis: any[]
}) => {
  const { createAttempt, createAttemptItem, updateAttempt } = useData()
  const { user } = useAuthSupabase()
  
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [examResults, setExamResults] = useState<any>(null)
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const setupExam = async () => {
      if (!user?.id) return
      
      const topicSubtopics = subtopics.filter(s => s.topicId === topic.id && s.isActive)
      const randomQuestions = selectRandomQuestions(questions, topicSubtopics)
      
      console.log('Practice exam setup:', {
        topicId: topic.id,
        topicSubtopics: topicSubtopics.length,
        availableQuestions: questions.length,
        selectedQuestions: randomQuestions.length
      })
      
      setSelectedQuestions(randomQuestions)
      setTimeRemaining(randomQuestions.length * 3 * 60) // 3 minutes per question
      
      // Create attempt record using the standard system
      try {
        const selectedQuestionIds = randomQuestions.map(q => q.id)
        const newAttempt = await createAttempt(user.id, topic.id, selectedQuestionIds)
        setAttempt(newAttempt)
        console.log('✅ Practice attempt created:', newAttempt.id)
      } catch (error) {
        console.error('❌ Error creating practice attempt:', error)
      }
    }
    
    setupExam()
  }, [topic.id, questions, subtopics, user?.id, createAttempt])

  useEffect(() => {
    if (timeRemaining > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && !isSubmitted) {
      handleSubmit()
    }
  }, [timeRemaining, isSubmitted])

  const handleSubmit = async () => {
    if (isSubmitted || isSaving || !attempt) return
    
    setIsSubmitted(true)
    setIsSaving(true)
    
    try {
      // Check if there are questions to evaluate
      if (selectedQuestions.length === 0) {
        const examResults = {
          totalScore: 0,
          maxScore: 0,
          percentage: 0,
          passed: false,
          results: [],
          timeSpent: 0
        }
        setExamResults(examResults)
        onComplete(examResults)
        return
      }
      
      // Update attempt status
      await updateAttempt(attempt.id, {
        status: 'completed',
        endTime: new Date().toISOString(),
        timeRemaining: 0
      })

      // Evaluate each answer and save attempt items
      const results = []
      for (const question of selectedQuestions) {
        const answer = answers[question.id] || ''
        
        if (answer.trim()) {
          // Get KPI names from IDs
          let kpiNames = question.connectedKPIs
            .map(kpiId => kpis.find(kpi => kpi.id === kpiId)?.name)
            .filter(Boolean) as string[]
          
          // Fallback: If no KPIs linked to question, get KPIs from subtopic
          if (kpiNames.length === 0 && question.subtopicId) {
            const subtopicKPIs = kpis.filter(kpi => kpi.subtopicId === question.subtopicId)
            kpiNames = subtopicKPIs.map(kpi => kpi.name)
          }
          
          // Evaluate the answer
          const evaluation = await evaluateAnswer(answer, kpiNames, 'fi') // Default to Finnish for practice
          
          // Create attempt item
          await createAttemptItem(attempt.id, question.id, answer, {
            kpisDetected: evaluation.toteutuneet_kpi,
            kpisMissing: evaluation.puuttuvat_kpi,
            score: evaluation.pisteet,
            feedback: evaluation.sanallinen_arvio
          })
          
          results.push({
            question,
            answer,
            ...evaluation
          })
        }
      }
      
      const totalScore = results.reduce((sum, result) => sum + (result.pisteet || 0), 0)
      const maxScore = results.length * 3
      const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
      const passed = percentage >= 80
      
      const examResults = {
        totalScore,
        maxScore,
        percentage,
        passed,
        results,
        timeSpent: (selectedQuestions.length * 3 * 60) - timeRemaining
      }
      
      setExamResults(examResults)
      console.log('✅ Practice exam results saved to standard attempt system')
      
      // Navigate to evaluation page
      onComplete(examResults)
      
    } catch (error) {
      console.error('❌ Error submitting practice exam:', error)
      alert('❌ Error submitting practice exam. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (examResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                  examResults.passed ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Trophy className={`w-10 h-10 ${
                    examResults.passed ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
                <h1 className={`text-3xl font-bold mb-2 ${
                  examResults.passed ? 'text-green-600' : 'text-red-600'
                }`}>
                  {examResults.passed ? 'Congratulations! You Passed!' : 'Try Again'}
                </h1>
                <p className="text-gray-600 text-lg">
                  Your Score: {examResults.percentage}% ({examResults.totalScore}/{examResults.maxScore})
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{examResults.percentage}%</div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-600">{Math.floor(examResults.timeSpent / 60)}:{(examResults.timeSpent % 60).toString().padStart(2, '0')}</div>
                  <div className="text-sm text-gray-600">Time Spent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{selectedQuestions.length}</div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Question Results</h2>
                {examResults.results.map((result: any, index: number) => (
                  <div key={result.question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">
                        Question {index + 1}
                      </h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.pisteet >= 2 ? 'bg-green-100 text-green-800' : 
                        result.pisteet >= 1 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.pisteet}/3
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{result.question.prompt}</p>
                    <div className="text-sm">
                      <p className="text-gray-600 mb-1">
                        <strong>Your Answer:</strong> {result.answer || 'No answer provided'}
                      </p>
                      <p className="text-green-600 mb-1">
                        <strong>Detected KPIs:</strong> {result.toteutuneet_kpi.join(', ') || 'None'}
                      </p>
                      <p className="text-red-600">
                        <strong>Missing KPIs:</strong> {result.puuttuvat_kpi.join(', ') || 'None'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={onBack}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back to Topics
                </button>
                <button
                  onClick={() => {
                    setExamResults(null)
                    setIsSubmitted(false)
                    setAnswers({})
                    setTimeRemaining(selectedQuestions.length * 3 * 60)
                  }}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Retake Exam
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No Questions Available
          </h2>
          <p className="text-gray-600 mb-4">
            There are no questions available for this topic yet. Please contact your administrator to add questions.
          </p>
          <div className="space-y-2 text-sm text-gray-500 mb-6">
            <p><strong>Debug Info:</strong></p>
            <p>Topic: {topic.title}</p>
            <p>Subtopics: {subtopics.filter(s => s.topicId === topic.id && s.isActive).length}</p>
            <p>Total Questions: {questions.length}</p>
            <p>Active Questions: {questions.filter(q => q.isActive).length}</p>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Topics
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Question 1 of {selectedQuestions.length}
                </div>
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(1 / selectedQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {selectedQuestions.map((question, index) => (
              <div key={question.id} className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Question {index + 1}
                </h3>
                <p className="text-gray-700 mb-6">{question.prompt}</p>
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Enter your answer here..."
                />
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="text-center mt-8">
            <button
              onClick={handleSubmit}
              disabled={isSubmitted || isSaving}
              className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              {isSaving ? 'Saving Results...' : isSubmitted ? 'Submitting...' : 'Submit Exam'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Evaluation Component
const Evaluation = ({ 
  results, 
  onBackToTopics 
}: { 
  results: any, 
  onBackToTopics: () => void 
}) => {
  const { evaluation } = results
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Exam Results</h1>
                <p className="text-primary-100">Your performance evaluation and feedback</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold mb-1">{results.percentage}%</div>
                <div className="text-primary-100 text-sm">
                  {results.passed ? 'PASSED' : 'NOT PASSED'}
                </div>
              </div>
            </div>
          </div>

          {/* Score Summary */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">{results.totalScore}</div>
                <div className="text-green-800 font-medium">Points Earned</div>
                <div className="text-green-600 text-sm">out of {results.maxScore}</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">{results.timeSpent}</div>
                <div className="text-blue-800 font-medium">Minutes Spent</div>
                <div className="text-blue-600 text-sm">exam duration</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">{results.results.length}</div>
                <div className="text-purple-800 font-medium">Questions</div>
                <div className="text-purple-600 text-sm">total answered</div>
              </div>
            </div>

            {/* Detailed Feedback */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Overall Feedback</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {evaluation.detailedFeedback}
                </p>
              </div>
            </div>

            {/* Strengths and Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-xl font-bold text-green-700 mb-4">Strengths</h3>
                <div className="space-y-2">
                  {evaluation.strengths.length > 0 ? (
                    evaluation.strengths.map((strength: string, index: number) => (
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
                  {evaluation.weaknesses.length > 0 ? (
                    evaluation.weaknesses.map((weakness: string, index: number) => (
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
                {evaluation.recommendations.map((recommendation: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Question-by-Question Results */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Question Details</h3>
              <div className="space-y-4">
                {results.results.map((result: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">
                        Question {index + 1}: {result.question.prompt.substring(0, 100)}...
                      </h4>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        (result.pisteet || 0) >= 2 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.pisteet || 0}/3 points
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Your answer:</strong> {result.answer.substring(0, 200)}...
                    </div>
                    <div className="text-sm text-gray-700">
                      <strong>Feedback:</strong> {result.sanallinen_arvio}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={onBackToTopics}
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Take Another Exam
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Practice Component
export const Practice = () => {
  const { topics, getTopicsByLanguage, getSubtopicsByLanguage, getQuestionsByLanguage, getKPIsByLanguage } = useData()
  const { language } = useLanguage()
  const [currentView, setCurrentView] = useState<'topics' | 'details' | 'exam' | 'evaluation'>('topics')
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [examResults, setExamResults] = useState<any>(null)
  
  // Language-specific data state
  const [currentTopics, setCurrentTopics] = useState(topics)
  const [currentSubtopics, setCurrentSubtopics] = useState<Subtopic[]>([])
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([])
  const [currentKPIs, setCurrentKPIs] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  
  // Load language-specific data when language changes
  useEffect(() => {
    const loadLanguageData = async () => {
      setDataLoading(true)
      try {
        const [topicsData, subtopicsData, questionsData, kpisData] = await Promise.all([
          getTopicsByLanguage(language),
          getSubtopicsByLanguage(language),
          getQuestionsByLanguage(language),
          getKPIsByLanguage(language)
        ])
        
        setCurrentTopics(topicsData)
        setCurrentSubtopics(subtopicsData)
        setCurrentQuestions(questionsData)
        setCurrentKPIs(kpisData)
        
        console.log(`✅ Loaded ${language} data for practice:`, {
          topics: topicsData.length,
          subtopics: subtopicsData.length,
          questions: questionsData.length,
          kpis: kpisData.length
        })
      } catch (error) {
        console.error(`❌ Error loading ${language} data for practice:`, error)
        setCurrentTopics([])
        setCurrentSubtopics([])
        setCurrentQuestions([])
        setCurrentKPIs([])
      } finally {
        setDataLoading(false)
      }
    }
    
    loadLanguageData()
  }, [language, getTopicsByLanguage, getSubtopicsByLanguage, getQuestionsByLanguage, getKPIsByLanguage])
  
  // Check if we have a topicId in the URL
  const urlParams = new URLSearchParams(window.location.search)
  const topicIdFromUrl = urlParams.get('topicId') || window.location.pathname.split('/').pop()
  
  // If we have a topicId, go directly to details view
  useEffect(() => {
    if (topicIdFromUrl && topicIdFromUrl !== 'practice') {
      const topic = currentTopics.find(t => t.id === topicIdFromUrl)
      if (topic) {
        setSelectedTopic(topic)
        setCurrentView('details')
      }
    }
  }, [topicIdFromUrl, currentTopics])

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic)
    setCurrentView('details')
  }

  const handleStartExam = () => {
    setCurrentView('exam')
  }

  const handleBackToTopics = () => {
    setSelectedTopic(null)
    setCurrentView('topics')
  }

  const handleExamComplete = (results: any) => {
    console.log('Exam completed with results:', results)
    
    // Navigate to evaluation page
    setCurrentView('evaluation')
    setExamResults(results)
  }

  if (currentView === 'topics') {
    return <TopicSelection 
      onTopicSelect={handleTopicSelect} 
      topics={currentTopics}
      subtopics={currentSubtopics}
      loading={dataLoading}
      language={language}
    />
  }

  if (currentView === 'details' && selectedTopic) {
    return (
      <TopicDetails 
        topic={selectedTopic} 
        onStartExam={handleStartExam} 
        onBack={handleBackToTopics}
        subtopics={currentSubtopics}
      />
    )
  }

  if (currentView === 'exam' && selectedTopic) {
    return (
      <Exam 
        topic={selectedTopic} 
        onBack={handleBackToTopics} 
        onComplete={handleExamComplete}
        questions={currentQuestions}
        subtopics={currentSubtopics}
        kpis={currentKPIs}
      />
    )
  }

  if (currentView === 'evaluation' && examResults) {
    return (
      <Evaluation 
        results={examResults} 
        onBackToTopics={handleBackToTopics} 
      />
    )
  }

  return null
}