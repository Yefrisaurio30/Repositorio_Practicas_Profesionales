import React, { useEffect, useState, useCallback } from 'react'
import { getUsuarios, actualizarUsuario, eliminarUsuario } from '../../services/usuariosService.js'
import { register } from '../../services/authService.js'

const PAGE_SIZE = 8

const AVATAR_COLORS = [
  'bg-uniminuto-800 text-white',
  'bg-blue-600 text-white',
  'bg-slate-300 text-slate-600',
  'bg-teal-700 text-white',
]

function avatarColor(username) {
  let h = 0
  for (const ch of username || '') h = (h * 31 + ch.charCodeAt(0)) % 997
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

function rolDe(u) {
  if (u.is_superuser) return { label: 'Admin', pill: 'bg-uniminuto-800 text-white' }
  if ((u.roles || []).includes('Superadmin')) return { label: 'Admin', pill: 'bg-uniminuto-800 text-white' }
  if (u.is_staff || (u.roles || []).length > 0) return { label: 'Moderator', pill: 'bg-blue-600 text-white' }
  return { label: 'Usuario', pill: 'bg-slate-200 text-slate-600' }
}

function AddUserModal({ open, onClose }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({ username: '', email: '', password: '', password2: '' })
      setError('')
    }
  }, [open ])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await register(form)
      onClose(true)
    } catch (err) {
      const data = err.response?.data || {}
      const first = Object.values(data).flat()[0]
      setError(typeof first === 'string' ? first : 'No se pudo crear el usuario.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4" onClick={() => onClose(false)}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-uniminuto-800 mb-1">Añadir Usuario</h2>
        <p className="text-sm text-slate-500 mb-5">Crea una cuenta con acceso al portal.</p>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Usuario *</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              placeholder="nombre de usuario" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo electrónico *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              placeholder="correo@universidad.edu" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña *</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmar *</label>
              <input type="password" value={form.password2} onChange={(e) => setForm({ ...form, password2: e.target.value })} required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                placeholder="••••••••" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={() => onClose(false)}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 bg-uniminuto-600 text-white text-sm font-semibold rounded-lg hover:bg-uniminuto-700 disabled:opacity-60 transition-colors">
              {saving ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchDebounced(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (searchDebounced) params.search = searchDebounced
      const data = await getUsuarios(params)
      setUsuarios(Array.isArray(data) ? data : data.results || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [searchDebounced])

  useEffect(() => { fetchData() }, [fetchData])

  const mostrarError = (err, porDefecto) => {
    const d = err.response?.data
    const msg = d?.detail || (typeof d === 'object' ? Object.values(d).flat().join(' ') : d) || porDefecto
    alert(msg)
  }

  const toggleActivo = async (u) => {
    try {
      await actualizarUsuario(u.id, { is_active: !u.is_active })
      fetchData()
    } catch (err) {
      mostrarError(err, 'Error al cambiar el estado.')
    }
  }

  const toggleStaff = async (u) => {
    try {
      await actualizarUsuario(u.id, { is_staff: !u.is_staff })
      fetchData()
    } catch (err) {
      mostrarError(err, 'Error al cambiar el rol.')
    }
  }

  const handleEliminar = async (u) => {
    if (!confirm(`¿Desea eliminar al usuario "${u.username}"?`)) return
    try {
      await eliminarUsuario(u.id)
      fetchData()
    } catch (err) {
      mostrarError(err, 'Error al eliminar.')
    }
  }

  const totalPages = Math.max(1, Math.ceil(usuarios.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const visibles = usuarios.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const from = usuarios.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const to = Math.min(usuarios.length, safePage * PAGE_SIZE)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900">Gestión de Usuarios</h1>
          <p className="text-sm text-slate-500 mt-1">
            Administre los roles y el acceso al portal de proyección social.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar usuarios..."
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-uniminuto-600 text-white text-sm font-semibold rounded-lg hover:bg-uniminuto-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Añadir Usuario
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Nombre</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Correo Electrónico</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Rol</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Estado</th>
                <th className="text-right px-6 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="px-6 py-4" colSpan="5"><div className="h-10 skeleton rounded" /></td>
                  </tr>
                ))
              ) : visibles.length > 0 ? (
                visibles.map((u) => {
                  const rol = rolDe(u)
                  const nombre = u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : u.username
                  return (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${avatarColor(u.username)}`}>
                            {(nombre[0] || '?').toUpperCase()}{(nombre.split(' ')[1]?.[0] || '').toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800">{nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">{u.email || '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${rol.pill}`}>
                          {rol.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          u.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {u.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        {u.is_superuser ? (
                          <span className="text-xs text-slate-400 flex justify-end">Protegido</span>
                        ) : (
                          <div className="flex justify-end gap-0.5">
                            <button onClick={() => toggleStaff(u)}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                              title={u.is_staff ? 'Quitar rol de moderador' : 'Hacer moderador'}>
                              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            </button>
                            <button onClick={() => toggleActivo(u)}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                              title={u.is_active ? 'Desactivar' : 'Activar'}>
                              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-9 0h10m-10 0a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2m-9 0V5" />
                              </svg>
                            </button>
                            <button onClick={() => handleEliminar(u)}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Eliminar">
                              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100">
          <p className="text-[13px] text-slate-500">
            Mostrando {from} a {to} de {usuarios.length} usuarios
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors"
              aria-label="Anterior"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
              aria-label="Siguiente"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <AddUserModal open={modalOpen} onClose={(ok) => { setModalOpen(false); if (ok) fetchData() }} />
    </div>
  )
}