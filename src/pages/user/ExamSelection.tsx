import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'

const ExamSelection: React.FC = () => {
  const navigate = useNavigate()
  const { topics, subtopics, selectRandomQuestions, createAttempt } = useData()
  const [selectedTopicId, setSelectedTopicId] = useState<string>('')

  const handleStartExam = () => {
    if (!selectedTopicId) return

    try {
      // Select random questions (one per subtopic)
      const selectedQuestionIds = selectRandomQuestions(selectedTopicId)
      
      if (selectedQuestionIds.length === 0) {
        alert('No questions available for this topic. Please add questions first.')
        return
      }

      // Create attempt record
      const userId = 'current_user' // In a real app, this would come from auth
      const attempt = createAttempt(userId, selectedTopicId, selectedQuestionIds)
      
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Start IPMA Certification Exam</h1>
          
          {/* Exam Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Exam Instructions</h2>
            <div className="space-y-3 text-blue-800">
              <p><strong>Exam Structure:</strong> One question per subtopic within your selected topic</p>
              <p><strong>Time Allocation:</strong> 3 minutes per question (total: {examDuration} minutes)</p>
              <p><strong>Answer Format:</strong> Answer each question with 3–5 sentences or bullet points</p>
              <p><strong>Navigation:</strong> All questions are shown on one page - scroll to navigate</p>
              <p><strong>Auto-Submit:</strong> Exam automatically submits when time runs out</p>
            </div>
          </div>

          {/* Passing Criteria */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-green-900 mb-4">Passing Criteria</h2>
            <div className="space-y-2 text-green-800">
              <p>✓ <strong>80% of required KPIs</strong> must be detected in your answers</p>
              <p>✓ <strong>50% of total answer points</strong> must be achieved</p>
            </div>
          </div>

          {/* Topic Selection */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Select Topic for Exam</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose a topic:
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
                  <h4 className="font-medium text-gray-900">Subtopics in this exam:</h4>
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
                Start Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExamSelection
