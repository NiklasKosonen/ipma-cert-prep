import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables not found!')
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not Set')
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Not Set')
  process.exit(1)
}

const cleanedSupabaseAnonKey = supabaseAnonKey.startsWith('eeyJ') 
  ? supabaseAnonKey.substring(1) 
  : supabaseAnonKey;

console.log('🔍 Debugging Supabase Data...')
console.log('Using cleaned key:', cleanedSupabaseAnonKey.substring(0, 50) + '...')

const supabase = createClient(supabaseUrl, cleanedSupabaseAnonKey)

async function debugSupabaseData() {
  console.log('\n📊 Checking all tables in Supabase...')
  
  const tables = [
    'topics', 'subtopics', 'questions', 'kpis', 'company_codes', 
    'sample_answers', 'training_examples', 'users', 'subscriptions',
    'attempts', 'attempt_items', 'data_backups'
  ]
  
  for (const table of tables) {
    try {
      console.log(`\n🔍 Checking table: ${table}`)
      
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(5) // Just get a few records
      
      if (error) {
        console.error(`❌ Error accessing ${table}:`, error.message)
        console.error(`   Error code: ${error.code}`)
        console.error(`   Error details: ${error.details}`)
      } else {
        console.log(`✅ ${table}: ${count} records`)
        if (data && data.length > 0) {
          console.log(`   Sample data:`, data[0])
        }
      }
    } catch (err) {
      console.error(`❌ Unexpected error with ${table}:`, err.message)
    }
  }
  
  // Special check for data_backups
  console.log('\n🔍 Special check for data_backups...')
  try {
    const { data, error } = await supabase
      .from('data_backups')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (error) {
      console.error('❌ Error accessing data_backups:', error)
    } else if (data && data.length > 0) {
      console.log('✅ Found backup:', data[0].backup_name)
      console.log('   Backup data keys:', Object.keys(data[0].data_snapshot || {}))
    } else {
      console.log('📭 No backups found in data_backups table')
    }
  } catch (err) {
    console.error('❌ Unexpected error with data_backups:', err.message)
  }
}

debugSupabaseData()
