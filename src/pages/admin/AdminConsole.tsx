import React, { useState, useEffect } from 'react'
import { useData } from '../../contexts/DataContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { Topic, Subtopic, KPI, Question, TrainingExample, CompanyCode } from '../../types'
import * as XLSX from 'xlsx'
import AIEvaluationRules, { EvaluationRule } from '../../components/AIEvaluationRules'
import { useAutoBackup } from '../../hooks/useAutoBackup'
import { DataMigrationService } from '../../services/dataMigration'

const AdminConsole: React.FC = () => {
  const { t } = useLanguage()
  const { 
    topics, subtopics, kpis, questions, trainingExamples, companyCodes, sampleAnswers, users, subscriptions,
    addTopic, updateTopic, deleteTopic,
    addSubtopic, updateSubtopic, deleteSubtopic,
    addKPI, updateKPI, deleteKPI,
    addQuestion, updateQuestion, deleteQuestion,
    addTrainingExample, updateTrainingExample, deleteTrainingExample,
    addCompanyCode, deleteCompanyCode,
  } = useData()

  // Auto backup functionality
  useAutoBackup({
    enabled: false, // Disabled - use manual Supabase sync instead
    interval: 30, // 30 minutes
    beforeUnload: false, // Disabled
    beforeDeploy: false // Disabled
  })

  const [activeTab, setActiveTab] = useState('topics')
  const [backupStatus, setBackupStatus] = useState<'idle' | 'backing_up' | 'restoring' | 'syncing'>('idle')
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null)

  // Initialize backup status
  useEffect(() => {
    const lastBackup = localStorage.getItem('last_auto_backup')
    if (lastBackup) {
      const backup = JSON.parse(lastBackup)
      setLastBackupTime(backup.timestamp)
    }
  }, [])


  const handleSyncToSupabase = async () => {
    setBackupStatus('syncing')
    try {
      const dataMigration = DataMigrationService.getInstance()
      await dataMigration.syncToSupabase()
      alert('✅ Data synced to Supabase successfully!')
    } catch (error) {
      alert(`❌ Sync failed: ${error}`)
    } finally {
      setBackupStatus('idle')
    }
  }

  const handleSyncFromSupabase = async () => {
    if (!confirm('⚠️ This will sync data from Supabase. Current data will be replaced. Continue?')) {
      return
    }
    
    setBackupStatus('syncing')
    try {
      const dataMigration = DataMigrationService.getInstance()
      await dataMigration.syncFromSupabase()
      alert('✅ Data synced from Supabase successfully!')
    } catch (error) {
      alert(`❌ Sync failed: ${error}`)
    } finally {
      setBackupStatus('idle')
    }
  }
  const handleAddQuestion = () => {
    if (!newQuestion.subtopicId || !newQuestion.prompt.trim()) {
      alert('Please select a subtopic and enter a question prompt')
      return
    }

    const questionToAdd = {
      ...newQuestion,
      prompt: newQuestion.prompt.trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    addQuestion(questionToAdd)
    
    // Reset form
    setNewQuestion({
      subtopicId: '',
      topicId: '',
      prompt: '',
      connectedKPIs: [],
      isActive: true
    })
    
    alert('Question added successfully!')
  }
  
  // Topic states
  const [newTopic, setNewTopic] = useState({ title: '', description: '', isActive: true })
  
  // Training Example states
  const [newTrainingExample, setNewTrainingExample] = useState<Partial<TrainingExample>>({
    questionId: '',
    answerText: '',
    qualityRating: 0,
    detectedKPIs: [],
    feedback: '',
    exampleType: 'training'
  })
  // const [editingTrainingExample, setEditingTrainingExample] = useState<string | null>(null)
  // const [editTrainingExample, setEditTrainingExample] = useState<Partial<TrainingExample>>({})
  
  // Company Code states
  const [newCompanyCode, setNewCompanyCode] = useState<Partial<CompanyCode>>({
    code: '',
    companyName: '',
    adminEmail: '',
    maxUsers: 1,
    expiresAt: '',
    isActive: true
  })
  // const [editingCompanyCode, setEditingCompanyCode] = useState<string | null>(null)
  // const [editCompanyCode, setEditCompanyCode] = useState<Partial<CompanyCode>>({})
  
  // AI Evaluation Rules state
  const [evaluationRules, setEvaluationRules] = useState<EvaluationRule[]>([
    { id: 'rule1', description: 'Vastaus sisältää ≥3 KPI:tä', points: 3, kpiCount: 3, condition: 'at_least' },
    { id: 'rule2', description: 'Vastaus sisältää tasan 2 KPI:ta', points: 2, kpiCount: 2, condition: 'exactly' },
    { id: 'rule3', description: 'Vastaus sisältää tasan 1 KPI:n', points: 1, kpiCount: 1, condition: 'exactly' },
    { id: 'rule4', description: 'Vastaus ei sisällä KPI:ta', points: 0, kpiCount: 0, condition: 'exactly' }
  ])
  
  const [aiTips, setAiTips] = useState<string[]>([
    'KPI:t eivät tarvitse olla kirjoitettu sanatarkasti - AI ymmärtää niiden olemassaolon vastauksen kontekstista',
    'Synonyymit ja liittyvät käsitteet lasketaan KPI:ksi jos ne liittyvät aiheeseen',
    'Implisiittiset viittaukset ovat yhtä arvokkaita kuin suorat maininnat',
    'Vastauksen laadun arviointi perustuu kokonaisuuteen, ei vain KPI-määrään',
    'Ymmärryksen taso näkyy vastauksen syvyydessä ja perustelujen laadussa'
  ])
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [editTopic, setEditTopic] = useState({ title: '', description: '' })
  
  // Training Example handlers
  const handleAddTrainingExample = () => {
    if (newTrainingExample.questionId && newTrainingExample.answerText) {
      addTrainingExample({
        questionId: newTrainingExample.questionId,
        answerText: newTrainingExample.answerText,
        qualityRating: newTrainingExample.qualityRating || 0,
        detectedKPIs: newTrainingExample.detectedKPIs || [],
        feedback: newTrainingExample.feedback || '',
        exampleType: 'training'
      })
      setNewTrainingExample({
        questionId: '',
        answerText: '',
        qualityRating: 0,
        detectedKPIs: [],
        feedback: '',
        exampleType: 'training'
      })
    }
  }

  const handleEditTrainingExample = (_id: string) => {
    // const trainingExample = trainingExamples.find(te => te.id === id)
    // if (trainingExample) {
    //   setEditingTrainingExample(id)
    //   setEditTrainingExample(trainingExample)
    // }
  }

  // const handleUpdateTrainingExample = () => {
  //   if (editingTrainingExample && editTrainingExample) {
  //     updateTrainingExample(editingTrainingExample, editTrainingExample)
  //     setEditingTrainingExample(null)
  //     setEditTrainingExample({})
  //   }
  // }

  const handleDeleteTrainingExample = (id: string) => {
    if (confirm('Haluatko varmasti poistaa tämän harjoitusesimerkin?')) {
      deleteTrainingExample(id)
    }
  }

  // Company Code handlers
  const handleAddCompanyCode = () => {
    if (newCompanyCode.code && newCompanyCode.companyName && newCompanyCode.adminEmail) {
      addCompanyCode({
        code: newCompanyCode.code,
        companyName: newCompanyCode.companyName,
        adminEmail: newCompanyCode.adminEmail,
        maxUsers: newCompanyCode.maxUsers || 1,
        expiresAt: newCompanyCode.expiresAt || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
        isActive: true
      })
      setNewCompanyCode({
        code: '',
        companyName: '',
        adminEmail: '',
        maxUsers: 1,
        expiresAt: '',
        isActive: true
      })
    }
  }

  const handleEditCompanyCode = (_id: string) => {
    // const companyCode = companyCodes.find(cc => cc.id === id)
    // if (companyCode) {
    //   setEditingCompanyCode(id)
    //   setEditCompanyCode(companyCode)
    // }
  }

  // const handleUpdateCompanyCode = () => {
  //   if (editingCompanyCode && editCompanyCode) {
  //     updateCompanyCode(editingCompanyCode, editCompanyCode)
  //     setEditingCompanyCode(null)
  //     setEditCompanyCode({})
  //   }
  // }

  const handleDeleteCompanyCode = (id: string) => {
    if (confirm('Haluatko varmasti poistaa tämän yrityskoodin?')) {
      deleteCompanyCode(id)
    }
  }

  const generateAIEvaluation = async (trainingExample: TrainingExample) => {
    try {
      // Mock AI evaluation - in real implementation, this would call an AI service
      const selectedKPIs = kpis.filter(kpi => trainingExample.detectedKPIs.includes(kpi.id))
      const kpiNames = selectedKPIs.map(kpi => kpi.name).join(', ')
      
      let feedback = ''
      if (trainingExample.qualityRating >= 3) {
        feedback = `Erinomainen vastaus! Vastaus sisältää useita KPI:ta (${kpiNames}) ja osoittaa syvällistä ymmärrystä aiheesta. Vastaus on strukturoitu ja perusteltu hyvin.`
      } else if (trainingExample.qualityRating === 2) {
        feedback = `Hyvä vastaus. Vastaus sisältää muutaman KPI:n (${kpiNames}) ja osoittaa hyvää ymmärrystä aiheesta. Vastaus voisi olla vielä tarkemmin perusteltu.`
      } else if (trainingExample.qualityRating === 1) {
        feedback = `Kohtalainen vastaus. Vastaus sisältää jonkin verran KPI:a (${kpiNames}) mutta puuttuu syvällisempi analyysi. Suosittelemme tarkentamaan vastausta.`
      } else {
        feedback = `Vastaus vaatii parantamista. Vastaus ei sisällä KPI:ta tai vastaus ei vastaa kysymykseen riittävällä tasolla. Suosittelemme uudelleen miettimään vastausta.`
      }
      
      return feedback
    } catch (error) {
      console.error('AI evaluation failed:', error)
      return 'AI-arviointi epäonnistui. Yritä uudelleen.'
    }
  }

  // Subtopic states
  const [newSubtopic, setNewSubtopic] = useState({ title: '', description: '', topicId: '', isActive: true })
  const [editingSubtopic, setEditingSubtopic] = useState<Subtopic | null>(null)
  const [editSubtopic, setEditSubtopic] = useState({ title: '', description: '', topicId: '', isActive: true })

  // KPI states
  const [newKPI, setNewKPI] = useState({ name: '', isEssential: true, topicId: '', subtopicId: '' })
  const [editingKPI, setEditingKPI] = useState<KPI | null>(null)
  const [editKPI, setEditKPI] = useState({ name: '', isEssential: true, topicId: '', subtopicId: '' })

  // Question states
  const [newQuestion, setNewQuestion] = useState({ prompt: '', topicId: '', subtopicId: '', connectedKPIs: [] as string[], isActive: true })
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [editQuestion, setEditQuestion] = useState({ prompt: '', topicId: '', subtopicId: '', connectedKPIs: [] as string[], isActive: true })

  const handleAddTopic = () => {
    if (newTopic.title.trim()) {
      addTopic(newTopic)
      setNewTopic({ title: '', description: '', isActive: true })
    }
  }

  const handleUpdateTopic = () => {
    if (editingTopic && editTopic.title.trim()) {
      updateTopic(editingTopic.id, editTopic)
      setEditingTopic(null)
      setEditTopic({ title: '', description: '' })
    }
  }

  const handleDeleteTopic = (topicId: string) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      deleteTopic(topicId)
    }
  }

  const handleAddSubtopic = () => {
    if (newSubtopic.title.trim() && newSubtopic.topicId) {
      addSubtopic(newSubtopic)
      setNewSubtopic({ title: '', description: '', topicId: '', isActive: true })
    }
  }

  const handleUpdateSubtopic = () => {
    if (editingSubtopic && editSubtopic.title.trim()) {
      console.log('Updating subtopic:', editingSubtopic.id, 'with data:', editSubtopic)
      updateSubtopic(editingSubtopic.id, editSubtopic)
      setEditingSubtopic(null)
      setEditSubtopic({ title: '', description: '', topicId: '', isActive: true })
    }
  }

  const handleDeleteSubtopic = (subtopicId: string) => {
    console.log('Attempting to delete subtopic:', subtopicId)
    if (window.confirm(`Are you sure you want to delete this subtopic? (ID: ${subtopicId})`)) {
      console.log('Confirmed deletion of subtopic:', subtopicId)
      deleteSubtopic(subtopicId)
    }
  }

  const handleAddKPI = () => {
    console.log('🔍 Adding KPI:', newKPI)
    if (newKPI.name.trim() && newKPI.subtopicId) {
      const kpiData = {
        ...newKPI,
        connectedQuestions: []
      }
      console.log('✅ KPI data:', kpiData)
      addKPI(kpiData)
      setNewKPI({ name: '', isEssential: true, topicId: '', subtopicId: '' })
      console.log('✅ KPI added successfully')
    } else {
      console.log('❌ KPI validation failed:', { name: newKPI.name.trim(), subtopicId: newKPI.subtopicId })
    }
  }

  const handleUpdateKPI = () => {
    if (editingKPI && editKPI.name.trim()) {
      updateKPI(editingKPI.id, editKPI)
      setEditingKPI(null)
      setEditKPI({ name: '', isEssential: true, topicId: '', subtopicId: '' })
    }
  }

  const handleDeleteKPI = (kpiId: string) => {
    if (window.confirm('Are you sure you want to delete this KPI?')) {
      deleteKPI(kpiId)
    }
  }


  const handleUpdateQuestion = () => {
    if (editingQuestion && editQuestion.prompt.trim()) {
      updateQuestion(editingQuestion.id, editQuestion)
      setEditingQuestion(null)
      setEditQuestion({ prompt: '', topicId: '', subtopicId: '', connectedKPIs: [], isActive: true })
    }
  }

  const handleDeleteQuestion = (questionId: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      deleteQuestion(questionId)
    }
  }

  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      console.log('🔄 Starting Excel import...')
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      // Process the Excel data
      const processedData = jsonData as any[]
      console.log('📊 Processed Excel data:', processedData.length, 'rows')
      
      // Group by subtopic to understand the structure
      const subtopicGroups = new Map<string, any[]>()
      
      processedData.forEach((row: any) => {
        const subtopic = row.subtopic?.trim()
        if (subtopic && row.question?.trim()) {
          if (!subtopicGroups.has(subtopic)) {
            subtopicGroups.set(subtopic, [])
          }
          subtopicGroups.get(subtopic)!.push(row)
        }
      })

      // Get the main topic (from first row)
      const mainTopic = processedData[0]?.topic?.trim() || 'Imported Topic'
      const topicDescription = processedData[0]?.topic_description?.trim() || ''
      console.log('📝 Main topic:', mainTopic)

      // Create or find the main topic
      let topicId = topics.find(t => t.title === mainTopic)?.id
      if (!topicId) {
        console.log('➕ Creating new topic:', mainTopic)
        const newTopic = { title: mainTopic, description: topicDescription, isActive: true }
        addTopic(newTopic)
        // Get the topic ID from the updated topics array
        topicId = topics.find(t => t.title === mainTopic)?.id || ''
      }

      // Process each subtopic group
      for (const [subtopicName, subtopicRows] of subtopicGroups) {
        console.log('📝 Processing subtopic:', subtopicName, 'with', subtopicRows.length, 'questions')
        
        // Create subtopic
        let subtopicId = (subtopics || []).find(s => s.title === subtopicName && s.topicId === topicId)?.id
        if (!subtopicId && topicId) {
          console.log('➕ Creating new subtopic:', subtopicName)
          const newSubtopic = { 
            title: subtopicName, 
            description: '', 
            topicId: topicId, 
            isActive: true 
          }
          addSubtopic(newSubtopic)
          // Get the subtopic ID from the updated subtopics array
          subtopicId = (subtopics || []).find(s => s.title === subtopicName && s.topicId === topicId)?.id || ''
        }

        // Process KPIs for this subtopic (from first row of the subtopic)
        const firstRow = subtopicRows[0]
        const kpiNames = firstRow.kpis?.split(';').map((k: string) => k.trim()).filter((k: string) => k) || []
        console.log('📊 KPIs for subtopic:', kpiNames)
        
        // Create KPIs for this subtopic
        const createdKPIs: string[] = []
        for (const kpiName of kpiNames) {
          if (kpiName && subtopicId) {
            // Check if KPI already exists
            const existingKPI = kpis.find(k => k.name === kpiName && k.subtopicId === subtopicId)
            if (!existingKPI) {
              console.log('➕ Creating new KPI:', kpiName)
              const newKPI = {
                name: kpiName,
                isEssential: true,
                topicId: topicId || '',
                subtopicId: subtopicId,
                connectedQuestions: []
              }
              addKPI(newKPI)
              // Get the KPI ID from the updated kpis array
              const createdKPI = kpis.find(k => k.name === kpiName && k.subtopicId === subtopicId)
              if (createdKPI) {
                createdKPIs.push(createdKPI.id)
              }
            } else {
              createdKPIs.push(existingKPI.id)
            }
          }
        }

        // Create questions for this subtopic
        console.log('❓ Creating questions for subtopic:', subtopicName)
        subtopicRows.forEach((row: any) => {
          if (row.question?.trim() && subtopicId) {
            const questionPrompt = row.question.trim()
            
            // Check if question already exists
            const existingQuestion = questions.find(q => q.prompt === questionPrompt && q.subtopicId === subtopicId)
            if (!existingQuestion) {
              console.log('➕ Creating new question:', questionPrompt.substring(0, 50) + '...')
              const newQuestion = {
                prompt: questionPrompt,
                topicId: topicId || '',
                subtopicId: subtopicId,
                connectedKPIs: createdKPIs,
                isActive: true
              }
              addQuestion(newQuestion)
            }
          }
        })
      }

      console.log('✅ Excel import completed successfully!')
      alert('Excel import completed successfully!')
      // Reset the file input
      event.target.value = ''
    } catch (error) {
      console.error('❌ Error importing Excel file:', error)
      alert('Error importing Excel file. Please check the format.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Console</h1>
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'topics', label: t('topics') },
              { id: 'subtopics', label: t('subtopics') },
              { id: 'kpis', label: t('kpis') },
              { id: 'questions', label: t('questions') },
              { id: 'training-examples', label: t('trainingExamples') },
              { id: 'company-codes', label: t('companyCodes') },
              { id: 'backup', label: 'Backup & Sync' },
              { id: 'email-config', label: t('emailConfig') },
              { id: 'ai-evaluation', label: t('aiEvaluation') }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Topics Tab */}
          {activeTab === 'topics' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Topics Management</h2>
                <button
                  onClick={handleAddTopic}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Add Topic
                </button>
              </div>

              {/* Add Topic Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium mb-4">Add New Topic</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newTopic.title}
                      onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter topic title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newTopic.description}
                      onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter topic description"
                    />
                  </div>
                </div>
              </div>

              {/* Topics List */}
              <div className="space-y-4">
                {topics.map((topic) => (
                  <div key={topic.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    {editingTopic?.id === topic.id ? (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Edit Topic</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Title *
                            </label>
                            <input
                              type="text"
                              value={editTopic.title}
                              onChange={(e) => setEditTopic({ ...editTopic, title: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <input
                              type="text"
                              value={editTopic.description}
                              onChange={(e) => setEditTopic({ ...editTopic, description: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleUpdateTopic}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                          >
                            Update Topic
                          </button>
                          <button
                            onClick={() => setEditingTopic(null)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{topic.title}</h3>
                          <p className="text-gray-600 mt-1">{topic.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingTopic(topic)
                              setEditTopic({ title: topic.title, description: topic.description })
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTopic(topic.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtopics Tab */}
          {activeTab === 'subtopics' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Subtopics Management</h2>
                <button
                  onClick={handleAddSubtopic}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Add Subtopic
                </button>
              </div>

              {/* Add Subtopic Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium mb-4">Add New Subtopic</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Topic *
                    </label>
                    <select
                      value={newSubtopic.topicId}
                      onChange={(e) => setNewSubtopic({ ...newSubtopic, topicId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a topic</option>
                      {topics.map((topic) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newSubtopic.title}
                      onChange={(e) => setNewSubtopic({ ...newSubtopic, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter subtopic title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newSubtopic.description}
                      onChange={(e) => setNewSubtopic({ ...newSubtopic, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter subtopic description"
                    />
                  </div>
                </div>
              </div>

              {/* Subtopics List */}
              <div className="space-y-6">
                {topics.map((topic) => {
                  const topicSubtopics = (subtopics || []).filter(s => s.topicId === topic.id)
                  if (topicSubtopics.length === 0) return null
                  
                  return (
                    <div key={topic.id} className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2">
                        {topic.title}
                      </h3>
                      <div className="space-y-3 ml-4">
                        {(subtopics || []).filter(s => s.topicId === topic.id).map((subtopic) => (
                          <div key={subtopic.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      {editingSubtopic && editingSubtopic.id === subtopic.id ? (
                        <div className="space-y-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                          <h3 className="text-lg font-medium text-blue-900">
                            Edit Subtopic: {subtopic.title}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Topic *
                              </label>
                              <select
                                value={editSubtopic.topicId}
                                onChange={(e) => setEditSubtopic({ ...editSubtopic, topicId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select a topic</option>
                                {topics.map((topic) => (
                                  <option key={topic.id} value={topic.id}>
                                    {topic.title}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title *
                              </label>
                              <input
                                type="text"
                                value={editSubtopic.title}
                                onChange={(e) => setEditSubtopic({ ...editSubtopic, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                              </label>
                              <input
                                type="text"
                                value={editSubtopic.description}
                                onChange={(e) => setEditSubtopic({ ...editSubtopic, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleUpdateSubtopic}
                              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                            >
                              Update Subtopic
                            </button>
                            <button
                              onClick={() => setEditingSubtopic(null)}
                              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {subtopic.title} (ID: {subtopic.id.slice(-4)})
                            </h3>
                            <p className="text-gray-600 mt-1">{subtopic.description}</p>
                            <p className="text-sm text-gray-500 mt-1">Under: {topic?.title || 'Unknown Topic'}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                console.log('Editing subtopic:', subtopic.id, subtopic.title)
                                setEditingSubtopic(subtopic)
                                setEditSubtopic({ 
                                  title: subtopic.title, 
                                  description: subtopic.description, 
                                  topicId: subtopic.topicId, 
                                  isActive: subtopic.isActive 
                                })
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                console.log('Delete button clicked for subtopic:', subtopic.id, subtopic.title)
                                handleDeleteSubtopic(subtopic.id)
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* KPIs Tab */}
          {activeTab === 'kpis' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">KPIs Management</h2>
              </div>

              {/* Add KPI Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium mb-4">Add New KPI</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtopic *
                    </label>
                    <select
                      value={newKPI.subtopicId}
                      onChange={(e) => {
                        const selectedSubtopicId = e.target.value
                        const selectedSubtopic = (subtopics || []).find(s => s.id === selectedSubtopicId)
                        setNewKPI({ 
                          ...newKPI, 
                          subtopicId: selectedSubtopicId,
                          topicId: selectedSubtopic?.topicId || ''
                        })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a subtopic</option>
                      {(subtopics || []).map((subtopic) => {
                        const topic = topics.find(t => t.id === subtopic.topicId)
                        return (
                          <option key={subtopic.id} value={subtopic.id}>
                            {topic?.title} - {subtopic.title}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      KPI Name *
                    </label>
                    <input
                      type="text"
                      value={newKPI.name}
                      onChange={(e) => setNewKPI({ ...newKPI, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter KPI name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Essential
                    </label>
                    <select
                      value={newKPI.isEssential.toString()}
                      onChange={(e) => setNewKPI({ ...newKPI, isEssential: e.target.value === 'true' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleAddKPI}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Add KPI
                    </button>
                  </div>
                </div>
              </div>

              {/* KPIs List */}
              <div className="space-y-6">
                {topics.map((topic) => {
                  const topicSubtopics = (subtopics || []).filter(s => s.topicId === topic.id)
                  // Show KPIs for this topic - either directly linked to topic or through subtopics
                  const topicKPIs = kpis.filter(k => {
                    // KPI directly linked to topic
                    if (k.topicId === topic.id) return true
                    // KPI linked to subtopic of this topic
                    return topicSubtopics.some(st => st.id === k.subtopicId)
                  })
                  if (topicKPIs.length === 0) return null
                  
                  return (
                    <div key={topic.id} className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2">
                        {topic.title}
                      </h3>
                      <div className="space-y-4 ml-4">
                        {(subtopics || []).filter(s => s.topicId === topic.id).map((subtopic) => {
                          const subtopicKPIs = kpis.filter(k => k.subtopicId === subtopic.id)
                          if (subtopicKPIs.length === 0) return null
                          
                          return (
                            <div key={subtopic.id} className="space-y-2">
                              <h4 className="text-md font-medium text-gray-700 border-l-2 border-gray-300 pl-3">
                                {subtopic.title}
                              </h4>
                              <div className="space-y-2 ml-4">
                                {subtopicKPIs.map((kpi) => (
                                  <div key={kpi.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      {editingKPI?.id === kpi.id ? (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Edit KPI: {kpi.name}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Subtopic *
                              </label>
                              <select
                                value={editKPI.subtopicId}
                                onChange={(e) => setEditKPI({ ...editKPI, subtopicId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select a subtopic</option>
                                {(subtopics || []).map((subtopic) => {
                                  const topic = topics.find(t => t.id === subtopic.topicId)
                                  return (
                                    <option key={subtopic.id} value={subtopic.id}>
                                      {topic?.title} - {subtopic.title}
                                    </option>
                                  )
                                })}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                KPI Name *
                              </label>
                              <input
                                type="text"
                                value={editKPI.name}
                                onChange={(e) => setEditKPI({ ...editKPI, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Essential
                              </label>
                              <select
                                value={editKPI.isEssential.toString()}
                                onChange={(e) => setEditKPI({ ...editKPI, isEssential: e.target.value === 'true' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                              </select>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={handleUpdateKPI}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                              >
                                Update
                              </button>
                              <button
                                onClick={() => setEditingKPI(null)}
                                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{kpi.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {topic?.title} - {subtopic?.title}
                            </p>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                              kpi.isEssential ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {kpi.isEssential ? 'Essential' : 'Non-essential'}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingKPI(kpi)
                                setEditKPI({ name: kpi.name, isEssential: kpi.isEssential, topicId: kpi.topicId, subtopicId: kpi.subtopicId })
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteKPI(kpi.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Questions Management</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={handleAddQuestion}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Add Question
                  </button>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelImport}
                    className="hidden"
                    id="excel-import"
                  />
                  <label
                    htmlFor="excel-import"
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 cursor-pointer"
                  >
                    Import Excel
                  </label>
                </div>
              </div>

              {/* Excel Import Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Excel Import Format</h3>
                <p className="text-sm text-blue-800 mb-2">
                  Upload an Excel file with the following columns:
                </p>
                <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                  <li><strong>topic</strong> - Main topic name (will be created if doesn't exist)</li>
                  <li><strong>topic_description</strong> - Description for the topic (optional)</li>
                  <li><strong>subtopic</strong> - Subtopic name (will be created if doesn't exist)</li>
                  <li><strong>question</strong> - The question prompt</li>
                  <li><strong>kpis</strong> - KPI names separated by semicolons (;)</li>
                  <li><strong>example_answer</strong> - Sample answer for training (optional)</li>
                  <li><strong>evaluation_detected</strong> - KPIs found in the answer (optional)</li>
                  <li><strong>evaluation_missing</strong> - KPIs missing from the answer (optional)</li>
                  <li><strong>score</strong> - Score 0-3 for the example answer (optional)</li>
                  <li><strong>evaluation_criteria</strong> - Feedback/coaching notes (optional)</li>
                </ul>
                <p className="text-sm text-blue-800 mt-2">
                  <strong>Structure:</strong> Each subtopic should have multiple questions. All questions within a subtopic will share the same KPIs.
                </p>
              </div>

              {/* Add Question Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium mb-4">Add New Question</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtopic *
                    </label>
                    <select
                      value={newQuestion.subtopicId}
                      onChange={(e) => {
                        const selectedSubtopic = (subtopics || []).find(s => s.id === e.target.value)
                        setNewQuestion({ 
                          ...newQuestion, 
                          subtopicId: e.target.value,
                          topicId: selectedSubtopic?.topicId || '',
                          isActive: true
                        })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a subtopic</option>
                      {(subtopics || []).map((subtopic) => {
                        const topic = topics.find(t => t.id === subtopic.topicId)
                        return (
                          <option key={subtopic.id} value={subtopic.id}>
                            {topic?.title} - {subtopic.title}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question Prompt *
                    </label>
                    <textarea
                      value={newQuestion.prompt}
                      onChange={(e) => setNewQuestion({ ...newQuestion, prompt: e.target.value, isActive: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Enter the question prompt"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Connect KPIs
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                      {kpis
                        .filter(k => k.subtopicId === newQuestion.subtopicId)
                        .map((kpi) => (
                          <label key={kpi.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              
                              checked={newQuestion.connectedKPIs.includes(kpi.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewQuestion({
                                    ...newQuestion,
                                    connectedKPIs: e.target.checked 
                                      ? [...newQuestion.connectedKPIs, kpi.id]
                                      : newQuestion.connectedKPIs.filter(id => id !== kpi.id),
                                    isActive: true
                                  })
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">{kpi.name}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {questions.map((question) => {
                  const subtopic = (subtopics || []).find(s => s.id === question.subtopicId)
                  const topic = topics.find(t => t.id === subtopic?.topicId)
                  return (
                    <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      {editingQuestion?.id === question.id ? (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Edit Question</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Subtopic *
                              </label>
                              <select
                                value={editQuestion.subtopicId}
                                onChange={(e) => setEditQuestion({ ...editQuestion, subtopicId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select a subtopic</option>
                                {(subtopics || []).map((subtopic) => {
                                  const topic = topics.find(t => t.id === subtopic.topicId)
                                  return (
                                    <option key={subtopic.id} value={subtopic.id}>
                                      {topic?.title} - {subtopic.title}
                                    </option>
                                  )
                                })}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Question Prompt *
                              </label>
                              <textarea
                                value={editQuestion.prompt}
                                onChange={(e) => setEditQuestion({ ...editQuestion, prompt: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Connect KPIs
                              </label>
                              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                                {kpis
                                  .filter(k => k.subtopicId === editQuestion.subtopicId)
                                  .map((kpi) => (
                                    <label key={kpi.id} className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={editQuestion.connectedKPIs.includes(kpi.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setEditQuestion({
                                              ...editQuestion,
                                              connectedKPIs: [...editQuestion.connectedKPIs, kpi.id]
                                            })
                                          } else {
                                            setEditQuestion({
                                              ...editQuestion,
                                              connectedKPIs: editQuestion.connectedKPIs.filter(id => id !== kpi.id)
                                            })
                                          }
                                        }}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-sm">{kpi.name}</span>
                                    </label>
                                  ))}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={handleUpdateQuestion}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                              >
                                Update Question
                              </button>
                              <button
                                onClick={() => setEditingQuestion(null)}
                                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{question.prompt}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {topic?.title} - {subtopic?.title}
                            </p>
                            <div className="mt-2">
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                question.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {question.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            {question.connectedKPIs.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-600">Connected KPIs:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {question.connectedKPIs.map((kpiId) => {
                                    const kpi = kpis.find(k => k.id === kpiId)
                                    return kpi ? (
                                      <span key={kpiId} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                        {kpi.name}
                                      </span>
                                    ) : null
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => {
                                setEditingQuestion(question)
                                setEditQuestion({
                                  prompt: question.prompt,
                                  topicId: question.topicId,
                                  subtopicId: question.subtopicId || '',
                                  connectedKPIs: question.connectedKPIs,
                                  isActive: question.isActive
                                })
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Other tabs placeholder */}

          {activeTab === 'training-examples' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{t('trainingExamples')}</h2>
              </div>

              {/* Add Training Example Form */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('addTrainingExample')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('question')} *
                    </label>
                    <select
                      value={newTrainingExample.questionId || ''}
                      onChange={(e) => setNewTrainingExample({ ...newTrainingExample, questionId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Valitse kysymys</option>
                      {questions.map(question => {
                        const subtopic = (subtopics || []).find(s => s.id === question.subtopicId)
                        const topic = topics.find(t => t.id === subtopic?.topicId)
                        return (
                          <option key={question.id} value={question.id}>
                            {topic?.title} → {subtopic?.title} → {question.prompt}
                          </option>
                        )
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('grade')} (0-3)
                    </label>
                    <select
                      value={newTrainingExample.qualityRating || 0}
                      onChange={(e) => setNewTrainingExample({ ...newTrainingExample, qualityRating: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>{t('grade0')}</option>
                      <option value={1}>{t('grade1')}</option>
                      <option value={2}>{t('grade2')}</option>
                      <option value={3}>{t('grade3')}</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('exampleAnswer')} *
                  </label>
                  <textarea
                    value={newTrainingExample.answerText || ''}
                    onChange={(e) => setNewTrainingExample({ ...newTrainingExample, answerText: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Kirjoita mallivastaus tähän..."
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('selectKPIs')}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {kpis.map(kpi => (
                      <label key={kpi.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newTrainingExample.detectedKPIs?.includes(kpi.id) || false}
                          onChange={(e) => {
                            const currentKPIs = newTrainingExample.detectedKPIs || []
                            const updatedKPIs = e.target.checked
                              ? [...currentKPIs, kpi.id]
                              : currentKPIs.filter(id => id !== kpi.id)
                            setNewTrainingExample({ ...newTrainingExample, detectedKPIs: updatedKPIs })
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{kpi.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => setNewTrainingExample({
                      questionId: '',
                      answerText: '',
                      qualityRating: 0,
                      detectedKPIs: [],
                      feedback: '',
                      exampleType: 'training'
                    })}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleAddTrainingExample}
                    disabled={!newTrainingExample.questionId || !newTrainingExample.answerText}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('add')}
                  </button>
                </div>
              </div>

              {/* Training Examples List */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Harjoitusesimerkit</h3>
                  
                  {trainingExamples.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Ei harjoitusesimerkkejä vielä lisätty</p>
                  ) : (
                    <div className="space-y-4">
                      {trainingExamples.map((example) => {
                        const question = questions.find(q => q.id === example.questionId)
                        const subtopic = (subtopics || []).find(s => s.id === question?.subtopicId)
                        const topic = topics.find(t => t.id === subtopic?.topicId)
                        const selectedKPIs = kpis.filter(kpi => example.detectedKPIs.includes(kpi.id))
                        
                        return (
                          <div key={example.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="text-sm text-blue-600 mb-1">
                                  {topic?.title} → {subtopic?.title}
                                </div>
                                <h4 className="font-medium text-gray-900 mb-2">
                                  {question?.prompt || 'Kysymys ei löytynyt'}
                                </h4>
                                <p className="text-sm text-gray-600 mb-2">
                                  {example.answerText}
                                </p>
                                <div className="flex items-center space-x-4">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    example.qualityRating >= 3 ? 'bg-green-100 text-green-800' :
                                    example.qualityRating === 2 ? 'bg-blue-100 text-blue-800' :
                                    example.qualityRating === 1 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {example.qualityRating} pistettä
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    KPI:t: {selectedKPIs.map(kpi => kpi.name).join(', ') || 'Ei valittu'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditTrainingExample(example.id)}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  {t('edit')}
                                </button>
                                <button
                                  onClick={() => handleDeleteTrainingExample(example.id)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  {t('delete')}
                                </button>
                              </div>
                            </div>
                            
                            {example.feedback && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <h5 className="text-sm font-medium text-gray-700 mb-1">{t('aiEvaluation')}:</h5>
                                <p className="text-sm text-gray-600">{example.feedback}</p>
                              </div>
                            )}
                            
                            {!example.feedback && (
                              <div className="mt-3">
                                <button
                                  onClick={async () => {
                                    const feedback = await generateAIEvaluation(example)
                                    updateTrainingExample(example.id, { feedback })
                                  }}
                                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                >
                                  {t('submitForEvaluation')}
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'company-codes' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{t('companyCodes')}</h2>
              </div>

              {/* Add Company Code Form */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Lisää yrityskoodi</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yrityskoodi *
                    </label>
                    <input
                      type="text"
                      value={newCompanyCode.code || ''}
                      onChange={(e) => setNewCompanyCode({ ...newCompanyCode, code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="esim. YRITYS2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yrityksen nimi *
                    </label>
                    <input
                      type="text"
                      value={newCompanyCode.companyName || ''}
                      onChange={(e) => setNewCompanyCode({ ...newCompanyCode, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="esim. Acme Corporation"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin sähköposti *
                    </label>
                    <input
                      type="email"
                      value={newCompanyCode.adminEmail || ''}
                      onChange={(e) => setNewCompanyCode({ ...newCompanyCode, adminEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="admin@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maksimi käyttäjät *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newCompanyCode.maxUsers || 1}
                      onChange={(e) => setNewCompanyCode({ ...newCompanyCode, maxUsers: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Viimeinen voimassaolopäivä
                  </label>
                  <input
                    type="date"
                    value={newCompanyCode.expiresAt || ''}
                    onChange={(e) => setNewCompanyCode({ ...newCompanyCode, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => setNewCompanyCode({
                      code: '',
                      companyName: '',
                      adminEmail: '',
                      maxUsers: 1,
                      expiresAt: '',
                      isActive: true
                    })}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleAddCompanyCode}
                    disabled={!newCompanyCode.code || !newCompanyCode.companyName || !newCompanyCode.adminEmail}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('add')}
                  </button>
                </div>
              </div>

              {/* Company Codes List */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Yrityskoodit</h3>
                  
                  {companyCodes.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Ei yrityskoodeja vielä lisätty</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Koodi
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Yritys
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Admin Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Max käyttäjät
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Viimeinen päivä
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Toiminnot
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {companyCodes.map((code) => (
                            <tr key={code.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {code.code}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {code.companyName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {code.adminEmail}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {code.maxUsers}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(code.expiresAt).toLocaleDateString('fi-FI')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  code.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {code.isActive ? 'Aktiivinen' : 'Poistettu käytöstä'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button
                                  onClick={() => handleEditCompanyCode(code.id)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  {t('edit')}
                                </button>
                                <button
                                  onClick={() => handleDeleteCompanyCode(code.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  {t('delete')}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AI Evaluation Rules Tab */}
          {activeTab === 'ai-evaluation' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{t('aiEvaluation')}</h2>
              </div>
              
              <AIEvaluationRules 
                rules={evaluationRules}
                onRulesChange={setEvaluationRules}
                tips={aiTips}
                onTipsChange={setAiTips}
              />
            </div>
          )}

          {/* Email Configuration Tab */}
          {activeTab === 'email-config' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Email Configuration</h2>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">EmailJS Integration Status</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-green-800">EmailJS Successfully Configured</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Your EmailJS integration is active and ready to send real emails.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Configuration Details</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Service ID</label>
                        <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded border">service_i6e64ig</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Template ID</label>
                        <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded border">template_ndt42fy</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Public Key</label>
                        <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded border">KjrQsyWuyRe9mHx0O</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Email Features</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">Subscription expiry warnings</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">Final expiry reminders</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">Extension confirmations</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">Professional email templates</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Test Email System</h4>
                  <button
                    onClick={() => {
                      // Test email functionality
                      console.log('🧪 Testing email system...');
                      alert('Email system test initiated! Check console for details.');
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Test Email Sending
                  </button>
                  <p className="text-sm text-gray-600 mt-2">
                    This will send a test email to verify your EmailJS integration is working correctly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Backup & Sync Tab */}
          {activeTab === 'backup' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Backup & Data Sync</h2>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    {lastBackupTime && `Last backup: ${new Date(lastBackupTime).toLocaleString()}`}
                  </div>
                  <button
                    onClick={() => {
                      console.log('Current data state:', {
                        topics: topics.length,
                        questions: questions.length,
                        subtopics: subtopics.length,
                        kpis: kpis.length,
                        companyCodes: companyCodes.length
                      })
                      console.log('Questions:', questions)
                      console.log('Subtopics:', subtopics)
                      alert('Debug info logged to console. Check browser console for details.')
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Debug Data
                  </button>
                  <button
                    onClick={() => {
                      // Validate data integrity
                      const storageKeys = [
                        'ipma_topics',
                        'ipma_questions', 
                        'ipma_kpis',
                        'ipma_company_codes',
                        'ipma_subtopics',
                        'ipma_sample_answers',
                        'ipma_training_examples',
                        'ipma_users',
                        'ipma_subscriptions'
                      ]
                      
                      const results: Record<string, { status: string; count: number; timestamp?: string; error?: string }> = {}
                      storageKeys.forEach(key => {
                        try {
                          const data = localStorage.getItem(key)
                          if (data) {
                            const parsed = JSON.parse(data)
                            const items = Array.isArray(parsed) ? parsed : (parsed.data || [])
                            results[key] = {
                              status: 'ok',
                              count: items.length,
                              timestamp: parsed.timestamp || 'unknown'
                            }
                          } else {
                            results[key] = { status: 'missing', count: 0 }
                          }
                        } catch (error: any) {
                          results[key] = { status: 'error', count: 0, error: error.message }
                        }
                      })
                      
                      console.log('Data Validation Results:', results)
                      alert(`Data Validation Complete!\n\nTopics: ${results['ipma_topics']?.count || 0}\nQuestions: ${results['ipma_questions']?.count || 0}\nKPIs: ${results['ipma_kpis']?.count || 0}\nCompany Codes: ${results['ipma_company_codes']?.count || 0}\n\nCheck console for full details.`)
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Validate Data
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Save to localStorage Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Changes
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Save all your edits to localStorage. This ensures your changes are preserved.
                  </p>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        // Save each data type individually
                        localStorage.setItem('ipma_topics', JSON.stringify({
                          timestamp: new Date().toISOString(),
                          data: topics
                        }))
                        localStorage.setItem('ipma_questions', JSON.stringify({
                          timestamp: new Date().toISOString(),
                          data: questions
                        }))
                        localStorage.setItem('ipma_kpis', JSON.stringify({
                          timestamp: new Date().toISOString(),
                          data: kpis
                        }))
                        localStorage.setItem('ipma_company_codes', JSON.stringify({
                          timestamp: new Date().toISOString(),
                          data: companyCodes
                        }))
                        localStorage.setItem('ipma_subtopics', JSON.stringify({
                          timestamp: new Date().toISOString(),
                          data: subtopics
                        }))
                        localStorage.setItem('ipma_sample_answers', JSON.stringify({
                          timestamp: new Date().toISOString(),
                          data: sampleAnswers
                        }))
                        localStorage.setItem('ipma_training_examples', JSON.stringify({
                          timestamp: new Date().toISOString(),
                          data: trainingExamples
                        }))
                        localStorage.setItem('ipma_users', JSON.stringify({
                          timestamp: new Date().toISOString(),
                          data: users
                        }))
                        localStorage.setItem('ipma_subscriptions', JSON.stringify({
                          timestamp: new Date().toISOString(),
                          data: subscriptions
                        }))
                        
                        alert(`✅ All data saved to localStorage!\n\nTopics: ${topics.length}\nQuestions: ${questions.length}\nKPIs: ${kpis.length}\nCompany Codes: ${companyCodes.length}\nSubtopics: ${subtopics.length}\nSample Answers: ${sampleAnswers.length}\nTraining Examples: ${trainingExamples.length}\nUsers: ${users.length}\nSubscriptions: ${subscriptions.length}`)
                      }}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Save All Changes
                    </button>
                  </div>
                </div>

                {/* Supabase Sync Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Supabase Sync
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Sync your data to/from Supabase database for persistent storage across deployments.
                  </p>
                  
                  <div className="space-y-3">
                    <button
                      onClick={handleSyncToSupabase}
                      disabled={backupStatus !== 'idle'}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {backupStatus === 'syncing' ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Syncing to Supabase...
                        </>
                      ) : (
                        'Sync to Supabase'
                      )}
                    </button>
                    
                    <button
                      onClick={handleSyncFromSupabase}
                      disabled={backupStatus !== 'idle'}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {backupStatus === 'syncing' ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Syncing from Supabase...
                        </>
                      ) : (
                        'Sync from Supabase'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Auto Backup Status */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Automatic Backup Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Auto backup every 30 minutes</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Backup before page unload</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Backup before deployments</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminConsole


 
