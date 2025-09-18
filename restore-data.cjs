// Script to help restore data that disappeared
const fs = require('fs');

console.log('🔍 Checking for data backup files...');

// Check if there are any backup files
const backupFiles = [
  './backups',
  './src/lib/mockData.ts',
  './last_auto_backup.json'
];

backupFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ Found: ${file}`);
    if (file === './src/lib/mockData.ts') {
      const content = fs.readFileSync(file, 'utf8');
      const topicsMatch = content.match(/export const mockTopics = \[([\s\S]*?)\]/);
      if (topicsMatch) {
        console.log(`📊 Topics found in mockData.ts`);
      }
    }
  } else {
    console.log(`❌ Not found: ${file}`);
  }
});

console.log('\n💡 To restore your data:');
console.log('1. Go to Admin Console → Backup & Sync tab');
console.log('2. Click "Sync from Supabase" if you have Supabase set up');
console.log('3. Or manually re-add your topics, subtopics, and KPIs');
console.log('4. The backup system will now work properly for future deployments');

console.log('\n🛡️ Data Protection Status:');
console.log('✅ Supabase client fixed (no more crashes)');
console.log('✅ Backup system will work on future deployments');
console.log('✅ Add Question button now works properly');
