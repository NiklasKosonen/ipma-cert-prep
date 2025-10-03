import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useAuthSupabase as useAuth } from '../../hooks/useAuthSupabase'
import { useLanguage } from '../../contexts/LanguageContext'
import { UserRole } from '../../types'

interface LoginFormProps {
  role: UserRole
}

export const LoginForm = ({ role }: LoginFormProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  const getDefaultRedirect = (selectedRole: UserRole): string => {
    switch (selectedRole) {
      case 'admin':
        return '/admin'
      case 'trainer':
        return '/trainer'
      case 'trainee':
        return '/trainee'
      case 'user':
        return '/user'
      default:
        return '/'
    }
  }

  const from = (location.state as any)?.from?.pathname || getDefaultRedirect(role)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🔐 Attempting login:', { email, role, redirectTo: from })
      const { data, error } = await signIn(email, password, role)
      console.log('🔐 Login response:', { data, error })
      
      if (error) {
        console.log('❌ Login error:', error)
        setError(error)
        setLoading(false)
        return
      } 
      
      if (data && data.user) {
        console.log('✅ Login successful, navigating to:', from)
        console.log('✅ User data:', data.user)
        console.log('✅ User role:', data.user.role)
        console.log('✅ From location:', from)
        
        // Navigate immediately without delay
        navigate(from, { replace: true })
      } else {
        console.log('❌ Login failed - no data or user')
        setError('Login failed - please try again')
        setLoading(false)
      }
    } catch (err) {
      console.log('❌ Login exception:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  const getRoleTitle = () => {
    switch (role) {
      case 'admin':
        return t('auth.rolePicker.admin')
      case 'trainer':
        return t('auth.rolePicker.trainer')
      case 'user':
        return t('auth.rolePicker.user')
      default:
        return 'Login'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">IPMA</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {getRoleTitle()} {t('auth.login')}
          </h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10">
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="label">
                {t('auth.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                to="/auth/reset"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>

            {error && (
              <div className="error-text text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : t('auth.login')}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/auth"
                className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-500"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to role selection
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
