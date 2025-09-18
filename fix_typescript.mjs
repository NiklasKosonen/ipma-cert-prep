import fs from 'fs';

// Read the current useAuth.ts file
let content = fs.readFileSync('./src/hooks/useAuth.ts', 'utf8');

// Fix the TypeScript error by adding type annotation
const oldCode = `            const completeSession = sessions.find((s) => s.token === sessionToken)`;

const newCode = `            const completeSession = sessions.find((s: UserSession) => s.token === sessionToken)`;

content = content.replace(oldCode, newCode);

// Write the fixed content back
fs.writeFileSync('./src/hooks/useAuth.ts', content);

console.log('✅ Fixed TypeScript error');
