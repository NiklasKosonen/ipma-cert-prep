
// Data Validation Script
interface ValidationResult {
  status: 'ok' | 'missing' | 'error'
  count: number
  timestamp?: string
  error?: string
}

export const validateDataIntegrity = (): Record<string, ValidationResult> => {
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
  
  const results: Record<string, ValidationResult> = {}
  
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
      results[key] = { status: 'error', error: error.message }
    }
  })
  
  return results
}

// Force save all data
export const forceSaveAllData = (dataContext: any) => {
  const { topics, questions, kpis, companyCodes, subtopics, sampleAnswers, trainingExamples, users, subscriptions } = dataContext
  
  const dataToSave = {
    topics,
    questions,
    kpis,
    companyCodes,
    subtopics,
    sampleAnswers,
    trainingExamples,
    users,
    subscriptions
  }
  
  Object.entries(dataToSave).forEach(([key, data]) => {
    try {
      const storageKey = `ipma_${key}`
      const dataWithTimestamp = {
        data: data,
        timestamp: new Date().toISOString(),
        count: data.length,
        source: 'force-save'
      }
      localStorage.setItem(storageKey, JSON.stringify(dataWithTimestamp))
      console.log(`✅ Force saved ${data.length} ${key} to localStorage`)
    } catch (error) {
      console.error(`❌ Failed to force save ${key}:`, error)
    }
  })
}
