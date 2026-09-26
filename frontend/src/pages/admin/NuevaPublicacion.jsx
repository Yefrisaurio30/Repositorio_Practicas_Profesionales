import React from 'react'
import { useNavigate } from 'react-router-dom'
import FormularioPublicacion from '../../components/FormularioPublicacion.jsx'

export default function NuevaPublicacion() {
  const navigate = useNavigate()
  return (
    <FormularioPublicacion
      esAdmin
      titulo="Crear Nueva Publicación"
      subtitulo="Completa los detalles de la iniciativa o proyecto de proyección social para su revisión y publicación."
      volverA="/admin/publicaciones"
      onGuardado={() => navigate('/admin/publicaciones')}
    />
  )
}