// Test the actual sync functionality
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🧪 Testing Supabase sync functionality...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSync() {
  try {
    // Test inserting a sample topic
    console.log('📝 Testing topic insertion...')
    
    const testTopic = {
      id: 'test-topic-123',
      title: 'Test Topic',
      description: 'This is a test topic',
      order_index: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('topics')
      .upsert([testTopic], { onConflict: 'id' })
    
    if (error) {
      console.log('❌ Insert error:', error)
      console.log('Error details:', error.message)
      console.log('Error code:', error.code)
      console.log('Error details:', error.details)
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

testSync()
