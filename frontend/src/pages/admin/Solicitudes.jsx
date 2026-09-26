import React, { useEffect, useState, useCallback } from 'react'
import { getSolicitudes, cambiarEstadoSolicitud, eliminarSolicitud } from '../../services/solicitudesService.js'

const ESTADOS = {
  RECIBIDA: { label: 'Recibida', color: 'bg-uniminuto-100 text-uniminuto-700' },
  EN_PROCESO: { label: 'En proceso', color: 'bg-amber-100 text-amber-700' },
  RESUELTA: { label: 'Resuelta', color: 'bg-green-100 text-green-700' },
  CERRADA: { label: 'Cerrada', color: 'bg-gray-100 text-gray-600' },
}

const TIPO_COLOR = {
  SOLICITUD: 'bg-blue-100 text-blue-700',
  PETICION: 'bg-purple-100 text-purple-700',
  QUEJA: 'bg-red-100 text-red-700',
  RECLAMO: 'bg-orange-100 text-orange-700',
  SUGERENCIA: 'bg-teal-100 text-teal-700',
}

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([])
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (searchDebounced) params.search = searchDebounced
      if (filtroEstado) params.estado = filtroEstado
      const data = await getSolicitudes(params)
      setSolicitudes(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      setError('No se pudieron cargar las solicitudes.')
    } finally {
      setLoading(false)
    }
  }, [searchDebounced, filtroEstado])

  useEffect(() => { fetchData() }, [fetchData])

  const handleEstado = async (s, estado) => {
    try {
      await cambiarEstadoSolicitud(s.id, estado)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al cambiar el estado.')
    }
  }

  const handleEliminar = async (s) => {
    if (!confirm(`Desea eliminar la solicitud "${s.asunto}"?`)) return
    try {
      await eliminarSolicitud(s.id)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al eliminar la solicitud.')
    }
  }

  const RESUELTO = ['RESUELTA', 'CERRADA']

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Solicitudes y Peticiones</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestiona las PQRS recibidas desde el portal publico.
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo o asunto..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-uniminuto-200 focus:border-uniminuto-400"
          />
        </div>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-uniminuto-200 focus:border-uniminuto-400"
        >
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS).map(([value, cfg]) => (
            <option key={value} value={value}>{cfg.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 skeleton rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 skeleton w-2/3 rounded" />
                <div className="h-3 skeleton w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : solicitudes.length > 0 ? (
        <div className="space-y-4">
          {solicitudes.map((s) => (
            <div key={s.id} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-uniminuto-100 text-uniminuto-700 flex items-center justify-center font-semibold uppercase flex-shrink-0">
                    {s.nombre[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${TIPO_COLOR[s.tipo] || 'bg-gray-100 text-gray-600'}`}>
                        {s.tipo_display || s.tipo}
                      </span>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${ESTADOS[s.estado]?.color || 'bg-gray-100 text-gray-600'}`}>
                        {s.estado_display || s.estado}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 leading-snug">{s.asunto}</h3>
                    <p className="text-xs text-gray-500 mb-1">
                      {s.nombre} · {s.email}
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-2">{s.mensaje}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(s.fecha).toLocaleString('es-CO', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex lg:flex-col gap-2 lg:items-end flex-shrink-0">
                  {s.estado === 'RECIBIDA' && (
                    <button
                      onClick={() => handleEstado(s, 'EN_PROCESO')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                    >
                      Poner en proceso
                    </button>
                  )}
                  {!RESUELTO.includes(s.estado) && (
                    <button
                      onClick={() => handleEstado(s, 'RESUELTA')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                    >
                      Marcar resuelta
                    </button>
                  )}
                  <button
                    onClick={() => handleEliminar(s)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <svg className="w-14 h-14 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p className="text-gray-500 text-lg mb-1">No hay solicitudes</p>
          <p className="text-gray-400 text-sm">Las solicitudes del portal apareceran aqui.</p>
        </div>
      )}
    </div>
  )
}