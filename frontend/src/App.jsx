import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

import theme from './theme'
import { AuthProvider } from './contexts/AuthContext'
import {
  PublicRoute, AdminRoute, TeacherRoute
} from './routes/ProtectedRoutes'

import AdminLayout  from './layouts/AdminLayout'
import TeacherLayout from './layouts/TeacherLayout'

// Pages
import LoginPage         from './pages/auth/LoginPage'
import AdminDashboard    from './pages/admin/AdminDashboard'
import AdminTeachers     from './pages/admin/AdminTeachers'
import AdminCenters      from './pages/admin/AdminCenters'
import AdminPrograms     from './pages/admin/AdminPrograms'
import AdminAttendance   from './pages/admin/AdminAttendance'
import AdminShifts       from './pages/admin/AdminShifts'
import AdminSettings     from './pages/admin/AdminSettings'

import TeacherDashboard  from './pages/teacher/TeacherDashboard'
import MarkAttendancePage from './pages/teacher/MarkAttendancePage'
import LogoutAttendancePage from './pages/teacher/LogoutAttendancePage'
import AttendanceHistory from './pages/teacher/AttendanceHistory'
import TeacherProfile    from './pages/teacher/TeacherProfile'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <Routes className="">
              {/* Public */}
              <Route path="/login" element={
                <PublicRoute><LoginPage /></PublicRoute>
              } />

              {/* Admin */}
              <Route path="/admin" element={
                <AdminRoute><AdminLayout /></AdminRoute>
              }>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard"  element={<AdminDashboard />} />
                <Route path="teachers"   element={<AdminTeachers />} />
                <Route path="centers"    element={<AdminCenters />} />
                <Route path="programs"   element={<AdminPrograms />} />
                <Route path="attendance" element={<AdminAttendance />} />
                <Route path="reports"    element={<AdminAttendance />} />
                <Route path="shifts"     element={<AdminShifts />} />
                <Route path="settings"   element={<AdminSettings />} />
              </Route>

              {/* Teacher */}
              <Route path="/teacher" element={
                <TeacherRoute><TeacherLayout /></TeacherRoute>
              }>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard"  element={<TeacherDashboard />} />
                <Route path="attendance" element={<MarkAttendancePage />} />
                <Route path="logout-attendance" element={<LogoutAttendancePage />} />
                <Route path="history"    element={<AttendanceHistory />} />
                <Route path="profile"    element={<TeacherProfile />} />
              </Route>

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { fontFamily: 'Inter, sans-serif', borderRadius: '10px' },
            success: { iconTheme: { primary: '#2e7d32', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#d32f2f', secondary: '#fff' } },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
