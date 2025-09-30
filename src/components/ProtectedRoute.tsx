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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('🚫 Access denied - User role:', user.role, 'Allowed roles:', allowedRoles, 'Current path:', location.pathname)
    // Redirect to appropriate dashboard based on user role
    const roleRedirects: Record<UserRole, string> = {
      admin: '/admin',
      trainer: '/coach/dashboard',
      trainee: '/trainee/dashboard',
      user: '/user/dashboard',
    }
    return <Navigate to={roleRedirects[user.role]} replace />
  }

  return <>{children}</>
}
