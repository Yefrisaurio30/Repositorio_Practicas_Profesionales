import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getPublicadas, getCategorias } from '../../services/publicacionesService.js'
import axios from 'axios'
import Filtros from './Filtros.jsx'

const API_URL = import.meta.env.VITE_API_URL || '/api/publicaciones'

function PublicationCard({ pub }) {
  const fecha = pub.fechaPublicacion
    ? new Date(pub.fechaPublicacion).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : ''

  return (
    <Link
      to={`/publicacion/${pub.id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100 overflow-hidden transition-all duration-200 flex flex-col"
    >
      <div className="aspect-[16/10] bg-gradient-to-br from-uniminuto-100 to-uniminuto-200 overflow-hidden relative">
        <div className="w-full h-full bg-gradient-to-br from-uniminuto-100 via-uniminuto-50 to-leaf-100 flex items-center justify-center">
          <svg className="w-14 h-14 text-uniminuto-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        {pub.categoria_detail && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-uniminuto-700 rounded-full shadow-sm">
            {pub.categoria_detail.nombre}
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 group-hover:text-uniminuto-600 transition-colors line-clamp-2 mb-2 leading-snug">
          {pub.titulo}
        </h3>
        {pub.resumen && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
            {pub.resumen}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-2 border-t border-gray-50">
          <span>{fecha}</span>
          <span className="text-uniminuto-600 font-medium group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
            Ver más
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="aspect-[16/10] skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-5 skeleton w-3/4" />
        <div className="h-4 skeleton w-full" />
        <div className="h-4 skeleton w-2/3" />
      </div>
    </div>
  )
}

export default function Buscar() {
  const [publicaciones, setPublicaciones] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [categoria, setCategoria] = useState('')
  const [orden, setOrden] = useState('-fechaPublicacion')
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const debounceRef = useRef(null)

  useEffect(() => {
    getCategorias()
      .then((data) => setCategorias(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearchDebounced(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(debounceRef.current)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [categoria, orden])

  const fetchPublicaciones = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { ordering: orden, page }
      if (searchDebounced) params.search = searchDebounced
      if (categoria) params.categoria = categoria

      const res = await getPublicadas(params)
      setPublicaciones(res.results || [])
      setCount(res.count || 0)
    } catch (err) {
      setError('Error al cargar las publicaciones. Intente de nuevo.')
      setPublicaciones([])
    } finally {
      setLoading(false)
    }
  }, [searchDebounced, categoria, orden, page])

  useEffect(() => {
    fetchPublicaciones()
  }, [fetchPublicaciones])

  const totalPages = Math.ceil(count / 12)

  const handleClearFilters = () => {
    setSearch('')
    setCategoria('')
    setOrden('-fechaPublicacion')
    setPage(1)
  }

  const hasActiveFilters = search || categoria || orden !== '-fechaPublicacion'

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            Búsqueda de Publicaciones
          </h1>
          <p className="text-gray-500 text-sm">
            Explora, filtra y encuentra publicaciones de proyección social.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, resumen o contenido..."
              className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-uniminuto-200 focus:border-uniminuto-400 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="sm:hidden flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtros
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-uniminuto-500 rounded-full" />
            )}
          </button>
        </div>

        <div className="flex gap-8">
          <div
            className={`
              ${mobileFiltersOpen ? 'block' : 'hidden'}
              sm:block
              w-full sm:w-60 flex-shrink-0
              ${mobileFiltersOpen ? 'mb-4 sm:mb-0' : ''}
            `}
          >
            <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-24">
              <Filtros
                categorias={categorias}
                categoriaSeleccionada={categoria}
                onCategoriaChange={setCategoria}
                orden={orden}
                onOrdenChange={setOrden}
              />
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 w-full text-center text-xs font-medium text-uniminuto-600 hover:text-uniminuto-700 py-2 rounded-lg hover:bg-uniminuto-50 transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {loading ? (
                  <span className="skeleton h-4 inline-block w-32" />
                ) : (
                  <>
                    <span className="font-medium text-gray-700">{count}</span>
                    {count === 1 ? ' resultado encontrado' : ' resultados encontrados'}
                  </>
                )}
              </p>
              {hasActiveFilters && (
                <span className="text-xs text-uniminuto-600 bg-uniminuto-50 px-2 py-1 rounded-lg">
                  Filtrado activo
                </span>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-6 flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="font-medium">Error de conexión</p>
                  <p className="text-red-600 mt-1">{error}</p>
                  <button
                    onClick={fetchPublicaciones}
                    className="text-xs font-medium text-red-700 underline mt-2 hover:no-underline"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : publicaciones.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publicaciones.map((pub) => (
                    <PublicationCard key={pub.id} pub={pub} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page <= 1}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ←
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                      let pageNum
                      if (totalPages <= 7) {
                        pageNum = i + 1
                      } else if (page <= 4) {
                        pageNum = i + 1
                      } else if (page >= totalPages - 3) {
                        pageNum = totalPages - 6 + i
                      } else {
                        pageNum = page - 3 + i
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                            pageNum === page
                              ? 'bg-uniminuto-600 text-white shadow-sm'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page >= totalPages}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            ) : !error ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-gray-500 text-lg mb-2">No se encontraron resultados</p>
                <p className="text-gray-400 text-sm mb-4">
                  Intente con otros términos de búsqueda o ajuste los filtros.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-sm font-medium text-uniminuto-600 hover:bg-uniminuto-50 rounded-lg transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
