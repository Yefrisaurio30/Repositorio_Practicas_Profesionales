import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { isStaff } from '../utils/roles.js'

// Única ruta protegida (F1). Reemplaza a RutaPrivada y RutaAutenticada.
export default function RutaProtegida({ children, requiereStaff = false }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-uniminuto-200 border-t-uniminuto-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  if (requiereStaff && !isStaff(user)) return <Navigate to="/unauthorized" replace />

  return children
}
