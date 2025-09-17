import { Link } from 'react-router-dom'
import { User, GraduationCap, Settings, Building2 } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'

export const RolePicker = () => {
  const { t } = useLanguage()

  const roles = [
    {
      id: 'company',
      title: 'Company Login',
      description: 'Login with your company code',
      icon: Building2,
      path: '/auth/company',
      color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
    },
    {
      id: 'user',
      title: t('roleUser'),
      description: t('roleUserDesc'),
      icon: User,
      path: '/auth/user',
      color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
    },
    {
      id: 'trainee',
      title: t('roleTrainee'),
      description: t('roleTraineeDesc'),
      icon: GraduationCap,
      path: '/auth/trainee',
      color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
    },
    {
      id: 'admin',
      title: t('roleAdmin'),
      description: t('roleAdminDesc'),
      icon: Settings,
      path: '/auth/admin',
      color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">IPMA</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t('appTitle')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('appSubtitle')}
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10">
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-8">
            {t('rolePickerTitle')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role) => {
              const Icon = role.icon
              return (
                <Link
                  key={role.id}
                  to={role.path}
                  className={`p-6 rounded-2xl border-2 transition-all duration-200 ${role.color}`}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2">{role.title}</h4>
                    <p className="text-sm opacity-80">{role.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
