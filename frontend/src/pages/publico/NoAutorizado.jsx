import React from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../services/authService.js'

export default function NoAutorizado() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    const res = await logout()
    if (res.ok) {
      navigate('/login', { replace: true })
    } else {
      alert('No se pudo cerrar sesión: ' + res.error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso restringido</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          Tu cuenta no tiene permisos de administrador para acceder al panel.
          Si crees que es un error, contacta al administrador del sistema.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-uniminuto-600 text-white text-sm font-semibold rounded-xl hover:bg-uniminuto-700 transition-colors shadow-sm"
          >
            Cerrar sesion
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  )
}