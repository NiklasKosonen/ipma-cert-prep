import fs from 'fs';

// Read the current useAuth.ts file
let content = fs.readFileSync('./src/hooks/useAuth.ts', 'utf8');

// Fix the session restoration issue
const oldSessionCode = `            setSession({ token: sessionToken } as UserSession)
            updateSessionActivity(sessionToken)
            console.log('✅ Restored user session:', { email: userData.email, role: userData.role })`;

const newSessionCode = `            // Find the complete session object
            const sessions = JSON.parse(localStorage.getItem('ipma_sessions') || '[]')
            const completeSession = sessions.find((s) => s.token === sessionToken)
            
            if (completeSession) {
              setSession(completeSession)
              updateSessionActivity(sessionToken)
              console.log('✅ Restored user session:', { email: userData.email, role: userData.role })
            } else {
              // Clear invalid session
              localStorage.removeItem('auth_user')
              localStorage.removeItem('auth_session_token')
              localStorage.removeItem('auth_user_profile')
            }`;

content = content.replace(oldSessionCode, newSessionCode);

// Write the fixed content back
fs.writeFileSync('./src/hooks/useAuth.ts', content);

console.log('✅ Fixed session restoration issue');
