import fs from 'fs';

// Read the current dataMigration.ts file
let content = fs.readFileSync('./src/services/dataMigration.ts', 'utf8');

// Remove the automatic download line
const oldBackupCode = `      // Download backup file
      this.downloadBackupFile(snapshot, backupName)`;

const newBackupCode = `      // Download disabled - only Supabase backup`;

content = content.replace(oldBackupCode, newBackupCode);

// Write the fixed content back
fs.writeFileSync('./src/services/dataMigration.ts', content);

console.log('✅ Removed automatic backup downloads');
