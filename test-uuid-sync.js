// Test UUID generation and sync
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import crypto from 'crypto'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🧪 Testing UUID generation and sync...')

const supabase = createClient(supabaseUrl, supabaseKey)

// Generate a consistent UUID from a string ID
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

async function testUUIDSync() {
  try {
    // Test with a proper UUID
    const testTopic = {
      id: generateUUID('test-topic-123'),
      title: 'Test Topic with UUID',
      description: 'This is a test topic with proper UUID',
      order_index: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    console.log('Generated UUID:', testTopic.id)
    console.log('📝 Testing topic insertion with UUID...')
    
    const { data, error } = await supabase
      .from('topics')
      .upsert([testTopic], { onConflict: 'id' })
    
    if (error) {
      console.log('❌ Insert error:', error)
    } else {
      console.log('✅ Topic inserted successfully!')
      console.log('Data:', data)
    }
    
    // Test reading the data back
    console.log('📖 Testing data retrieval...')
    const { data: topics, error: readError } = await supabase
      .from('topics')
      .select('*')
    
    if (readError) {
      console.log('❌ Read error:', readError)
    } else {
      console.log('✅ Topics retrieved:', topics)
    }
    
  } catch (err) {
    console.log('❌ Test failed:', err.message)
  }
}

testUUIDSync()
