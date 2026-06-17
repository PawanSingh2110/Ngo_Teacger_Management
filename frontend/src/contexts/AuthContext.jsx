import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'ngo_token'
const USER_KEY  = 'ngo_user'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    try {
      const user = JSON.parse(localStorage.getItem(USER_KEY))
      if (token && user?.role) return { token, user }
    } catch {
      // Invalid local storage is cleared below.
    }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    return { token: null, user: null }
  })

  const { token, user } = session

  const login = useCallback((authResponse) => {
    localStorage.setItem(TOKEN_KEY, authResponse.accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify({
      userId:   authResponse.userId,
      email:    authResponse.email,
      fullName: authResponse.fullName,
      role:     authResponse.role,
    }))
    setSession({ token: authResponse.accessToken, user: {
      userId:   authResponse.userId,
      email:    authResponse.email,
      fullName: authResponse.fullName,
      role:     authResponse.role,
    } })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
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
