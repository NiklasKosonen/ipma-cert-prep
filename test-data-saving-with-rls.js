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

const cleanedSupabaseAnonKey = supabaseAnonKey.startsWith('eeyJ') 
  ? supabaseAnonKey.substring(1) 
  : supabaseAnonKey;

console.log('🧪 Testing Data Saving with RLS Enabled...')

const supabase = createClient(supabaseUrl, cleanedSupabaseAnonKey)

async function testDataSaving() {
  console.log('\n📝 Testing data saving operations...')
  
  try {
    // Test 1: Try to insert a test topic
    console.log('\n1️⃣ Testing topic insertion...')
    const testTopic = {
      id: 'test-topic-rls-' + Date.now(),
      title: 'Test Topic for RLS',
      description: 'Testing if data saving works with RLS',
      order_index: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: topicData, error: topicError } = await supabase
      .from('topics')
      .upsert([testTopic], { onConflict: 'id' })

    if (topicError) {
      console.error('❌ Topic insertion failed:', topicError.message)
      console.error('Error code:', topicError.code)
    } else {
      console.log('✅ Topic insertion successful!')
      console.log('Inserted topic:', topicData)
    }

    // Test 2: Try to insert a test question
    console.log('\n2️⃣ Testing question insertion...')
    const testQuestion = {
      id: 'test-question-rls-' + Date.now(),
      topic_id: testTopic.id,
      subtopic_id: null,
      prompt: 'Test question for RLS',
      difficulty_level: 1,
      time_limit: 300,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .upsert([testQuestion], { onConflict: 'id' })

    if (questionError) {
      console.error('❌ Question insertion failed:', questionError.message)
      console.error('Error code:', questionError.code)
    } else {
      console.log('✅ Question insertion successful!')
      console.log('Inserted question:', questionData)
    }

    // Test 3: Try to insert a test KPI
    console.log('\n3️⃣ Testing KPI insertion...')
    const testKPI = {
      id: 'test-kpi-rls-' + Date.now(),
      name: 'Test KPI for RLS',
      description: 'Testing KPI insertion with RLS',
      weight: 1.0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: kpiData, error: kpiError } = await supabase
      .from('kpis')
      .upsert([testKPI], { onConflict: 'id' })

    if (kpiError) {
      console.error('❌ KPI insertion failed:', kpiError.message)
      console.error('Error code:', kpiError.code)
    } else {
      console.log('✅ KPI insertion successful!')
      console.log('Inserted KPI:', kpiData)
    }

    console.log('\n📊 Data Saving Test Results:')
    console.log('Topics:', topicError ? '❌ Failed' : '✅ Success')
    console.log('Questions:', questionError ? '❌ Failed' : '✅ Success')
    console.log('KPIs:', kpiError ? '❌ Failed' : '✅ Success')

    if (topicError || questionError || kpiError) {
      console.log('\n⚠️ Some operations failed. This might be due to:')
      console.log('1. RLS policies blocking anonymous access')
      console.log('2. Foreign key constraints')
      console.log('3. Missing required fields')
      console.log('\n💡 Solution: The anonymous policies in implement-rls-security.sql should allow sync operations')
    } else {
      console.log('\n🎉 All data saving operations successful!')
      console.log('✅ RLS is working and data saving is functional')
    }

  } catch (error) {
    console.error('❌ Data saving test failed:', error)
  }
}

testDataSaving()
