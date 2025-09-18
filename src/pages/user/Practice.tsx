import { useState, useEffect } from 'react'
import { Clock, ArrowLeft, Trophy, AlertCircle, BookOpen, Play, Info } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { evaluateAnswer } from '../../lib/evaluationEngine'
import { Question, Topic, Subtopic } from '../../types'

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
const TopicSelection = ({ onTopicSelect }: { onTopicSelect: (topic: Topic) => void }) => {
  const { topics, subtopics } = useData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            IPMA Level C Certification Practice
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select a topic to start your practice session. Each topic contains multiple subtopics with comprehensive questions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {topics.filter(topic => topic.isActive).map(topic => {
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
                        {topicSubtopics.length} subtopics
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {topic.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {topicSubtopics.length * 3} minutes
                    </div>
                    <div className="flex items-center text-primary-600 group-hover:text-primary-700">
                      <Play className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">Start</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Topic Details Component
const TopicDetails = ({ topic, onStartExam, onBack }: { 
  topic: Topic, 
  onStartExam: () => void, 
  onBack: () => void 
}) => {
  const { subtopics } = useData()
  
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
const Exam = ({ topic, onBack, onComplete }: { 
  topic: Topic, 
  onBack: () => void, 
  onComplete: (results: any) => void 
}) => {
  const { questions, subtopics, kpis } = useData()
  
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [examResults, setExamResults] = useState<any>(null)

  useEffect(() => {
    const topicSubtopics = subtopics.filter(s => s.topicId === topic.id && s.isActive)
    const randomQuestions = selectRandomQuestions(questions, topicSubtopics)
    
    console.log('Exam setup:', {
      topicId: topic.id,
      topicSubtopics: topicSubtopics.length,
      availableQuestions: questions.length,
      selectedQuestions: randomQuestions.length
    })
    
    setSelectedQuestions(randomQuestions)
    setTimeRemaining(randomQuestions.length * 3 * 60) // 3 minutes per question
  }, [topic.id, questions, subtopics])

  useEffect(() => {
    if (timeRemaining > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && !isSubmitted) {
      handleSubmit()
    }
  }, [timeRemaining, isSubmitted])

  const handleSubmit = async () => {
    if (isSubmitted) return
    
    setIsSubmitted(true)
    
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
    
    // Evaluate all answers
    const results = await Promise.all(
      selectedQuestions.map(async (question) => {
        try {
          const answer = answers[question.id] || ''
          const connectedKPIs = kpis.filter(kpi => question.connectedKPIs?.includes(kpi.id))
          const evaluation = await evaluateAnswer(answer, connectedKPIs.map(kpi => kpi.name))
          
          console.log('Question evaluation:', {
            questionId: question.id,
            answer: answer.substring(0, 50) + '...',
            connectedKPIs: connectedKPIs.length,
            evaluation
          })
          
          return {
            question,
            answer,
            ...evaluation
          }
        } catch (error) {
          console.error('Error evaluating question:', question.id, error)
          return {
            question,
            answer: answers[question.id] || '',
            toteutuneet_kpi: [],
            puuttuvat_kpi: [],
            pisteet: 0,
            sanallinen_arvio: 'Evaluation failed'
          }
        }
      })
    )
    
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
    onComplete(examResults)
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
              disabled={isSubmitted}
              className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              {isSubmitted ? 'Submitting...' : 'Submit Exam'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Practice Component
export const Practice = () => {
  const [currentView, setCurrentView] = useState<'topics' | 'details' | 'exam'>('topics')
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)

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
    // Results are handled in the Exam component
    // The Exam component will show results and provide navigation options
    console.log('Exam completed with results:', results)
  }

  if (currentView === 'topics') {
    return <TopicSelection onTopicSelect={handleTopicSelect} />
  }

  if (currentView === 'details' && selectedTopic) {
    return (
      <TopicDetails 
        topic={selectedTopic} 
        onStartExam={handleStartExam} 
        onBack={handleBackToTopics} 
      />
    )
  }

  if (currentView === 'exam' && selectedTopic) {
    return (
      <Exam 
        topic={selectedTopic} 
        onBack={handleBackToTopics} 
        onComplete={handleExamComplete} 
      />
    )
  }

  return null
}