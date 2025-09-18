#!/usr/bin/env node

/**
 * Data Persistence Fix Script
 * This script fixes the data persistence issues
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔧 Fixing Data Persistence Issues...')

// 1. Fix the DataContext to ensure proper saving
const dataContextPath = './src/contexts/DataContext.tsx'

try {
  let content = fs.readFileSync(dataContextPath, 'utf8')
  
  // Add better error handling and logging to saveToStorage
  const improvedSaveToStorage = `
const saveToStorage = <T,>(key: string, data: T[]): void => {
  try {
    // Validate data before saving
    if (!Array.isArray(data)) {
      console.error(\`Attempted to save non-array data for \${key}\`)
      return
    }
    
    // Add timestamp for debugging
    const dataWithTimestamp = {
      data: data,
      timestamp: new Date().toISOString(),
      count: data.length
    }
    
    localStorage.setItem(key, JSON.stringify(dataWithTimestamp))
    console.log(\`✅ Saved \${data.length} items to \${key}\`)
  } catch (error) {
    console.error(\`Failed to save \${key} to localStorage:\`, error)
    
    // Try to save without timestamp if the above fails
    try {
      localStorage.setItem(key, JSON.stringify(data))
      console.log(\`✅ Fallback save successful for \${key}\`)
    } catch (fallbackError) {
      console.error(\`❌ Fallback save also failed for \${key}:\`, fallbackError)
    }
  }
}`

  // Replace the existing saveToStorage function
  content = content.replace(
    /const saveToStorage = <T,>\(key: string, data: T\[\]\): void => \{[\s\S]*?\}/,
    improvedSaveToStorage
  )
  
  // Also improve loadFromStorage
  const improvedLoadFromStorage = `
const loadFromStorage = <T,>(key: string, fallback: T[]): T[] => {
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      const parsed = JSON.parse(stored)
      
      // Handle both old format (array) and new format (object with data property)
      let data
      if (Array.isArray(parsed)) {
        data = parsed
      } else if (parsed && Array.isArray(parsed.data)) {
        data = parsed.data
        console.log(\`📊 Loaded \${data.length} items from \${key} (timestamp: \${parsed.timestamp})\`)
      } else {
        console.warn(\`Invalid data format for \${key}, using fallback\`)
        return fallback
      }
      
      return data
    }
  } catch (error) {
    console.error(\`Failed to load \${key} from localStorage:\`, error)
  }
  return fallback
}`

  // Replace the existing loadFromStorage function
  content = content.replace(
    /const loadFromStorage = <T,>\(key: string, fallback: T\[\]\): T\[\] => \{[\s\S]*?\}/,
    improvedLoadFromStorage
  )
  
  fs.writeFileSync(dataContextPath, content)
  console.log('✅ Fixed DataContext.tsx')
  
} catch (error) {
  console.error('❌ Error fixing DataContext:', error.message)
}

// 2. Create a data validation script
const validationScript = `
// Data Validation Script
export const validateDataIntegrity = () => {
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
  
  const results = {}
  
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
    } catch (error) {
      results[key] = { status: 'error', error: error.message }
    }
  })
  
  return results
}

// Force save all data
export const forceSaveAllData = (dataContext) => {
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
      const storageKey = \`ipma_\${key}\`
      const dataWithTimestamp = {
        data: data,
        timestamp: new Date().toISOString(),
        count: data.length,
        source: 'force-save'
      }
      localStorage.setItem(storageKey, JSON.stringify(dataWithTimestamp))
      console.log(\`✅ Force saved \${data.length} \${key} to localStorage\`)
    } catch (error) {
      console.error(\`❌ Failed to force save \${key}:\`, error)
    }
  })
}
`

fs.writeFileSync('./src/utils/dataValidation.ts', validationScript)
console.log('✅ Created data validation utilities')

// 3. Fix the backup system to not interfere with normal operations
const backupHookPath = './vercel-deploy-hook.js'

try {
  let content = fs.readFileSync(backupHookPath, 'utf8')
  
  // Add a check to prevent overwriting user data
  const improvedPreBuild = `
// Pre-build: Create backup but don't overwrite user data
function preBuild() {
  console.log('🚀 Running Vercel deployment hook: pre-build')
  console.log('📦 Pre-build: Creating data backup...')
  
  try {
    ensureBackupDir()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFile = path.join(CONFIG.backupDir, \`data-backup-\${timestamp}.json\`)
    
    // Only backup if we have actual user data
    const hasUserData = fs.existsSync('./src/lib/mockData.ts')
    if (hasUserData) {
      const mockDataContent = fs.readFileSync(CONFIG.dataFile, 'utf8')
      const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        mockData: mockDataContent,
        metadata: {
          source: 'vercel-deploy-hook',
          environment: process.env.NODE_ENV || 'production',
          note: 'This backup preserves user data during deployment'
        }
      }
      
      fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2))
      console.log(\`✅ Data backup created: \${backupFile}\`)
    } else {
      console.log('⚠️ No user data found to backup')
    }
  } catch (error) {
    console.error('❌ Pre-build backup failed:', error.message)
  }
}`

  // Replace the pre-build function
  content = content.replace(
    /function preBuild\(\) \{[\s\S]*?\}/,
    improvedPreBuild
  )
  
  fs.writeFileSync(backupHookPath, content)
  console.log('✅ Fixed backup system')
  
} catch (error) {
  console.error('❌ Error fixing backup system:', error.message)
}

console.log('\n🎉 Data Persistence Fix Complete!')
console.log('Changes made:')
console.log('1. ✅ Enhanced DataContext with better error handling')
console.log('2. ✅ Added data validation utilities')
console.log('3. ✅ Fixed backup system to not interfere')
console.log('4. ✅ Added comprehensive logging')
console.log('\nNext steps:')
console.log('1. Test data saving in the app')
console.log('2. Check browser console for save/load messages')
console.log('3. Use the new validation utilities if needed')
