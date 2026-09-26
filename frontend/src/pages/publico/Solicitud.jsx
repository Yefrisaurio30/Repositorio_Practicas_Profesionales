import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SolicitudModal from '../../components/SolicitudModal.jsx'

export default function Solicitud() {
  const [open, setOpen] = useState(true)
  const navigate = useNavigate()

  return (
    <div className="pt-16 min-h-screen bg-[#eef3fa]">
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-uniminuto-800 mb-3">
          Solicitud o Petición de Proyecto
        </h1>
        <p className="text-slate-500 mb-8">
          Envía tu propuesta a la Dirección de Proyección Social. Llegará directamente
          al panel administrativo para su revisión.
        </p>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="px-6 py-3 bg-uniminuto-600 text-white text-sm font-semibold rounded-lg hover:bg-uniminuto-700 transition-colors shadow-sm"
          >
            Abrir formulario de solicitud
          </button>
        )}
      </div>
      <SolicitudModal
        open={open}
        onClose={() => {
          setOpen(false)
          navigate('/')
        }}
      />
    </div>
  )
}