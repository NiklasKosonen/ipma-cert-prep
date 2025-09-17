import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { LanguageProvider } from './contexts/LanguageContext'
import { DataProvider } from './contexts/DataContext'
import { useAuth } from './hooks/useAuth'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Header } from './components/Header'
import { ErrorBoundary } from './components/ErrorBoundary'

// Pages
import { Landing } from './pages/Landing'
import { RolePicker } from './pages/auth/RolePicker'
import { LoginForm } from './pages/auth/LoginForm'
import { CompanyLogin } from './pages/auth/CompanyLogin'
import { ResetPassword } from './pages/auth/ResetPassword'
import { UpdatePassword } from './pages/auth/UpdatePassword'

// User pages - lazy loaded for better performance
import { UserHome } from './pages/user/Home'
import { Practice } from './pages/user/Practice'
import { UserHistory } from './pages/user/History'

// Lazy load heavy components
const ExamSelection = lazy(() => import('./pages/user/ExamSelection'))
const Exam = lazy(() => import('./pages/user/Exam'))
const ExamResults = lazy(() => import('./pages/user/ExamResults'))

// Trainer pages - lazy loaded
const TrainerDashboard = lazy(() => import('./pages/trainer/Dashboard').then(module => ({ default: module.TrainerDashboard })))
const TraineeDashboard = lazy(() => import('./pages/trainee/TraineeDashboard').then(module => ({ default: module.TraineeDashboard })))

// Admin pages - lazy loaded (largest component)
const AdminConsole = lazy(() => import('./pages/admin/AdminConsole'))

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </LanguageProvider>
    </ErrorBoundary>
  )
}

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<RolePicker />} />
        <Route path="/auth/company" element={<CompanyLogin />} />
        <Route path="/auth/user" element={<LoginForm role="user" />} />
        <Route path="/auth/trainer" element={<LoginForm role="trainer" />} />
        <Route path="/auth/trainee" element={<LoginForm role="trainee" />} />
        <Route path="/auth/admin" element={<LoginForm role="admin" />} />
        <Route path="/auth/reset" element={<ResetPassword />} />
        <Route path="/auth/update-password" element={<UpdatePassword />} />

        {/* Protected User Routes */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserHome />
            </ProtectedRoute>
          }
        />
        {/* Add the missing /app/home route */}
        <Route
          path="/app/home"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserHome />
            </ProtectedRoute>
          }
        />
        {/* Add the missing /app/history route */}
        <Route
          path="/app/history"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/:topicId"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Practice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/history"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/exam-selection"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
                <ExamSelection />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam-selection"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
                <ExamSelection />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/exam/:topicId"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
                <Exam />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam/:attemptId"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
                <Exam />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/exam-results/:attemptId"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
                <ExamResults />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam-results/:attemptId"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
                <ExamResults />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Protected Trainer Routes */}
        <Route
          path="/coach/dashboard"
          element={
            <ProtectedRoute allowedRoles={['trainer']}>
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
                <TrainerDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainee/dashboard"
          element={
            <ProtectedRoute allowedRoles={['trainee']}>
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
                <TraineeDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
                <AdminConsole />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
                <AdminConsole />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Redirect authenticated users away from auth pages */}
        <Route
          path="/auth"
          element={
            user ? (
              <Navigate
                to={
                  user.role === 'admin'
                    ? '/admin'
                    : user.role === 'trainer'
                    ? '/coach/dashboard'
                    : user.role === 'trainee'
                    ? '/trainee/dashboard'
                    : '/app/home'
                }
                replace
              />
            ) : (
              <RolePicker />
            )
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
