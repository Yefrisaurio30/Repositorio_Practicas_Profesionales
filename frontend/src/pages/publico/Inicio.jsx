import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getPublicadas, getCategorias } from '../../services/publicacionesService.js'

function mesAnio(fechaISO) {
  if (!fechaISO) return ''
  return new Date(fechaISO).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })
    .replace('.', '')
    .replace(/^./, (c) => c.toUpperCase())
}

function ProjectCard({ pub }) {
  const fecha = mesAnio(pub.fechaPublicacion || pub.fechaCreacion)
  const activo = pub.estado !== 'ARCHIVADA'
  return (
    <Link
      to={`/publicacion/${pub.id}`}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col"
    >
      <div className="aspect-[16/10] overflow-hidden relative bg-blue-50">
        {pub.portada ? (
          <img src={pub.portada} alt={pub.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
            <svg className="w-14 h-14 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium truncate">
            {pub.categoria_detail?.nombre || 'General'}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {fecha}
          </span>
        </div>
        <h3 className="text-[17px] font-bold text-uniminuto-800 leading-snug mb-2 line-clamp-2">
          {pub.titulo}
        </h3>
        {pub.resumen && (
          <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1 leading-relaxed">
            {pub.resumen}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
            activo ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'
          }`}>
            {activo ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            )}
            {activo ? 'Proyecto Activo' : 'Completado'}
          </span>
          <span className="text-blue-600 text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            Ver detalles
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="aspect-[16/10] skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-5 skeleton w-1/3 rounded" />
        <div className="h-5 skeleton w-3/4" />
        <div className="h-4 skeleton w-full" />
        <div className="h-4 skeleton w-2/3" />
      </div>
    </div>
  )
}

const ESTADOS = [
  { value: '', label: 'Cualquiera' },
  { value: 'PUBLICADA', label: 'En Curso' },
  { value: 'ARCHIVADA', label: 'Completado' },
]

export default function Inicio() {
  const [publicaciones, setPublicaciones] = useState([])
  const [categorias, setCategorias] = useState([])
  const [stats, setStats] = useState({ activos: 0, completados: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [categoria, setCategoria] = useState('')
  const [estado, setEstado] = useState('')
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [pageSize, setPageSize] = useState(12)

  useEffect(() => {
    getCategorias()
      .then((data) => setCategorias(data.results || data))
      .catch(() => {})
    Promise.all([
      getPublicadas({ estado: 'PUBLICADA', page_size: 1 }).catch(() => null),
      getPublicadas({ estado: 'ARCHIVADA', page_size: 1 }).catch(() => null),
    ]).then(([a, c]) => {
      setStats({ activos: a?.count || 0, completados: c?.count || 0 })
    })
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchDebounced(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => { setPage(1) }, [categoria, estado])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, ordering: '-fechaPublicacion' }
      if (searchDebounced) params.search = searchDebounced
      if (categoria) params.categoria = categoria
      if (estado) params.estado = estado
      const res = await getPublicadas(params)
      const results = res.results || []
      setPublicaciones(results)
      setCount(res.count || 0)
      setPageSize(results.length || 12)
    } catch {
      setPublicaciones([])
    } finally {
      setLoading(false)
    }
  }, [page, searchDebounced, categoria, estado])

  useEffect(() => { fetchData() }, [fetchData])

  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  const radioCls = (checked) =>
    `w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
      checked ? 'border-blue-600' : 'border-slate-300'
    }`

  return (
    <div className="pt-[68px] bg-[#f4f7fb] min-h-screen">
      <section className="bg-[#e9f1f9] border-b border-slate-200/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-14 pb-12 text-center">
          <h1 className="text-[32px] sm:text-[40px] font-bold text-slate-900 tracking-tight mb-4">
            Innovación para un Futuro Mejor
          </h1>
          <p className="text-slate-500 text-[15px] sm:text-base leading-relaxed max-w-2xl mx-auto mb-8">
            Descubre los proyectos de proyección social de nuestra universidad. Impulsando el
            cambio comunitario a través de la excelencia académica y la colaboración interdisciplinaria.
          </p>
          <div className="relative max-w-2xl mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar publicaciones, proyectos o investigadores..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-[15px] shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <aside className="w-full lg:w-60 flex-shrink-0 space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-[15px] font-bold text-uniminuto-800 mb-4">Programas</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="radio" name="prog" checked={categoria === ''} onChange={() => setCategoria('')} className="sr-only" />
                  <span className={radioCls(categoria === '')}>
                    {categoria === '' && (
                      <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={3} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    )}
                  </span>
                  <span className={`text-[13px] leading-snug ${categoria === '' ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                    Todos los programas
                  </span>
                </label>
                {categorias.map((c) => (
                  <label key={c.id} className="flex items-start gap-2.5 cursor-pointer">
                    <input type="radio" name="prog" checked={String(categoria) === String(c.id)} onChange={() => setCategoria(c.id)} className="sr-only" />
                    <span className={radioCls(String(categoria) === String(c.id))}>
                      {String(categoria) === String(c.id) && (
                        <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={3} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      )}
                    </span>
                    <span className={`text-[13px] leading-snug ${String(categoria) === String(c.id) ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                      {c.nombre}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-[15px] font-bold text-uniminuto-800 mb-4">Estado</h3>
              <div className="space-y-3">
                {ESTADOS.map((e) => (
                  <label key={e.value} className="flex items-center gap-2.5 cursor-pointer">
                    <input type="radio" name="est" checked={estado === e.value} onChange={() => setEstado(e.value)} className="sr-only" />
                    <span className={radioCls(estado === e.value)}>
                      {estado === e.value && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
                    </span>
                    <span className={`text-[13px] ${estado === e.value ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                      {e.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : publicaciones.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {publicaciones.map((pub) => <ProjectCard key={pub.id} pub={pub} />)}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                <svg className="w-14 h-14 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-slate-500 text-lg mb-1">Sin resultados</p>
                <p className="text-slate-400 text-sm">Prueba con otros filtros o términos de búsqueda.</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                  aria-label="Anterior"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-9 h-9 text-sm font-semibold rounded-lg transition-colors ${
                      n === page ? 'bg-uniminuto-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                {totalPages > 4 && <span className="text-slate-400 text-sm px-1">...</span>}
                {totalPages > 3 && (
                  <button
                    onClick={() => setPage(totalPages)}
                    className={`w-9 h-9 text-sm font-semibold rounded-lg transition-colors ${
                      totalPages === page ? 'bg-uniminuto-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {totalPages}
                  </button>
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                  aria-label="Siguiente"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="impacto" className="bg-white border-y border-slate-200/70 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-uniminuto-800 text-center mb-2">Impacto en cifras</h2>
          <p className="text-slate-500 text-center text-sm mb-8">
            Resultados de la proyección social universitaria publicados en el portal.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
            <div className="rounded-xl border border-slate-200 p-6 text-center">
              <p className="text-3xl font-bold text-uniminuto-800">{stats.activos}</p>
              <p className="text-sm text-slate-500 mt-1">Proyectos activos</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-6 text-center">
              <p className="text-3xl font-bold text-green-600">{stats.completados}</p>
              <p className="text-sm text-slate-500 mt-1">Proyectos completados</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-6 text-center">
              <p className="text-3xl font-bold text-blue-600">{categorias.length}</p>
              <p className="text-sm text-slate-500 mt-1">Programas académicos</p>
            </div>
          </div>
        </div>
      </section>

      <section id="acerca" className="scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
          <h2 className="text-2xl font-bold text-uniminuto-800 mb-3">Acerca del portal</h2>
          <p className="text-slate-500 text-[15px] leading-relaxed">
            El Portal de Proyección Social de UNIMINUTO visibiliza los proyectos que vinculan el
            conocimiento académico con las necesidades de las comunidades. Aquí puedes explorar
            iniciativas, conocer sus resultados y enviar solicitudes a la Dirección de Proyección Social.
          </p>
        </div>
      </section>
    </div>
  )
}