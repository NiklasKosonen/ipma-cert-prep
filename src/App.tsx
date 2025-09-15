import { Routes, Route, Navigate } from 'react-router-dom'
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
import { ResetPassword } from './pages/auth/ResetPassword'
import { UpdatePassword } from './pages/auth/UpdatePassword'

// User pages
import { UserHome } from './pages/user/Home'
import { Practice } from './pages/user/Practice'
import { UserHistory } from './pages/user/History'
import ExamSelection from './pages/user/ExamSelection'
import Exam from './pages/user/Exam'
import ExamResults from './pages/user/ExamResults'

// Trainer pages
import { TrainerDashboard } from './pages/trainer/Dashboard'
import { TraineeDashboard } from './pages/trainee/TraineeDashboard'

// Admin pages
import AdminConsole from './pages/admin/AdminConsole'

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
      {user && <Header />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<RolePicker />} />
        <Route path="/auth/user" element={<LoginForm role="user" />} />
        <Route path="/auth/trainer" element={<LoginForm role="trainer" />} />
        <Route path="/auth/admin" element={<LoginForm role="admin" />} />
        <Route path="/auth/reset" element={<ResetPassword />} />
        <Route path="/auth/update-password" element={<UpdatePassword />} />

        {/* Protected User Routes */}
        <Route
          path="/app/home"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserHome />
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
          path="/app/history"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam-selection"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <ExamSelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam/:attemptId"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Exam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam-results/:attemptId"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <ExamResults />
            </ProtectedRoute>
          }
        />

        {/* Protected Trainer Routes */}
        <Route
          path="/coach/dashboard"
          element={
            <ProtectedRoute allowedRoles={['trainer']}>
              <TrainerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainee/dashboard"
          element={
            <ProtectedRoute allowedRoles={['trainee']}>
              <TraineeDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminConsole />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminConsole />
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
