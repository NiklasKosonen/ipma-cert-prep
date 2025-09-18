// Check what's in browser localStorage
// Run this in your browser console on your admin panel

console.log('🔍 Checking browser localStorage data...')

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

let totalItems = 0

storageKeys.forEach(key => {
  const data = localStorage.getItem(key)
  if (data) {
    try {
      const parsed = JSON.parse(data)
      if (parsed && typeof parsed === 'object' && parsed.data && Array.isArray(parsed.data)) {
        console.log(`✅ ${key}: ${parsed.data.length} items (timestamp: ${parsed.timestamp})`)
        if (parsed.data.length > 0) {
          console.log(`   Sample item:`, parsed.data[0])
        }
        totalItems += parsed.data.length
      } else if (Array.isArray(parsed)) {
        console.log(`✅ ${key}: ${parsed.length} items (old format)`)
        if (parsed.length > 0) {
          console.log(`   Sample item:`, parsed[0])
        }
        totalItems += parsed.length
      } else {
        console.log(`⚠️ ${key}: Invalid format`, parsed)
      }
    } catch (error) {
      console.log(`❌ ${key}: Parse error`, error.message)
    }
  } else {
    console.log(`❌ ${key}: No data`)
  }
})

console.log(`\n📊 Total items in localStorage: ${totalItems}`)

if (totalItems === 0) {
  console.log('\n🚨 ISSUE FOUND: No data in localStorage!')
  console.log('This means:')
  console.log('1. You haven\'t added any topics/questions in the admin panel yet')
  console.log('2. Or the data isn\'t being saved to localStorage')
  console.log('\n💡 SOLUTION:')
  console.log('1. Go to your admin panel')
  console.log('2. Add some topics, questions, KPIs, etc.')
  console.log('3. Then try the sync button again')
} else {
  console.log('\n✅ Data found in localStorage!')
  console.log('The sync should work. Check browser console for errors when clicking sync button.')
}
