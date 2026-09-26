import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, getUsuarioActual, logout } from '../../services/authService.js'
import { isStaff } from '../../utils/roles.js'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [recoverMsg, setRecoverMsg] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    getUsuarioActual().then(async (u) => {
      if (!cancelled && u) {
        await logout()
      }
    })
    return () => { cancelled = true }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password, form.remember)
      if (isStaff(user)) {
        navigate('/admin/dashboard')
      } else {
        navigate('/')
      }
    } catch (err) {
      const msg = err.response?.data?.detail
      if (msg && msg.includes('Credenciales')) {
        setError('Credenciales inválidas. Verifica tu correo y contraseña.')
      } else {
        setError(msg || 'No se pudo iniciar sesión.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex w-[46%] relative overflow-hidden bg-uniminuto-800 flex-col justify-between p-12 xl:p-16">
<div
        className="absolute inset-0 opacity-20 bg-cover bg-center"
        style={{ backgroundImage: 'linear-gradient(180deg, rgba(26,33,72,.55), rgba(26,33,72,.92)), linear-gradient(135deg, #1a2148 0%, #26327e 50%, #3f64d2 100%)' }}
      />
        <div className="relative flex items-center gap-3">
          <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11m16-11v11" />
          </svg>
          <span className="text-white text-xl font-semibold tracking-[0.18em]">NEXUS ACADÉMICO</span>
        </div>

        <div className="relative max-w-lg">
          <h1 className="text-[44px] xl:text-[52px] font-bold text-white leading-[1.1] mb-5">
            Impulsando el<br />Impacto Social.
          </h1>
          <p className="text-blue-100/90 text-[17px] leading-relaxed">
            Acceda al Portal de Proyección Social para gestionar proyectos, medir
            resultados y conectar la excelencia académica con las necesidades de la comunidad.
          </p>
        </div>

<p className="relative text-blue-100/70 text-xs tracking-[0.14em]">
            © 2026 UNIVERSITY SOCIAL PROJECTION
          </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[440px]">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <svg className="w-8 h-8 text-uniminuto-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11m16-11v11" />
            </svg>
            <span className="text-uniminuto-800 font-semibold tracking-[0.18em]">NEXUS ACADÉMICO</span>
          </div>

          <h2 className="text-[30px] font-bold text-slate-900 mb-1.5">Inicio de Sesión</h2>
          <p className="text-[15px] text-slate-500 mb-8">
            Ingrese sus credenciales institucionales para acceder al portal.
          </p>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label className="block text-[15px] font-semibold text-slate-900 mb-2" htmlFor="email">
              Correo Institucional
            </label>
            <div className="relative mb-5">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                id="email"
                type="email"
                required
                autoComplete="username"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="usuario@universidad.edu"
                className="w-full pl-11 pr-4 py-3 bg-blue-50/60 border border-slate-300 rounded text-[15px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex items-center justify-between mb-2">
              <label className="text-[15px] font-semibold text-slate-900" htmlFor="password">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => setRecoverMsg((v) => !v)}
                className="text-[13px] font-medium text-blue-600 hover:text-blue-700"
              >
                ¿Recuperación de Acceso?
              </button>
            </div>
            <div className="relative mb-4">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••••"
                className="w-full pl-11 pr-11 py-3 bg-blue-50/60 border border-slate-300 rounded text-[15px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {recoverMsg && (
              <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-800 text-[13px] rounded-lg px-4 py-3">
                Para restablecer su acceso, escriba a proyeccion.social@uniminuto.edu.co
                indicando su correo institucional.
              </div>
            )}

            <label className="flex items-center gap-2.5 mb-6 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 accent-uniminuto-600"
              />
              <span className="text-[14px] text-slate-600">Mantener sesión iniciada</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-uniminuto-600 text-white text-[15px] font-semibold rounded hover:bg-uniminuto-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="border-t border-slate-200 mt-8 pt-5 text-center">
            <p className="text-[14px] text-slate-500">
              ¿No tiene una cuenta?{' '}
              <Link to="/registro" className="font-semibold text-teal-700 hover:text-teal-800">
                Solicitar Registro
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}