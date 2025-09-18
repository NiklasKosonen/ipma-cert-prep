// Check if database tables exist
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Checking database tables...')

// Fix the corrupted key by taking only the first part
const cleanKey = supabaseKey.split('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')[0] + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' + supabaseKey.split('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')[1].split('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')[0]

console.log('Using cleaned key:', cleanKey.substring(0, 50) + '...')

const supabase = createClient(supabaseUrl, cleanKey)

async function checkTables() {
  const tables = ['topics', 'questions', 'kpis', 'company_codes', 'subtopics']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1)
      
      if (error) {
        console.log(`❌ Table '${table}': ${error.message}`)
      } else {
        console.log(`✅ Table '${table}': OK`)
      }
    } catch (err) {
      console.log(`❌ Table '${table}': ${err.message}`)
    }
  }
}

checkTables()
