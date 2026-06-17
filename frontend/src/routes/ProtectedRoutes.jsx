import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

export function AdminRoute({ children }) {
  const { token, isAdmin } = useAuth()
  if (!token)    return <Navigate to="/login" replace />
  if (!isAdmin)  return <Navigate to="/teacher/dashboard" replace />
  return children
}

export function TeacherRoute({ children }) {
  const { token, isTeacher } = useAuth()
  if (!token)     return <Navigate to="/login" replace />
  if (!isTeacher) return <Navigate to="/admin/dashboard" replace />
  return children
}

export function PublicRoute({ children }) {
  const { token, isAdmin } = useAuth()
  if (token) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/teacher/dashboard'} replace />
  }
  return children
}
