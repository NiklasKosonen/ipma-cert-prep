// Test Supabase Connection
// Run this script to test if your Supabase configuration is working

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Testing Supabase Configuration...')
console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('Key:', supabaseKey ? '✅ Set' : '❌ Missing')

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ Supabase not configured!')
  console.log('Please create a .env.local file with:')
  console.log('VITE_SUPABASE_URL=https://your-project-id.supabase.co')
  console.log('VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key-here')
  process.exit(1)
}

// Test connection
const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('\n🔄 Testing database connection...')
    
    // Test a simple query
    const { data, error } = await supabase
      .from('topics')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('❌ Database connection failed:', error.message)
      console.log('\nPossible solutions:')
      console.log('1. Make sure your Supabase project is active')
      console.log('2. Run the SQL schema from supabase-schema.sql in your Supabase SQL Editor')
      console.log('3. Check if your anon key has the correct permissions')
    } else {
      console.log('✅ Database connection successful!')
      console.log('✅ Supabase sync should work now!')
    }
  } catch (err) {
    console.log('❌ Connection test failed:', err.message)
  }
}

testConnection()
