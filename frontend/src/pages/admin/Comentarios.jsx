import React, { useEffect, useState, useCallback } from 'react'
import {
  getComentariosAdmin,
  aprobarComentario,
  rechazarComentario,
} from '../../services/comentariosService.js'

const TABS = [
  { key: 'PENDIENTE', label: 'Pendientes' },
  { key: 'APROBADO', label: 'Aprobados' },
  { key: 'RECHAZADO', label: 'Rechazados' },
]

const PILL = {
  PENDIENTE: 'bg-blue-50 text-blue-700',
  APROBADO: 'bg-green-50 text-green-700',
  RECHAZADO: 'bg-red-50 text-red-600',
}

const PILL_LABEL = { PENDIENTE: 'Pendiente', APROBADO: 'Aprobado', RECHAZADO: 'Rechazado' }

function tiempoRelativo(fechaISO) {
  const ahora = new Date()
  const fecha = new Date(fechaISO)
  const diffMs = ahora - fecha
  const minutos = Math.floor(diffMs / 60000)
  if (minutos < 1) return 'ahora mismo'
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`
  const dias = Math.floor(horas / 24)
  if (dias < 30) return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`
  return fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ComentarioCard({ comentario, activeTab, onRefresh }) {
  const [rejecting, setRejecting] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [expandido, setExpandido] = useState(false)
  const LIMITE = 160
  const esLargo = comentario.contenido.length > LIMITE
  const textoMostrar = !esLargo || expandido ? comentario.contenido : comentario.contenido.slice(0, LIMITE) + '…'

  const handleAprobar = async () => {
    setLoading(true)
    try {
      await aprobarComentario(comentario.id)
      onRefresh()
    } catch (err) {
      alert('Error: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleRechazar = async () => {
    setLoading(true)
    try {
      await rechazarComentario(comentario.id, motivo)
      setRejecting(false)
      setMotivo('')
      onRefresh()
    } catch (err) {
      alert('Error: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {comentario.usuario_nombre?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-slate-900 truncate">{comentario.usuario_nombre}</p>
                <p className="text-xs text-slate-500">
                  {tiempoRelativo(comentario.fechaCreacion)}
                  <span className="mx-1">•</span>
                  Project: {comentario.publicacion_titulo}
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium flex-shrink-0 ${PILL[comentario.estado]}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {PILL_LABEL[comentario.estado] || comentario.estado}
            </span>
          </div>

          <p className="text-sm text-slate-700 leading-snug line-clamp-3">{textoMostrar}</p>
          {esLargo && !rejecting && (
            <button onClick={() => setExpandido(!expandido)} className="text-xs font-medium text-blue-600 hover:text-blue-700 mt-1">
              {expandido ? 'Ver menos' : 'Ver más'}
            </button>
          )}

          {comentario.motivoRechazo && (
            <div className="mt-3 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <p className="text-xs text-red-700">
                <span className="font-semibold">Motivo del rechazo:</span> {comentario.motivoRechazo}
              </p>
            </div>
          )}

          {rejecting && (
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Motivo del rechazo (opcional)"
                className="flex-1 px-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleRechazar}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => { setRejecting(false); setMotivo('') }}
                  className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {activeTab === 'PENDIENTE' && !rejecting && (
          <div className="flex md:flex-col gap-2 md:w-36 flex-shrink-0 md:border-l md:border-slate-200 md:pl-4">
            <button
              onClick={handleAprobar}
              disabled={loading}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-uniminuto-600 text-white text-sm font-semibold rounded-lg hover:bg-uniminuto-700 disabled:opacity-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {loading ? '...' : 'Aprobar'}
            </button>
            <button
              onClick={() => setRejecting(true)}
              disabled={loading}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-red-300 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Rechazar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Comentarios() {
  const [comentarios, setComentarios] = useState([])
  const [counts, setCounts] = useState({ PENDIENTE: 0, APROBADO: 0, RECHAZADO: 0 })
  const [activeTab, setActiveTab] = useState('PENDIENTE')
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const fetchComentarios = useCallback(async () => {
    setLoading(true)
    try {
      const params = { estado: activeTab }
      if (searchDebounced) params.search = searchDebounced
      const [res, ...totales] = await Promise.all([
        getComentariosAdmin(params),
        ...TABS.filter((t) => t.key !== activeTab).map((t) => getComentariosAdmin({ estado: t.key })),
      ])
      setComentarios(res.results || res)
      const newCounts = { [activeTab]: res.count ?? (res.results || res).length }
      TABS.filter((t) => t.key !== activeTab).forEach((t, i) => {
        const r = totales[i]
        newCounts[t.key] = r.count ?? (r.results || r).length
      })
      setCounts(newCounts)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [activeTab, searchDebounced])

  useEffect(() => { fetchComentarios() }, [fetchComentarios])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-uniminuto-800">Moderación de Comentarios</h1>
        <p className="text-sm text-slate-500 mt-1">
          Revisa y gestiona los comentarios de la comunidad en los proyectos activos.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 mb-5 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-600 mr-1">Filtrar por estado:</span>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold border transition-colors ${
                activeTab === t.key
                  ? 'bg-uniminuto-600 text-white border-uniminuto-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
              }`}
            >
              {t.label}{t.key === 'PENDIENTE' ? ` (${counts.PENDIENTE})` : ''}
            </button>
          ))}
        </div>
        <div className="relative lg:ml-auto lg:w-80">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar comentarios o autores..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 skeleton rounded-full" />
                <div className="space-y-1.5">
                  <div className="h-4 skeleton w-28 rounded" />
                  <div className="h-3 skeleton w-44 rounded" />
                </div>
              </div>
              <div className="h-12 skeleton w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : comentarios.length > 0 ? (
        <div className="grid gap-4">
          {comentarios.map((c) => (
            <ComentarioCard key={c.id} comentario={c} activeTab={activeTab} onRefresh={fetchComentarios} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <svg className="w-14 h-14 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-slate-500 text-lg mb-1">No hay comentarios en esta bandeja</p>
          <p className="text-slate-400 text-sm">La cola de moderación está vacía.</p>
        </div>
      )}
    </div>
  )
}