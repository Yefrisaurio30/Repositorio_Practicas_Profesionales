import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  getPublicacionesAdmin,
  eliminarPublicacion,
  enviarRevision,
} from '../../services/publicacionesService.js'

const ESTADOS = {
  BORRADOR: { label: 'Borrador', pill: 'bg-slate-100 text-slate-600' },
  EN_REVISION: { label: 'En Revisión', pill: 'bg-blue-50 text-blue-700' },
  PUBLICADA: { label: 'Publicado', pill: 'bg-green-50 text-green-700' },
  ARCHIVADA: { label: 'Archivado', pill: 'bg-slate-100 text-slate-600' },
}

export default function MisProyectos() {
  const [propuestas, setPropuestas] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getPublicacionesAdmin()
      setPropuestas(res.results || res)
    } catch {
      setPropuestas([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleEliminar = async (p) => {
    if (!confirm(`¿Desea eliminar su propuesta "${p.titulo}"?`)) return
    try {
      await eliminarPublicacion(p.id)
      fetchData()
    } catch {
      alert('Error al eliminar.')
    }
  }

  const handleEnviar = async (p) => {
    try {
      await enviarRevision(p.id)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al enviar a revisión.')
    }
  }

  return (
    <div className="pt-[68px] bg-[#f4f7fb] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[26px] font-bold text-uniminuto-800">Mis Proyectos y Propuestas</h1>
            <p className="text-sm text-slate-500 mt-1">
              Crea propuestas, sigue su estado y edítalas. El administrador las revisará antes de publicarlas.
            </p>
          </div>
          <Link
            to="/mis-proyectos/nueva"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-uniminuto-600 text-white text-sm font-semibold rounded-lg hover:bg-uniminuto-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Propuesta
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 h-28 skeleton" />
            ))}
          </div>
        ) : propuestas.length > 0 ? (
          <div className="grid gap-4">
            {propuestas.map((p) => (
              <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ESTADOS[p.estado]?.pill || 'bg-slate-100 text-slate-600'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {ESTADOS[p.estado]?.label || p.estado}
                      </span>
                      {p.categoria_detail && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                          {p.categoria_detail.nombre}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 leading-snug mb-1">{p.titulo}</h3>
                    {p.resumen && <p className="text-sm text-slate-500 line-clamp-2">{p.resumen}</p>}
                    {p.estado === 'BORRADOR' && (
                      <p className="text-xs text-amber-600 mt-1.5">
                        Esta propuesta aún no fue enviada. Envíala a revisión para que el administrador la evalúe.
                      </p>
                    )}
                    {p.estado === 'EN_REVISION' && (
                      <p className="text-xs text-blue-600 mt-1.5">
                        En revisión por el administrador. Te avisaremos cuando sea aceptada o devuelta.
                      </p>
                    )}
                  </div>
                  <div className="flex md:flex-col gap-2 flex-shrink-0">
                    {p.estado !== 'PUBLICADA' && p.estado !== 'ARCHIVADA' && (
                      <Link
                        to={`/mis-proyectos/${p.id}/editar`}
                        className="px-4 py-2 bg-slate-100 text-slate-700 text-[13px] font-semibold rounded-lg hover:bg-slate-200 transition-colors text-center"
                      >
                        Editar
                      </Link>
                    )}
                    {p.estado === 'BORRADOR' && (
                      <button
                        onClick={() => handleEnviar(p)}
                        className="px-4 py-2 bg-uniminuto-600 text-white text-[13px] font-semibold rounded-lg hover:bg-uniminuto-700 transition-colors"
                      >
                        Enviar a Revisión
                      </button>
                    )}
                    {p.estado === 'PUBLICADA' && (
                      <Link
                        to={`/publicacion/${p.id}`}
                        className="px-4 py-2 bg-green-50 text-green-700 text-[13px] font-semibold rounded-lg hover:bg-green-100 transition-colors text-center"
                      >
                        Ver en portal
                      </Link>
                    )}
                    <button
                      onClick={() => handleEliminar(p)}
                      className="px-4 py-2 bg-white border border-red-200 text-red-600 text-[13px] font-semibold rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
            <svg className="w-14 h-14 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-500 text-lg mb-1">Aún no tienes propuestas</p>
            <p className="text-slate-400 text-sm mb-6">Crea tu primera propuesta de proyecto de proyección social.</p>
            <Link
              to="/mis-proyectos/nueva"
              className="px-6 py-2.5 bg-uniminuto-600 text-white text-sm font-semibold rounded-lg hover:bg-uniminuto-700 transition-colors"
            >
              Crear propuesta
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}