import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  getPublicacionAdmin,
  getPublicacionesAdmin,
  getCategorias,
  actualizarPublicacion,
  eliminarPublicacion,
  cambiarEstado,
} from '../../services/publicacionesService.js'
import { getDashboard } from '../../services/reportesService.js'

const ESTADOS = {
  BORRADOR: { label: 'Borrador', pill: 'bg-slate-100 text-slate-600' },
  EN_REVISION: { label: 'En Revisión', pill: 'bg-blue-50 text-blue-700' },
  PUBLICADA: { label: 'Publicado', pill: 'bg-green-50 text-green-700' },
  ARCHIVADA: { label: 'Archivado', pill: 'bg-slate-100 text-slate-600' },
}

function codigo(pub) {
  const year = pub.fechaCreacion ? new Date(pub.fechaCreacion).getFullYear() : new Date().getFullYear()
  return `PROJ-${year}-${String(pub.id).padStart(3, '0')}`
}

function formatearNumero(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.', ',').replace(',0', '')}k`
  return String(n || 0)
}

function Modal({ open, onClose, initial, categorias }) {
  const [form, setForm] = useState({})

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              titulo: initial.titulo || '',
              resumen: initial.resumen || '',
              contenido: initial.contenido || '',
              categoria: initial.categoria || '',
              estado: initial.estado || 'BORRADOR',
            }
          : { titulo: '', resumen: '', contenido: '', categoria: '', estado: 'BORRADOR' }
      )
    }
  }, [open, initial])

  if (!open) return null

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await actualizarPublicacion(initial.id, form)
      onClose(true)
    } catch (err) {
      alert('Error al guardar la publicación: ' + (err.response?.data?.message || err.message))
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4" onClick={() => onClose(false)}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-uniminuto-800 mb-4">Editar Publicación</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Título *</label>
            <input name="titulo" value={form.titulo || ''} onChange={handleChange} required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Resumen</label>
            <textarea name="resumen" value={form.resumen || ''} onChange={handleChange} rows="3"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Contenido *</label>
            <textarea name="contenido" value={form.contenido || ''} onChange={handleChange} rows="6" required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoría *</label>
              <select name="categoria" value={form.categoria || ''} onChange={handleChange} required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400">
                <option value="">Seleccionar...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Estado</label>
              <select name="estado" value={form.estado || 'BORRADOR'} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400">
                {Object.entries(ESTADOS).map(([value, cfg]) => (
                  <option key={value} value={value}>{cfg.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => onClose(false)}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors">
              Cancelar
            </button>
            <button type="submit"
              className="px-5 py-2.5 bg-uniminuto-600 text-white text-sm font-semibold rounded-lg hover:bg-uniminuto-700 transition-colors">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Publicaciones() {
  const [publicaciones, setPublicaciones] = useState([])
  const [categorias, setCategorias] = useState([])
  const [kpis, setKpis] = useState({ total: 0, publicadas: 0, en_revision: 0, borradores: 0 })
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [programaFiltro, setProgramaFiltro] = useState('')
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [pageSize, setPageSize] = useState(12)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchDebounced(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => { setPage(1) }, [estadoFiltro, categoriaFiltro, programaFiltro])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page }
      if (searchDebounced) params.search = searchDebounced
      if (estadoFiltro) params.estado = estadoFiltro
      if (categoriaFiltro) params.categoria = categoriaFiltro
      if (programaFiltro) params.programa = programaFiltro
      const [pubRes, dashRes, catRes] = await Promise.all([
        getPublicacionesAdmin(params),
        getDashboard().catch(() => null),
        categorias.length ? Promise.resolve(categorias) : getCategorias(),
      ])
      const results = pubRes.results || pubRes
      setPublicaciones(results)
      setCount(pubRes.count || results.length)
      setPageSize(results.length || 12)
      if (!categorias.length) setCategorias(catRes.results || catRes)
      if (dashRes?.publicaciones) {
        const p = dashRes.publicaciones
        setKpis({ total: p.total || 0, publicadas: p.publicadas || 0, en_revision: p.en_revision || 0, borradores: p.borradores || 0 })
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [page, searchDebounced, estadoFiltro, categoriaFiltro, programaFiltro]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    const editarId = searchParams.get('editar')
    if (!editarId) return
    getPublicacionAdmin(editarId)
      .then((pub) => {
        setEditing(pub)
        setModalOpen(true)
      })
      .catch(() => {})
      .finally(() => setSearchParams({}))
  }, [searchParams, setSearchParams])

  const handleEstado = async (pub, nuevoEstado) => {
    try {
      await cambiarEstado(pub.id, nuevoEstado)
      fetchData()
    } catch (err) {
      alert('Error al cambiar el estado: ' + (err.response?.data?.detail || err.message))
    }
  }

  const handleEliminar = async (pub) => {
    if (!confirm(`¿Desea eliminar la publicación "${pub.titulo}"?`)) return
    try {
      await eliminarPublicacion(pub.id)
      fetchData()
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const params = {}
      if (searchDebounced) params.search = searchDebounced
      if (estadoFiltro) params.estado = estadoFiltro
      if (categoriaFiltro) params.categoria = categoriaFiltro
      let results = []
      let nextPage = 1
      for (let i = 0; i < 50; i++) {
        const res = await getPublicacionesAdmin({ ...params, page: nextPage })
        const rows = res.results || res
        results = results.concat(rows)
        if (!res.next) break
        nextPage += 1
      }
      const header = 'id;codigo;titulo;categoria;autor;estado;fecha_creacion;vistas;comentarios\n'
      const csv = results.map((p) =>
        [p.id, codigo(p), `"${(p.titulo || '').replace(/"/g, '""')}"`,
          `"${(p.categoria_detail?.nombre || '').replace(/"/g, '""')}"`,
          p.usuario_nombre || '', ESTADOS[p.estado]?.label || p.estado,
          p.fechaCreacion || '', p.vistas || 0, p.comentarios_count || 0].join(';')
      ).join('\n')
      const blob = new Blob(['\ufeff' + header + csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'publicaciones.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Error al exportar.')
    } finally {
      setExporting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(count / pageSize))
  const from = count === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(count, page * pageSize)

  const pageNumbers = () => {
    const nums = []
    for (let i = 1; i <= Math.min(totalPages, 3); i++) nums.push(i)
    if (totalPages > 4) nums.push('...')
    if (totalPages > 3) nums.push(totalPages)
    return nums
  }

  const KPIS = [
    { label: 'Total Iniciativas', value: kpis.total, valueClass: 'text-slate-900',
      icon: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z', iconClass: 'text-blue-600' },
    { label: 'Publicados', value: kpis.publicadas, valueClass: 'text-green-600',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', iconClass: 'text-green-500' },
    { label: 'En Revisión', value: kpis.en_revision, valueClass: 'text-blue-600',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', iconClass: 'text-blue-500' },
    { label: 'Borradores', value: kpis.borradores, valueClass: 'text-slate-900',
      icon: 'M4 6h16M4 12h16M4 18h10', iconClass: 'text-slate-500' },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900">Gestión de Publicaciones</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitorea, edita, aprueba o archiva las publicaciones y proyectos de proyección social.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/publicaciones/nueva')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-uniminuto-600 text-white text-sm font-semibold rounded-lg hover:bg-uniminuto-700 transition-colors shadow-sm whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Publicación
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {KPIS.map((k) => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{k.label}</p>
              <p className={`text-[28px] leading-tight font-bold ${k.valueClass}`}>{k.value}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <svg className={`w-5 h-5 ${k.iconClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={k.icon} />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5">
        <div className="flex flex-col xl:flex-row xl:items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, docente, código..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <label className="flex items-center gap-2 text-slate-500">
              Estado:
              <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200">
                <option value="">Todos</option>
                {Object.entries(ESTADOS).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-slate-500">
              Categoría:
              <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 max-w-[200px]">
                <option value="">Todas las Categorías</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-slate-500">
              Programa:
              <select value={programaFiltro} onChange={(e) => setProgramaFiltro(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 max-w-[200px]">
                <option value="">Todos los Programas</option>
                <option value="Tecnología en Comunicación Gráfica">Tecnología en Comunicación Gráfica</option>
                <option value="Tecnología en Desarrollo de Software">Tecnología en Desarrollo de Software</option>
                <option value="Trabajo Social">Trabajo Social</option>
                <option value="Administración de Empresas">Administración de Empresas</option>
                <option value="Administración en Seguridad y Salud en el Trabajo">Administración en Seguridad y Salud en el Trabajo</option>
                <option value="Administración Financiera">Administración Financiera</option>
                <option value="Comunicación Social - Periodismo">Comunicación Social - Periodismo</option>
                <option value="Comunicación Visual">Comunicación Visual</option>
                <option value="Contaduría Pública">Contaduría Pública</option>
                <option value="Ingeniería Agroecológica">Ingeniería Agroecológica</option>
                <option value="Licenciatura en Educación Infantil">Licenciatura en Educación Infantil</option>
                <option value="Psicología">Psicología</option>
              </select>
            </label>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
              title="Exportar CSV"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Título del Proyecto</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Categoría</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Autor / Facultad</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Fecha</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Métricas</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="px-5 py-4" colSpan="7"><div className="h-10 skeleton rounded" /></td>
                  </tr>
                ))
              ) : publicaciones.length > 0 ? (
                publicaciones.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors align-top">
                    <td className="px-5 py-4 max-w-[260px]">
                      <p className="font-semibold text-slate-900 leading-snug mb-0.5">{p.titulo}</p>
                      <p className="text-[11px] text-slate-400">COD: {codigo(p)}</p>
                      {p.programa_nombre && (
                        <p className="text-[11px] text-blue-600 mt-0.5 inline-flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
                          </svg>
                          Programa: {p.programa_nombre}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                        {p.categoria_detail?.nombre || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="font-medium text-slate-800">{p.usuario_nombre}</p>
                      <p className="text-xs text-slate-400">{p.autor_rol}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-500 whitespace-nowrap text-[13px]">
                      {p.fechaPublicacion
                        ? new Date(p.fechaPublicacion).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : new Date(p.fechaCreacion).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ESTADOS[p.estado]?.pill || 'bg-slate-100 text-slate-600'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {ESTADOS[p.estado]?.label || p.estado}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[13px] text-slate-500">
                      <span className="inline-flex items-center gap-1 mr-3" title="Vistas">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {formatearNumero(p.vistas)}
                      </span>
                      <span className="inline-flex items-center gap-1" title="Comentarios">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        {p.comentarios_count || 0}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex justify-end gap-0.5">
                        <button onClick={() => { setEditing(p); setModalOpen(true); }}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors" title="Editar">
                          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <Link to={`/publicacion/${p.id}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors" title="Ver">
                          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        {p.estado === 'EN_REVISION' ? (
                          <button onClick={() => handleEstado(p, 'PUBLICADA')}
                            className="p-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors" title="Publicar">
                            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        ) : p.estado !== 'ARCHIVADA' ? (
                          <button onClick={() => handleEstado(p, 'ARCHIVADA')}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors" title="Archivar">
                            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v12a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                          </button>
                        ) : (
                          <button onClick={() => handleEstado(p, 'BORRADOR')}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors" title="Restaurar a borrador">
                            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H2m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        )}
                        <button onClick={() => handleEliminar(p)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors" title="Eliminar">
                          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-slate-400">
                    No hay publicaciones con estos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-3.5 bg-slate-50/70 border-t border-slate-100">
          <p className="text-[13px] text-slate-500">
            Mostrando <strong className="text-slate-700">{from} a {to}</strong> de <strong className="text-slate-700">{count}</strong> publicaciones
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-[13px] font-medium border border-slate-200 rounded-lg text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              ‹ Anterior
            </button>
            {pageNumbers().map((n, i) =>
              n === '...' ? (
                <span key={`e${i}`} className="px-1 text-slate-400 text-sm">...</span>
              ) : (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 text-[13px] font-semibold rounded-lg transition-colors ${
                    n === page ? 'bg-uniminuto-600 text-white' : 'border border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                  }`}
                >
                  {n}
                </button>
              )
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-[13px] font-medium border border-slate-200 rounded-lg text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              Siguiente ›
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={(refrescar) => {
          setModalOpen(false)
          setEditing(null)
          if (refrescar) fetchData()
        }}
        initial={editing}
        categorias={categorias}
      />
    </div>
  )
}