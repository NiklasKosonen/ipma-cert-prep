import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, Globe } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../contexts/LanguageContext'
import { languages } from '../contexts/LanguageContext'

export const Header = () => {
  const { user, signOut } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setShowUserMenu(false)
  }

  const handleLanguageChange = (newLanguage: typeof language) => {
    setLanguage(newLanguage)
    setShowLanguageMenu(false)
  }

  const getRoleBasedHome = () => {
    if (!user) return '/'
    switch (user.role) {
      case 'admin':
        return '/admin'
      case 'trainer':
        return '/coach/dashboard'
      case 'user':
        return '/app/home'
      default:
        return '/'
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Enterprise Style */}
          <Link to={getRoleBasedHome()} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-accent-500 rounded-xl flex items-center justify-center group-hover:bg-accent-600 transition-colors duration-200">
              <span className="text-white font-bold text-sm">IPMA</span>
            </div>
            <span className="font-bold text-gray-900 hidden sm:block text-lg">
              {t('app.title')}
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Language Selector - Enterprise Style */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <Globe className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">{language.flag}</span>
              </button>
              
              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang)}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center space-x-3 transition-colors ${
                        language.code === lang.code ? 'bg-primary-50 text-primary-800 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Menu - Enterprise Style */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors border ${
                    user.role === 'admin' ? 'role-admin' : 
                    user.role === 'trainer' ? 'role-trainer' : 
                    'role-user'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-semibold">{user.email}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 text-xs font-semibold text-gray-500 border-b border-gray-100 uppercase tracking-wide">
                      {user.role} Account
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-3 text-sm text-error-600 hover:bg-error-50 flex items-center space-x-3 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('auth.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="btn-primary"
              >
                {t('auth.login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
