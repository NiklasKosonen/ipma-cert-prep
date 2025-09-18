import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Load environment variables from .env.local
const envContent = readFileSync('.env.local', 'utf8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    envVars[key.trim()] = value.trim()
  }
})

const supabaseUrl = envVars.VITE_SUPABASE_URL
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables not found!')
  console.log('Please check your .env.local file contains:')
  console.log('VITE_SUPABASE_URL=your_supabase_url')
  console.log('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key')
  process.exit(1)
}

const cleanedSupabaseAnonKey = supabaseAnonKey.startsWith('eeyJ') 
  ? supabaseAnonKey.substring(1) 
  : supabaseAnonKey;

console.log('🔒 Testing RLS Security Implementation...')
console.log('Using cleaned key:', cleanedSupabaseAnonKey.substring(0, 50) + '...')

const supabase = createClient(supabaseUrl, cleanedSupabaseAnonKey)

async function testRLSPolicies() {
  console.log('\n📋 Testing Row Level Security Policies...')
  
  try {
    // Test 1: Anonymous access (should work for sync)
    console.log('\n1️⃣ Testing anonymous access...')
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('*')
      .limit(1)
    
    if (topicsError) {
      console.error('❌ Anonymous access failed:', topicsError.message)
    } else {
      console.log('✅ Anonymous access works (for sync)')
    }

    // Test 2: Try to access without authentication
    console.log('\n2️⃣ Testing unauthenticated access...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError) {
      console.log('✅ Unauthenticated access blocked:', usersError.message)
    } else {
      console.log('⚠️ Unauthenticated access allowed (RLS may not be working)')
    }

    // Test 3: Check if RLS is enabled
    console.log('\n3️⃣ Checking RLS status...')
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('check_rls_status')
      .catch(() => {
        // If function doesn't exist, try direct query
        return supabase
          .from('information_schema.tables')
          .select('table_name, row_security')
          .eq('table_schema', 'public')
          .limit(5)
      })
    
    if (rlsError) {
      console.log('⚠️ Could not check RLS status:', rlsError.message)
    } else {
      console.log('📊 RLS Status:', rlsStatus)
    }

    console.log('\n✅ RLS Security Test Complete!')
    console.log('\n📝 Next Steps:')
    console.log('1. Apply the RLS policies from implement-rls-security.sql')
    console.log('2. Test data saving with RLS enabled')
    console.log('3. Implement proper authentication')
    console.log('4. Remove anonymous policies')

  } catch (error) {
    console.error('❌ RLS test failed:', error)
  }
}

testRLSPolicies()
