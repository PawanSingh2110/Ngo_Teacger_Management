import { createContext, useContext, useState, useCallback } from 'react'
import { authApi } from '../services/apiServices'

const AuthContext = createContext(null)

const USER_KEY  = 'ngo_user'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem(USER_KEY))
      if (user?.role) return { token: 'cookie', user }
    } catch {
      // Invalid stored user data is cleared below.
    }
    localStorage.removeItem('ngo_token')
    localStorage.removeItem(USER_KEY)
    return { token: null, user: null }
  })

  const { token, user } = session

  const login = useCallback((authResponse) => {
    localStorage.removeItem('ngo_token')
    localStorage.setItem(USER_KEY, JSON.stringify({
      userId:   authResponse.userId,
      email:    authResponse.email,
      fullName: authResponse.fullName,
      role:     authResponse.role,
    }))
    setSession({ token: 'cookie', user: {
      userId:   authResponse.userId,
      email:    authResponse.email,
      fullName: authResponse.fullName,
      role:     authResponse.role,
    } })
  }, [])

  const logout = useCallback(() => {
    authApi.logout().catch(() => {})
    localStorage.removeItem('ngo_token')
    localStorage.removeItem(USER_KEY)
    setSession({ token: null, user: null })
  }, [])

  const isAdmin   = user?.role === 'SUPER_ADMIN'
  const isTeacher = user?.role === 'TEACHER'

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAdmin, isTeacher }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
