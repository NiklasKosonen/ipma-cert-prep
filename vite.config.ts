import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
          'admin-chunk': [
            './src/pages/admin/AdminConsole.tsx',
            ''
          ],
          'user-chunk': [
            './src/pages/user/Home.tsx',
            './src/pages/user/Exam.tsx',
            './src/pages/user/ExamResults.tsx',
            './src/pages/user/ExamSelection.tsx',
            './src/pages/user/Practice.tsx',
            './src/pages/user/History.tsx'
          ],
          'trainer-chunk': [
            './src/pages/trainer/Dashboard.tsx',
            './src/pages/trainee/TraineeDashboard.tsx'
          ],
          'auth-chunk': [
            './src/pages/auth/RolePicker.tsx',
            './src/pages/auth/LoginForm.tsx',
            './src/pages/auth/ResetPassword.tsx',
            './src/pages/auth/UpdatePassword.tsx'
          ]
        }
      }
    }
  }
})
