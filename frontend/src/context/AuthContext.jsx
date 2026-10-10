import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsuarioActual, login as apiLogin, logout as apiLogout } from '../services/authService.js'

// Evento que dispara services/api.js ante un 401 (F2). Lleva la ruta actual
// para volver con ?next= tras iniciar sesión.
export const UNAUTH_EVENT = 'auth:unauthorized'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const refresh = useCallback(async () => {
    try {
      setUser(await getUsuarioActual())
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    getUsuarioActual()
      .then((u) => {
        if (!cancelled) setUser(u)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Redirección 401 sin recarga completa (F2).
  useEffect(() => {
    const handler = (e) => {
      setUser(null)
      const next = e.detail?.next || '/'
      navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true })
    }
    window.addEventListener(UNAUTH_EVENT, handler)
    return () => window.removeEventListener(UNAUTH_EVENT, handler)
  }, [navigate])

  const login = useCallback(async (username, password, remember) => {
    const u = await apiLogin(username, password, remember)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(async () => {
    const res = await apiLogout()
    if (res.ok) setUser(null)
    return res
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
