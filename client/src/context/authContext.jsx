import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api/api'

const AuthContext = createContext(null)

const TOKEN_KEY = 'traveloop_token'
const USER_KEY  = 'traveloop_user'

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })
  const [token, setToken]     = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  /* ── Persist helpers ──────────────────────────────────────── */
  const persist = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  const clear = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  /* ── Listen for global 401 from api.js interceptor ───────── */
  useEffect(() => {
    const handle = () => clear()
    window.addEventListener('auth:logout', handle)
    return () => window.removeEventListener('auth:logout', handle)
  }, [clear])

  /* ── Verify token on mount ────────────────────────────────── */
  useEffect(() => {
    if (!token) { setLoading(false); return }
    authAPI.me()
      .then(({ data }) => setUser(data.user ?? data))
      .catch(() => clear())
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Auth actions ─────────────────────────────────────────── */
  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    persist(data.token, data.user)
    return data.user
  }, [persist])

  const register = useCallback(async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password })
    persist(data.token, data.user)
    return data.user
  }, [persist])

  const logout = useCallback(() => clear(), [clear])

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
