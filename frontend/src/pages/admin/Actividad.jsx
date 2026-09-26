import React, { useEffect, useState, useCallback } from 'react'
import { getRegistros } from '../../services/actividadService.js'

const ACCION_COLORS = {
  CREAR: 'bg-green-100 text-green-700',
  EDITAR: 'bg-blue-100 text-blue-700',
  ELIMINAR: 'bg-red-100 text-red-700',
  PUBLICAR: 'bg-leaf-100 text-leaf-700',
  DESPUBLICAR: 'bg-amber-100 text-amber-700',
  ARCHIVAR: 'bg-gray-100 text-gray-600',
  APROBADO: 'bg-green-100 text-green-700',
  RECHAZADO: 'bg-red-100 text-red-700',
  LOGIN: 'bg-uniminuto-100 text-uniminuto-700',
  LOGOUT: 'bg-gray-100 text-gray-600',
}

export default function Actividad() {
  const [registros, setRegistros] = useState([])
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (searchDebounced) params.search = searchDebounced
      const data = await getRegistros(params)
      setRegistros(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [searchDebounced])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[26px] font-bold text-slate-900">Trazabilidad</h1>
        <p className="text-sm text-slate-500 mt-1">Historial de acciones registradas en el sistema.</p>
      </div>

      <div className="relative mb-6 max-w-md">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar en registros..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 skeleton rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 skeleton w-3/4 rounded" />
                <div className="h-3 skeleton w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : registros.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Acción</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Descripción</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Modelo</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Usuario</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${ACCION_COLORS[r.accion] || 'bg-gray-100 text-gray-600'}`}>
                        {r.accion}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-700 max-w-xs truncate">{r.descripcion}</td>
                    <td className="px-5 py-3 text-slate-500">{r.modelo || '-'}</td>
                    <td className="px-5 py-3">
                      <span className="font-medium text-slate-700">{r.usuario_nombre || '-'}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(r.fecha).toLocaleString('es-CO', {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <svg className="w-14 h-14 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-lg mb-1">No hay registros</p>
          <p className="text-gray-400 text-sm">La actividad aparecerá aquí cuando se realicen acciones.</p>
        </div>
      )}
    </div>
  )
}
