import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getDashboard } from '../../services/reportesService.js'
import { eliminarPublicacion } from '../../services/publicacionesService.js'

const ESTADO_PILL = {
  PUBLICADA: 'bg-green-50 text-green-700 border-green-200',
  BORRADOR: 'bg-blue-50 text-blue-700 border-blue-200',
  EN_REVISION: 'bg-blue-50 text-blue-700 border-blue-200',
  ARCHIVADA: 'bg-red-50 text-red-600 border-red-200',
}

const ESTADO_LABEL = {
  PUBLICADA: 'Publicado',
  BORRADOR: 'Borrador',
  EN_REVISION: 'En Revisión',
  ARCHIVADA: 'Archivado',
}

function SkeletonKpi() {
  return <div className="bg-white rounded-xl border border-slate-200 p-5 h-36 skeleton" />
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => setError('Error al cargar el tablero.'))
      .finally(() => setLoading(false))
  }, [])

  const handleEliminar = async (pub) => {
    if (!confirm(`¿Desea eliminar la publicación "${pub.titulo}"?`)) return
    try {
      await eliminarPublicacion(pub.id)
      const fresh = await getDashboard()
      setData(fresh)
    } catch {
      alert('Error al eliminar la publicación.')
    }
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 text-sm">{error}</div>
  }

  const pub = data?.publicaciones || {}
  const com = data?.comentarios || {}
  const recientes = data?.publicaciones_recientes || []
  const pendientes = com.pendientes || 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-uniminuto-800">Resumen del Tablero</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitorear la participación institucional y la moderación de contenido.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        {loading ? (
          <><SkeletonKpi /><SkeletonKpi /><SkeletonKpi /></>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                  +{pub.nuevas || 0} nuevas este mes
                </span>
              </div>
              <p className="text-sm text-slate-500">Publicaciones Totales</p>
              <p className="text-[32px] leading-tight font-bold text-slate-900">
                {(pub.total || 0).toLocaleString('es-CO')}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                {pendientes > 0 ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
                    Requiere Atención
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                    Al día
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">Comentarios Pendientes</p>
              <p className="text-[32px] leading-tight font-bold text-slate-900">{pendientes}</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  +{pub.nuevas || 0} nuevos
                </span>
              </div>
              <p className="text-sm text-slate-500">Proyectos en Curso</p>
              <p className="text-[32px] leading-tight font-bold text-slate-900">{pub.publicadas || 0}</p>
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-[17px] font-bold text-uniminuto-800">Publicaciones Recientes</h2>
          <Link
            to="/admin/publicaciones"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            Ver todos
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/70">
                <th className="text-left px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Título</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Autor</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Fecha</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Estado</th>
                <th className="text-right px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="px-6 py-4"><div className="h-4 skeleton w-56 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 skeleton w-28 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 skeleton w-20 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-6 skeleton w-20 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-4 skeleton w-14 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : recientes.length > 0 ? (
                recientes.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-slate-800 max-w-[280px] truncate">{r.titulo}</td>
                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{r.autor}</td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(r.fecha).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${ESTADO_PILL[r.estado] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {ESTADO_LABEL[r.estado] || r.estado}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => navigate(`/admin/publicaciones?editar=${r.id}`)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEliminar(r)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-400">
                    No hay publicaciones aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}