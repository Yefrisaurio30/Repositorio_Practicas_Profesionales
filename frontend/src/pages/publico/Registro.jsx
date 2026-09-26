import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../services/authService.js'
import { getPublicadas, getCategorias } from '../../services/publicacionesService.js'

const TIPOS = [
  { value: '', label: 'Selecciona tu rol en la institución o comunidad' },
  { value: 'ESTUDIANTE', label: 'Estudiante' },
  { value: 'DOCENTE', label: 'Docente / Investigador' },
  { value: 'ADMINISTRATIVO', label: 'Administrativo' },
  { value: 'COMUNIDAD', label: 'Comunidad' },
  { value: 'ALIADO', label: 'Aliado externo / ONG' },
]

function fuerzaPassword(pw) {
  if (!pw) return { nivel: 0, label: 'No ingresada', color: 'bg-slate-200' }
  let score = 0
  if (pw.length >= 8) score += 1
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1
  if (/\d/.test(pw)) score += 1
  if (/[^A-Za-z0-9]/.test(pw)) score += 1
  if (score <= 1) return { nivel: 1, label: 'Débil', color: 'bg-red-500' }
  if (score === 2) return { nivel: 2, label: 'Media', color: 'bg-amber-400' }
  if (score === 3) return { nivel: 3, label: 'Buena', color: 'bg-lime-500' }
  return { nivel: 4, label: 'Fuerte', color: 'bg-green-600' }
}

function usernameDesdeEmail(email) {
  const base = (email.split('@')[0] || 'usuario')
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 30) || 'usuario'
  return base
}

export default function Registro() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre_completo: '',
    email: '',
    tipo_afiliacion: '',
    password: '',
    password2: '',
    acepta: false,
  })
  const [showPw, setShowPw] = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ pubs: null, programas: null })
  const fuerza = fuerzaPassword(form.password)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      getPublicadas({ page_size: 1 }).catch(() => null),
      getCategorias().catch(() => []),
    ]).then(([pubs, cats]) => {
      if (cancelled) return
      const lista = Array.isArray(cats) ? cats : cats.results || []
      setStats({ pubs: pubs?.count ?? null, programas: lista.length })
    })
    return () => { cancelled = true }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSuccess('')
    if (!form.acepta) {
      setErrors({ acepta: 'Debes aceptar los términos para continuar.' })
      return
    }
    setLoading(true)
    try {
      const res = await register({
        username: usernameDesdeEmail(form.email),
        email: form.email,
        password: form.password,
        password2: form.password2,
        nombre_completo: form.nombre_completo,
        tipo_afiliacion: form.tipo_afiliacion || 'COMUNIDAD',
      })
      setSuccess((res.detail || 'Cuenta creada.') + ' Tu usuario es: ' + usernameDesdeEmail(form.email))
      setTimeout(() => navigate('/login'), 2200)
    } catch (err) {
      const data = err.response?.data || {}
      const newErrors = {}
      for (const key of Object.keys(data)) {
        const v = data[key]
        newErrors[key] = Array.isArray(v) ? v[0] : String(v)
      }
      if (!Object.keys(newErrors).length) newErrors.general = 'No se pudo crear la cuenta.'
      setErrors(newErrors)
    } finally {
      setLoading(false)
    }
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        <div className="hidden lg:flex w-[46%] relative overflow-hidden bg-uniminuto-800 flex-col justify-between p-12 xl:p-14">
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center"
            style={{ backgroundImage: 'linear-gradient(180deg, rgba(26,33,72,.55), rgba(26,33,72,.92)), url(https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80&auto=format&fit=crop)' }}
          />
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg border border-white/30 bg-white/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
              </svg>
            </div>
            <div className="leading-tight">
              <p className="text-white text-lg font-semibold tracking-[0.12em]">NEXUS <span className="text-blue-200 font-normal">ACADÉMICO</span></p>
              <p className="text-blue-100/70 text-[10px] tracking-[0.2em]">PORTAL UNIVERSITARIO DE PROYECCIÓN SOCIAL</p>
            </div>
          </div>

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-400/40 mb-6">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v5m0 3h.01" />
              </svg>
              Iniciativa de Transformación Territorial
            </span>
            <h1 className="text-[42px] xl:text-[48px] font-bold text-white leading-[1.12] mb-5">
              Sé parte del impacto<br />social universitario.
            </h1>
            <p className="text-blue-100/85 text-[16px] leading-relaxed max-w-md mb-8">
              Regístrate para colaborar, comentar y postular proyectos que vinculan el
              conocimiento científico y humanístico con las necesidades reales de nuestra sociedad.
            </p>
            <div className="border-t border-white/15 pt-6 grid grid-cols-2 gap-4 max-w-md">
              <div className="rounded-lg border border-white/15 bg-white/5 p-4">
                <p className="text-[26px] font-bold text-blue-200">+{stats.pubs ?? '···'}</p>
                <p className="text-blue-100/75 text-[13px] leading-snug">Publicaciones en el portal</p>
              </div>
              <div className="rounded-lg border border-white/15 bg-white/5 p-4">
                <p className="text-[26px] font-bold text-green-300">+{stats.programas ?? '···'}</p>
                <p className="text-blue-100/75 text-[13px] leading-snug">Programas académicos vinculados</p>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-between text-blue-100/70 text-[13px]">
            <span className="inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11m16-11v11" />
              </svg>
              Vicerrectoría de Extensión y Desarrollo Social
            </span>
            <span className="font-semibold">RF-01 / Mod. Registro</span>
          </div>
        </div>

        <div className="flex-1 flex items-start sm:items-center justify-center p-6 sm:p-10 bg-white overflow-y-auto">
          <div className="w-full max-w-[520px] py-6">
            <div className="flex items-start justify-between gap-4 mb-1.5">
              <h2 className="text-[28px] font-bold text-slate-900">Crear una Cuenta</h2>
              <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold whitespace-nowrap mt-1.5">
                Paso 1 de 1
              </span>
            </div>
            <p className="text-[14px] text-slate-500 mb-7">
              Ingresa tus datos institucionales o comunitarios para comenzar.
            </p>

            {success && (
              <div className="mb-5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
                {success}
              </div>
            )}
            {errors.general && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label className="block text-[14px] font-semibold text-slate-900 mb-1.5" htmlFor="nombre">
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <div className="relative mb-5">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a3 3 0 106 0 3 3 0 00-6 0zm12 5a3 3 0 01-6 0" />
                </svg>
                <input
                  id="nombre"
                  value={form.nombre_completo}
                  onChange={(e) => set('nombre_completo', e.target.value)}
                  required
                  maxLength={35}
                  placeholder="Ej. Dra. María Elena Vargas Peña"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded text-[14px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[14px] font-semibold text-slate-900" htmlFor="email">
                  Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Institucional o de entidad aliada</span>
              </div>
              <div className="relative mb-5">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  required
                  placeholder="nombre.apellido@universidad.edu"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded text-[14px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors"
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username}</p>}
              </div>

              <label className="block text-[14px] font-semibold text-slate-900 mb-1.5" htmlFor="tipo">
                Tipo de Usuario / Afiliación <span className="text-red-500">*</span>
              </label>
              <div className="relative mb-5">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <select
                  id="tipo"
                  value={form.tipo_afiliacion}
                  onChange={(e) => set('tipo_afiliacion', e.target.value)}
                  required
                  className="w-full pl-10 pr-9 py-2.5 border border-slate-300 rounded text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors appearance-none bg-white"
                >
                  {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[14px] font-semibold text-slate-900 mb-1.5" htmlFor="pw">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input
                      id="pw"
                      type={showPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => set('password', e.target.value)}
                      required
                      placeholder="Mínimo 8 caracteres"
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded text-[14px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors"
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Mostrar contraseña">
                      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-slate-900 mb-1.5" htmlFor="pw2">
                    Confirmar Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <input
                      id="pw2"
                      type={showPw2 ? 'text' : 'password'}
                      value={form.password2}
                      onChange={(e) => set('password2', e.target.value)}
                      required
                      placeholder="Repite la contraseña"
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded text-[14px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors"
                    />
                    <button type="button" onClick={() => setShowPw2((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Mostrar contraseña">
                      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              {(errors.password || errors.password2) && (
                <p className="text-xs text-red-600 mb-2">{errors.password || errors.password2}</p>
              )}

              <div className="mb-5">
                <div className="flex items-center justify-between text-[12px] mb-1.5">
                  <span className="text-slate-500">Fortaleza de contraseña:</span>
                  <span className="text-slate-400">{fuerza.label}</span>
                </div>
                <div className="flex gap-1.5 mb-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= fuerza.nivel ? fuerza.color : 'bg-slate-200'}`} />
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">Usa al menos 8 caracteres con letras mayúsculas, números y símbolos.</p>
              </div>

              <label className="flex items-start gap-3 mb-6 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.acepta}
                  onChange={(e) => set('acepta', e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 accent-uniminuto-600 flex-shrink-0"
                />
                <span className="text-[13px] text-slate-600 leading-relaxed">
                  He leído y acepto los <span className="text-blue-600 font-medium">Términos de Servicio</span> y autorizo el
                  tratamiento de mis datos conforme a la <span className="text-blue-600 font-medium">Política de Privacidad Institucional</span> para
                  fines de investigación y proyección social. <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.acepta && <p className="text-xs text-red-600 -mt-4 mb-4">{errors.acepta}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-uniminuto-600 text-white text-[15px] font-semibold rounded hover:bg-uniminuto-700 disabled:opacity-60 transition-colors shadow-sm inline-flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                {loading ? 'Creando cuenta...' : 'Registrarse'}
              </button>
            </form>

            <p className="text-center text-[14px] text-slate-500 mt-6">
              ¿Ya tienes una cuenta registrada?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 underline">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-100/70 border-t border-blue-200/60 px-6 py-3 flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-[12px] text-slate-500">
        <span className="font-semibold tracking-[0.14em]">NEXUS ACADÉMICO</span>
        <span className="hidden sm:inline text-slate-300">•</span>
        <span>© 2026 University Social Projection Portal. All rights reserved.</span>
        <span className="flex gap-5 sm:ml-auto text-uniminuto-800 font-medium">
          <span className="cursor-pointer hover:underline">Institutional Repository</span>
          <span className="cursor-pointer hover:underline">Privacy Policy</span>
          <span className="cursor-pointer hover:underline">Contact Support</span>
          <span className="cursor-pointer hover:underline">Terms of Service</span>
        </span>
      </div>
    </div>
  )
}