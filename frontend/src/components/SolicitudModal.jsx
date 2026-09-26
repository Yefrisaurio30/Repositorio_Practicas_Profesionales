import React, { useState, useEffect } from 'react'
import { crearSolicitud } from '../services/solicitudesService.js'

const VACIO = { nombre: '', asunto: '', email: '', telefono: '', mensaje: '' }

export default function SolicitudModal({ open, onClose }) {
  const [form, setForm] = useState(VACIO)
  const [errors, setErrors] = useState({})
  const [enviada, setEnviada] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(VACIO)
      setErrors({})
      setEnviada(false)
    }
  }, [open ])

  if (!open) return null

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      await crearSolicitud({ tipo: 'SOLICITUD', ...form })
      setEnviada(true)
    } catch (err) {
      const data = err.response?.data || {}
      const ne = {}
      for (const k of Object.keys(data)) {
        const v = data[k]
        ne[k] = Array.isArray(v) ? v[0] : String(v)
      }
      setErrors(ne)
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors'

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-7 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Solicitud o Petición de Proyecto</h2>
              <p className="text-[13px] text-slate-500">Proyección Social Universitaria</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" aria-label="Cerrar">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {enviada ? (
          <div className="px-7 py-10 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Solicitud enviada al panel</h3>
            <p className="text-sm text-slate-500 mb-6">
              Gracias {form.nombre.split(' ')[0] || ''}, el equipo administrativo la revisará
              y te contactará al correo {form.email}.
            </p>
            <button onClick={onClose}
              className="px-6 py-2.5 bg-uniminuto-600 text-white text-sm font-semibold rounded-lg hover:bg-uniminuto-700 transition-colors">
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-7 py-5">
            <p className="text-sm text-slate-500 leading-relaxed mb-5">
              Envía tu propuesta o solicitud a la Dirección de Proyección Social. Esta solicitud llegará
              directamente al panel administrativo para su revisión.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required
                  placeholder="Ej. Dra. María González o Junta Vecinal" className={inputCls} />
                {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                  Asunto de la solicitud <span className="text-red-500">*</span>
                </label>
                <input value={form.asunto} onChange={(e) => set('asunto', e.target.value)} required maxLength={300}
                  placeholder="Ej. Solicitud de brigada de salud o apoyo tecnológico" className={inputCls} />
                {errors.asunto && <p className="mt-1 text-xs text-red-600">{errors.asunto}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                  Correo electrónico <span className="text-red-500">*</span>
                </label>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required
                  placeholder="correo@ejemplo.com" className={inputCls} />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                  Número telefónico para comunicarse <span className="text-red-500">*</span>
                </label>
                <input value={form.telefono} onChange={(e) => set('telefono', e.target.value)} required
                  placeholder="+51 987 654 321" className={inputCls} />
                {errors.telefono && <p className="mt-1 text-xs text-red-600">{errors.telefono}</p>}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                Descripción detallada de la propuesta o requerimiento <span className="text-red-500">*</span>
              </label>
              <textarea value={form.mensaje} onChange={(e) => set('mensaje', e.target.value)} required rows={4}
                placeholder="Describe el contexto, objetivos, comunidad beneficiaria o necesidades específicas del proyecto que solicitas..."
                className={`${inputCls} resize-none`} />
              {errors.mensaje && <p className="mt-1 text-xs text-red-600">{errors.mensaje}</p>}
            </div>

            <div className="flex items-start gap-2.5 bg-blue-50/70 border border-blue-100 rounded-xl px-4 py-3.5 mb-5">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8h.01M12 11v5" />
              </svg>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                Tu solicitud será evaluada por el equipo administrativo y nos comunicaremos contigo
                al correo o teléfono proporcionado para coordinar los siguientes pasos.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 bg-slate-50 -mx-7 px-7 py-4 rounded-b-2xl border-t border-slate-100">
              <button type="button" onClick={onClose}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-uniminuto-600 text-white text-sm font-semibold rounded-lg hover:bg-uniminuto-700 disabled:opacity-60 transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                {loading ? 'Enviando...' : 'Enviar Solicitud al Panel'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}