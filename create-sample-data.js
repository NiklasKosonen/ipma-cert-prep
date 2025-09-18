// Create sample data for testing
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import crypto from 'crypto'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('📝 Creating sample data for testing...')

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

async function createSampleData() {
  try {
    // Create sample topics
    const sampleTopics = [
      {
        id: 'topic-1',
        title: 'Project Management Fundamentals',
        description: 'Basic concepts of project management',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'topic-2', 
        title: 'Risk Management',
        description: 'Identifying and managing project risks',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    console.log('📝 Creating sample topics...')
    
    const { data, error } = await supabase
      .from('topics')
      .upsert(sampleTopics.map(topic => ({
        id: generateUUID(topic.id),
        title: topic.title,
        description: topic.description,
        order_index: 0,
        is_active: topic.isActive,
        created_at: topic.createdAt,
        updated_at: topic.updatedAt
      })), { onConflict: 'id' })
    
    if (error) {
      console.log('❌ Error creating topics:', error)
    } else {
      console.log('✅ Sample topics created successfully!')
      console.log('Data:', data)
    }
    
    // Verify the data was created
    console.log('📖 Verifying topics...')
    const { data: topics, error: readError } = await supabase
      .from('topics')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (readError) {
      console.log('❌ Read error:', readError)
    } else {
      console.log('✅ Topics in database:', topics)
      console.log(`Total topics: ${topics.length}`)
    }
    
  } catch (err) {
    console.log('❌ Test failed:', err.message)
  }
}

createSampleData()
