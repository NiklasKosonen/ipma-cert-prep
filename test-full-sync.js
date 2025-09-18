// Test the full sync process exactly as it happens in the app
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import crypto from 'crypto'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🧪 Testing full sync process...')

const supabase = createClient(supabaseUrl, supabaseKey)

// Generate a consistent UUID from a string ID (same as in dataMigration.ts)
function generateUUID(inputId) {
  const hash = crypto.createHash('md5').update(inputId).digest('hex')
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    hash.substring(12, 16),
    hash.substring(16, 20),
    hash.substring(20, 32)
  ].join('-')
}

// Load data from localStorage (same as in dataMigration.ts)
function loadFromStorage(key, fallback = []) {
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed && typeof parsed === 'object' && parsed.data && Array.isArray(parsed.data) && parsed.timestamp) {
        return parsed.data
      } else if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (error) {
    console.warn(`⚠️ Error loading ${key}:`, error)
  }
  return fallback
}

// Export all data (same as in dataMigration.ts)
function exportAllData() {
  return {
    topics: loadFromStorage('ipma_topics'),
    questions: loadFromStorage('ipma_questions'),
    kpis: loadFromStorage('ipma_kpis'),
    companyCodes: loadFromStorage('ipma_company_codes'),
    subtopics: loadFromStorage('ipma_subtopics'),
    sampleAnswers: loadFromStorage('ipma_sample_answers'),
    trainingExamples: loadFromStorage('ipma_training_examples'),
    users: loadFromStorage('ipma_users'),
    subscriptions: loadFromStorage('ipma_subscriptions'),
    attempts: [],
    attemptItems: []
  }
}

// Sync topics (same as in dataMigration.ts)
async function syncTopics(topics) {
  if (!topics.length) return
  
  console.log(`📝 Syncing ${topics.length} topics...`)
  
  const { error } = await supabase
    .from('topics')
    .upsert(topics.map(topic => ({
      id: generateUUID(topic.id),
      title: topic.title,
      description: topic.description,
      order_index: 0,
      is_active: topic.isActive !== false,
      created_at: topic.createdAt,
      updated_at: topic.updatedAt
    })), { onConflict: 'id' })

  if (error) {
    console.error('❌ Error syncing topics:', error)
    throw error
  }
  console.log(`✅ Synced ${topics.length} topics to Supabase`)
}

async function testFullSync() {
  try {
    console.log('🔄 Starting full sync test...')
    
    // Check if Supabase is properly configured
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.')
    }
    
    console.log('✅ Supabase configuration found')
    
    // Export all data
    const snapshot = exportAllData()
    console.log('📊 Data snapshot created:', {
      topics: snapshot.topics.length,
      questions: snapshot.questions.length,
      kpis: snapshot.kpis.length,
      companyCodes: snapshot.companyCodes.length,
      subtopics: snapshot.subtopics.length,
      sampleAnswers: snapshot.sampleAnswers.length,
      trainingExamples: snapshot.trainingExamples.length,
      users: snapshot.users.length,
      subscriptions: snapshot.subscriptions.length
    })
    
    // Show sample data
    if (snapshot.topics.length > 0) {
      console.log('📋 Sample topic:', snapshot.topics[0])
    }
    
    // Sync topics
    await syncTopics(snapshot.topics)
    
    console.log('✅ Full sync test completed!')
    
  } catch (error) {
    console.error('❌ Full sync test failed:', error)
  }
}

testFullSync()
