import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { LanguageProvider } from './contexts/LanguageContext'
import { DataProvider } from './contexts/DataContext'
import { useAuth } from './hooks/useAuth'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ProtectedLayout } from './components/ProtectedLayout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useAutoBackup, useDeploymentDetection } from './hooks/useAutoBackup'

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
const AdminConsole = lazy(() => import('./pages/admin/AdminConsoleSimple'))

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
  const { loading } = useAuth()
  
  // Initialize automatic backup system
  useAutoBackup({
    enabled: true,
    interval: 30, // 30 minutes
    beforeUnload: true,
    beforeDeploy: true
  })
  
  // Detect deployments
  useDeploymentDetection()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />
        
        {/* Auth Routes */}
        <Route path="/auth" element={<Navigate to="/auth/company" replace />} />
        <Route path="/auth/company" element={<CompanyLogin />} />
        <Route path="/auth/reset" element={<ResetPassword />} />
        <Route path="/auth/update-password" element={<UpdatePassword />} />

        {/* Hidden Admin Routes */}
        <Route path="/admin-login" element={<RolePicker />} />
        <Route path="/admin-login/user" element={<LoginForm role="user" />} />
        <Route path="/admin-login/trainer" element={<LoginForm role="trainer" />} />
        <Route path="/admin-login/trainee" element={<LoginForm role="trainee" />} />
        <Route path="/admin-login/admin" element={<LoginForm role="admin" />} />

        {/* Protected User Routes */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ProtectedLayout>
                <UserHome />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/home"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ProtectedLayout>
                <UserHome />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/history"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ProtectedLayout>
                <UserHistory />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/:topicId"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ProtectedLayout>
                <Practice />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/history"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ProtectedLayout>
                <UserHistory />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/exam-selection"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ProtectedLayout>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
                  <ExamSelection />
                </Suspense>
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam-selection"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ProtectedLayout>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
                  <ExamSelection />
                </Suspense>
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/exam/:topicId"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ProtectedLayout>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
                  <Exam />
                </Suspense>
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam/:attemptId"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ProtectedLayout>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
                  <Exam />
                </Suspense>
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/exam-results/:attemptId"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ProtectedLayout>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
                  <ExamResults />
                </Suspense>
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam-results/:attemptId"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ProtectedLayout>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
                  <ExamResults />
                </Suspense>
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Trainer Routes */}
        <Route
          path="/coach/dashboard"
          element={
            <ProtectedRoute allowedRoles={["trainer"]}>
              <ProtectedLayout>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
                  <TrainerDashboard />
                </Suspense>
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainee/dashboard"
          element={
            <ProtectedRoute allowedRoles={["trainee"]}>
              <ProtectedLayout>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
                  <TraineeDashboard />
                </Suspense>
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ProtectedLayout>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
                  <AdminConsole />
                </Suspense>
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ProtectedLayout>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
                  <AdminConsole />
                </Suspense>
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

         {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
