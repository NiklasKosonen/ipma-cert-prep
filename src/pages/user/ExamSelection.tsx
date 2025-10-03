import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuthSupabase as useAuth } from '../../hooks/useAuthSupabase'

const ExamSelection: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { topics, subtopics, selectRandomQuestions, createAttempt } = useData()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [selectedTopicId, setSelectedTopicId] = useState<string>('')

  // Set initial topic from URL params
  useEffect(() => {
    const topicFromUrl = searchParams.get('topic')
    if (topicFromUrl) {
      setSelectedTopicId(topicFromUrl)
    }
  }, [searchParams])

  const handleStartExam = () => {
    if (!selectedTopicId) return
    if (!user) {
      alert('You must be logged in to start an exam.')
      return
    }

    try {
      // Select random questions (one per subtopic)
      const selectedQuestionIds = selectRandomQuestions(selectedTopicId)
      
      if (selectedQuestionIds.length === 0) {
        alert('No questions available for this topic. Please add questions first.')
        return
      }

      // Create attempt record
      const attempt = createAttempt(user.id, selectedTopicId, selectedQuestionIds)
      
      console.log('🚀 Starting exam:', {
        attemptId: attempt.id,
        topicId: selectedTopicId,
        questionCount: selectedQuestionIds.length,
        duration: attempt.totalTime
      })
      
      // Navigate to exam page
      navigate(`/exam/${attempt.id}`)
    } catch (error) {
      console.error('Error starting exam:', error)
      alert('Error starting exam. Please try again.')
    }
  }

  const selectedTopic = topics.find(t => t.id === selectedTopicId)
  const topicSubtopics = subtopics.filter(s => s.topicId === selectedTopicId && s.isActive)
  const examDuration = topicSubtopics.length * 3 // 3 minutes per subtopic

  const handleGoBack = () => {
    navigate('/app/home')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header with go back button */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleGoBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Takaisin</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{t('startExam')}</h1>
            <div></div> {/* Spacer for centering */}
          </div>
          
          {/* Exam Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">{t('examInstructions')}</h2>
            <div className="space-y-3 text-blue-800">
              <p><strong>{t('examStructure')}:</strong> Yksi kysymys per aliaihe valitusta aiheesta</p>
              <p><strong>{t('timeAllocation')}:</strong> 3 minuuttia kysymystä kohti (yhteensä: {examDuration} minuuttia)</p>
              <p><strong>{t('answerFormat')}:</strong> {t('answerInstructions')}</p>
              <p><strong>{t('navigation')}:</strong> Kaikki kysymykset näytetään yhdellä sivulla - selaa navigoidaksesi</p>
              <p><strong>{t('autoSubmit')}:</strong> Tentti lähetetään automaattisesti kun aika loppuu</p>
            </div>
          </div>

          {/* Passing Criteria */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-green-900 mb-4">{t('passingCriteria')}</h2>
            <div className="space-y-2 text-green-800">
              <p>✓ <strong>{t('kpisRequired')}</strong> on havaittava vastauksistasi</p>
              <p>✓ <strong>{t('totalPoints')}</strong> on saavutettava</p>
            </div>
          </div>

          {/* Topic Selection */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">{t('selectTopic')}</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
{t('chooseTopic')}:
              </label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              >
                <option value="">Select a topic...</option>
                {topics.filter(topic => topic.isActive).map((topic) => {
                  const topicSubtopics = subtopics.filter(s => s.topicId === topic.id && s.isActive)
                  const topicQuestions = topicSubtopics.length
                  return (
                    <option key={topic.id} value={topic.id}>
                      {topic.title} ({topicQuestions} subtopics - {topicQuestions * 3} minutes)
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Topic Preview */}
            {selectedTopic && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {selectedTopic.title}
                </h3>
                <p className="text-gray-600 mb-4">{selectedTopic.description}</p>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">{t('subtopicsInExam')}:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {topicSubtopics.map((subtopic) => (
                      <li key={subtopic.id}>{subtopic.title}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-4 p-4 bg-blue-100 rounded-lg">
                  <p className="text-blue-800">
                    <strong>Exam Duration:</strong> {examDuration} minutes ({topicSubtopics.length} questions × 3 minutes each)
                  </p>
                </div>
              </div>
            )}

            {/* Start Exam Button */}
            <div className="flex justify-center pt-6">
              <button
                onClick={handleStartExam}
                disabled={!selectedTopicId}
                className={`px-8 py-4 rounded-lg text-xl font-semibold transition-colors ${
                  selectedTopicId
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
{t('startExamButton')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExamSelection
