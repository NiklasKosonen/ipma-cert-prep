// Debug localStorage data
console.log('🔍 Checking localStorage data...')

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
      } else if (Array.isArray(parsed)) {
        console.log(`✅ ${key}: ${parsed.length} items (old format)`)
        if (parsed.length > 0) {
          console.log(`   Sample item:`, parsed[0])
        }
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

console.log('\n📊 Summary:')
const totalItems = storageKeys.reduce((total, key) => {
  const data = localStorage.getItem(key)
  if (data) {
    try {
      const parsed = JSON.parse(data)
      if (parsed && typeof parsed === 'object' && parsed.data && Array.isArray(parsed.data)) {
        return total + parsed.data.length
      } else if (Array.isArray(parsed)) {
        return total + parsed.length
      }
    } catch (error) {
      // ignore
    }
  }
  return total
}, 0)

console.log(`Total items in localStorage: ${totalItems}`)
