#!/usr/bin/env node

/**
 * Data Persistence Debug Script
 * This script helps identify why data isn't saving properly
 */

console.log('🔍 Data Persistence Debug Report')
console.log('================================')

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  console.log('🌐 Running in browser environment')
  
  // Check localStorage availability
  try {
    const testKey = 'ipma_debug_test'
    const testValue = 'test_data_' + Date.now()
    localStorage.setItem(testKey, testValue)
    const retrieved = localStorage.getItem(testKey)
    
    if (retrieved === testValue) {
      console.log('✅ localStorage is working correctly')
      localStorage.removeItem(testKey)
    } else {
      console.log('❌ localStorage is not working correctly')
    }
  } catch (error) {
    console.log('❌ localStorage error:', error.message)
  }
  
  // Check current data in localStorage
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
  
  console.log('\n📊 Current localStorage data:')
  storageKeys.forEach(key => {
    try {
      const data = localStorage.getItem(key)
      if (data) {
        const parsed = JSON.parse(data)
        console.log(`  ${key}: ${Array.isArray(parsed) ? parsed.length : 'invalid'} items`)
      } else {
        console.log(`  ${key}: No data`)
      }
    } catch (error) {
      console.log(`  ${key}: Error - ${error.message}`)
    }
  })
  
  // Check for backup files
  console.log('\n💾 Backup system status:')
  try {
    const backupKeys = Object.keys(localStorage).filter(key => key.includes('backup'))
    if (backupKeys.length > 0) {
      console.log(`  Found ${backupKeys.length} backup entries`)
      backupKeys.forEach(key => {
        console.log(`    ${key}`)
      })
    } else {
      console.log('  No backup entries found')
    }
  } catch (error) {
    console.log('  Error checking backups:', error.message)
  }
  
} else {
  console.log('🖥️ Running in Node.js environment')
  
  // Check if we can access the file system
  try {
    const fs = require('fs')
    const path = require('path')
    
    console.log('\n📁 File system check:')
    
    // Check if backup directory exists
    const backupDir = './backups'
    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir)
      console.log(`  Backup directory exists with ${files.length} files`)
      files.forEach(file => {
        console.log(`    ${file}`)
      })
    } else {
      console.log('  Backup directory does not exist')
    }
    
    // Check mock data file
    const mockDataFile = './src/lib/mockData.ts'
    if (fs.existsSync(mockDataFile)) {
      const stats = fs.statSync(mockDataFile)
      console.log(`  Mock data file exists (${stats.size} bytes)`)
    } else {
      console.log('  Mock data file does not exist')
    }
    
  } catch (error) {
    console.log('  File system error:', error.message)
  }
}

console.log('\n🔧 Potential Issues:')
console.log('1. localStorage quota exceeded')
console.log('2. Browser security restrictions')
console.log('3. Backup system overwriting data')
console.log('4. Supabase integration conflicts')
console.log('5. Deployment hooks interfering')
console.log('6. Data context not properly initialized')

console.log('\n💡 Recommendations:')
console.log('1. Check browser console for errors')
console.log('2. Verify localStorage quota')
console.log('3. Test data saving in incognito mode')
console.log('4. Check if backup system is running')
console.log('5. Verify data context initialization')
