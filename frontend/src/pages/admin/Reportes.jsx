import React, { useEffect, useState, useCallback } from 'react'
import { getDashboard } from '../../services/reportesService.js'
import { getPublicacionesAdmin, getCategorias } from '../../services/publicacionesService.js'

function downloadCSV(rows, filename) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function Reportes() {
  const [dashboard, setDashboard] = useState(null)
  const [publicaciones, setPublicaciones] = useState([])
  const [categorias, setCategorias] = useState([])
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getDashboard().catch(() => null),
      getCategorias().catch(() => []),
    ]).then(([d, c]) => {
      setDashboard(d)
      setCategorias(c)
    }).finally(() => setLoading(false))
  }, [])

  const fetchPublicaciones = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filtroCategoria) params.categoria = filtroCategoria
      if (filtroEstado) params.estado = filtroEstado
      const res = await getPublicacionesAdmin(params)
      setPublicaciones(res.results || res)
    } catch {
      setPublicaciones([])
    } finally {
      setLoading(false)
    }
  }, [filtroCategoria, filtroEstado])

  useEffect(() => { fetchPublicaciones() }, [fetchPublicaciones])

  const filteredPubs = publicaciones.filter((p) => {
    if (!fechaDesde && !fechaHasta) return true
    const f = new Date(p.fechaCreacion)
    if (fechaDesde && f < new Date(fechaDesde)) return false
    if (fechaHasta && f > new Date(fechaHasta + 'T23:59:59')) return false
    return true
  })

  const exportarCSV = () => {
    const rows = filteredPubs.map((p) => ({
      ID: p.id,
      Titulo: p.titulo,
      Categoria: p.categoria_detail?.nombre || p.categoria,
      Estado: p.estado,
      'Fecha Creacion': new Date(p.fechaCreacion).toLocaleDateString('es-CO'),
      'Fecha Publicacion': p.fechaPublicacion ? new Date(p.fechaPublicacion).toLocaleDateString('es-CO') : '',
    }))
    downloadCSV(rows, `reporte_publicaciones_${new Date().toISOString().slice(0, 10)}.csv`)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="text-sm text-gray-500 mt-1">Genera y exporta reportes del sistema (RF-26 a RF-30).</p>
      </div>

      {dashboard && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-100 rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-uniminuto-600">{dashboard.publicaciones?.total || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Publicaciones totales</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-leaf-600">{dashboard.comentarios?.total || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Comentarios totales</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-amber-600">{dashboard.usuarios || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Usuarios registrados</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Filtros de reporte (RF-29)</h3>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Categoría</label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-uniminuto-200"
            >
              <option value="">Todas</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-uniminuto-200"
            >
              <option value="">Todos</option>
              <option value="BORRADOR">Borrador</option>
              <option value="PUBLICADA">Publicada</option>
              <option value="ARCHIVADA">Archivada</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-uniminuto-200"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-uniminuto-200"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={exportarCSV}
              disabled={filteredPubs.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-leaf-600 text-white text-sm font-medium rounded-lg hover:bg-leaf-700 disabled:opacity-40 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar CSV ({filteredPubs.length})
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 skeleton w-full rounded" />)}
        </div>
      ) : filteredPubs.length > 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Título</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Categoría</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Estado</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Creación</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Publicación</th>
                </tr>
              </thead>
              <tbody>
                {filteredPubs.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-medium text-gray-900 max-w-xs truncate">{p.titulo}</td>
                    <td className="px-5 py-3 text-gray-600">{p.categoria_detail?.nombre || '-'}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                        p.estado === 'PUBLICADA' ? 'bg-green-100 text-green-700'
                        : p.estado === 'BORRADOR' ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                      }`}>{p.estado}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(p.fechaCreacion).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {p.fechaPublicacion ? new Date(p.fechaPublicacion).toLocaleDateString('es-CO') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500">No se encontraron publicaciones con los filtros aplicados.</p>
        </div>
      )}
    </div>
  )
}
