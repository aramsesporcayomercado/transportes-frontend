import { createContext, useState, useEffect, useCallback } from 'react'
import { getMe, logout as apiLogout } from '../api/auth'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = sessionStorage.getItem('access_token')
    
    if (token) {
      getMe()
        .then(setUser)
        .catch(() => sessionStorage.removeItem('access_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])
useEffect(() => {
    const handler = () => {
      setUser(null)
      sessionStorage.removeItem('access_token')
    }
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [])
  const login  = useCallback((usuario) => setUser(usuario), [])
  const logout = useCallback(async () => {
    await apiLogout()
    setUser(null)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: 'var(--color-surface)' }}>
        <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
          Cargando...
        </span>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}