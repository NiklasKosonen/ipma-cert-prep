import { Navigate, useLocation } from 'react-router-dom'
import { useAuthSupabase as useAuth } from '../hooks/useAuthSupabase'
import { UserRole } from '../types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  redirectTo?: string
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles, 
  redirectTo = '/auth' 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  console.log('🛡️ ProtectedRoute check:', { 
    loading, 
    user: user?.email, 
    role: user?.role, 
    allowedRoles, 
    path: location.pathname,
    userObject: user
  })

  if (loading) {
    console.log('⏳ ProtectedRoute: Still loading...')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    console.log('🚫 ProtectedRoute: No user, redirecting to:', redirectTo)
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('🚫 Access denied - User role:', user.role, 'Allowed roles:', allowedRoles, 'Current path:', location.pathname)
    // Redirect to appropriate dashboard based on user role
    const roleRedirects: Record<UserRole, string> = {
      admin: '/admin',
      trainer: '/trainer',
      trainee: '/trainee',
      user: '/user',
    }
    const redirectPath = roleRedirects[user.role] || '/user'
    console.log('🔄 Redirecting to:', redirectPath)
    return <Navigate to={redirectPath} replace />
  }

  console.log('✅ ProtectedRoute: Access granted')
  return <>{children}</>
}
