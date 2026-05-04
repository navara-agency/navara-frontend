import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, getToken, setToken, clearToken } from '../lib/api'

const AuthContext = createContext({
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
})

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken())

  useEffect(() => {
    function handleExpiry() { setIsAuthenticated(false) }
    window.addEventListener('navara:auth:expired', handleExpiry)
    return () => window.removeEventListener('navara:auth:expired', handleExpiry)
  }, [])

  const login = useCallback(async (username, password) => {
    const res = await api.post('/api/auth/login', { username, password }, { auth: false })
    setToken(res.token)
    setIsAuthenticated(true)
    return res
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
