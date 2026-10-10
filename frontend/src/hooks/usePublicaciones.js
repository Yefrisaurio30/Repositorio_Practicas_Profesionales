import { useCallback, useEffect, useState } from 'react'
import { getPublicacionesAdmin, getCategorias } from '../services/publicacionesService.js'
import { getDashboard } from '../services/reportesService.js'

// Datos de la tabla admin de publicaciones: filtros, página y KPIs (F4).
export function usePublicaciones() {
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchDebounced(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [estadoFiltro, categoriaFiltro, programaFiltro])

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
        setKpis({
          total: p.total || 0,
          publicadas: p.publicadas || 0,
          en_revision: p.en_revision || 0,
          borradores: p.borradores || 0,
        })
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchDebounced, estadoFiltro, categoriaFiltro, programaFiltro])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    publicaciones,
    categorias,
    kpis,
    search,
    setSearch,
    searchDebounced,
    estadoFiltro,
    setEstadoFiltro,
    categoriaFiltro,
    setCategoriaFiltro,
    programaFiltro,
    setProgramaFiltro,
    page,
    setPage,
    count,
    pageSize,
    loading,
    fetchData,
  }
}
