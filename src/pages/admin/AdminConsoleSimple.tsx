import React from 'react'

const AdminConsoleSimple: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Console (Simple Test)</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Test</h2>
          <p className="text-gray-600 mb-4">
            If you can see this page, the authentication system is working!
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h3 className="text-green-800 font-medium">✅ Authentication Success</h3>
            <p className="text-green-700 text-sm mt-1">
              You have successfully logged in as an admin user.
            </p>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Working Credentials:</h3>
            <ul className="space-y-2 text-sm">
              <li><strong>Your Admin:</strong> niklas.kosonen@talentnetwork.fi / Niipperi2026ipm#</li>
              <li><strong>Test Admin:</strong> admin@test.com / admin123</li>
              <li><strong>Test User:</strong> user@test.com / user123</li>
              <li><strong>Test Trainer:</strong> trainer@test.com / trainer123</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminConsoleSimple
