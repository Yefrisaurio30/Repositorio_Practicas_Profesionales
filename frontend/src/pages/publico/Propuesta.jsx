import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import FormularioPublicacion from '../../components/FormularioPublicacion.jsx'
import { getPublicacionAdmin } from '../../services/publicacionesService.js'

export default function Propuesta() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [initial, setInitial] = useState(null)
  const [loading, setLoading] = useState(!!id)
  const [noExiste, setNoExiste] = useState(false)

  useEffect(() => {
    if (!id) return
    getPublicacionAdmin(id)
      .then(setInitial)
      .catch(() => setNoExiste(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="pt-[68px] min-h-screen bg-[#f4f7fb]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-4">
          <div className="h-10 skeleton rounded w-1/3" />
          <div className="h-64 skeleton rounded-xl" />
          <div className="h-64 skeleton rounded-xl" />
        </div>
      </div>
    )
  }

  if (noExiste) {
    return (
      <div className="pt-[68px] min-h-screen bg-[#f4f7fb]">
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Propuesta no encontrada</h1>
          <p className="text-slate-500 text-sm mb-6">
            No tienes acceso a esta propuesta o fue eliminada.
          </p>
          <Link to="/mis-proyectos"
            className="px-6 py-2.5 bg-uniminuto-600 text-white text-sm font-semibold rounded-lg hover:bg-uniminuto-700 transition-colors">
            Volver a Mis Proyectos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-[68px] bg-[#f4f7fb] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FormularioPublicacion
          initial={initial}
          titulo={id ? 'Editar Propuesta' : 'Nueva Propuesta de Proyecto'}
          subtitulo="Completa los detalles de tu iniciativa. El administrador la revisará antes de publicarla en el portal."
          volverA="/mis-proyectos"
          onGuardado={() => navigate('/mis-proyectos')}
        />
      </div>
    </div>
  )
}