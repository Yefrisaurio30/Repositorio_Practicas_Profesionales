import React, { useEffect, useState } from 'react'
import { getComentariosPublicos, crearComentario } from '../services/comentariosService.js'
import { getApiErrorMessage } from '../utils/errores.js'

// Sección de comentarios del detalle de publicación, extraída (F4).
export default function ComentariosSeccion({ publicacionId }) {
  const [comentarios, setComentarios] = useState([])
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [enviandoComentario, setEnviandoComentario] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!publicacionId) return
    getComentariosPublicos(publicacionId)
      .then((data) => setComentarios(data))
      .catch(() => {})
  }, [publicacionId])

  const handleEnviarComentario = async (e) => {
    e.preventDefault()
    const texto = nuevoComentario.trim()
    if (!texto) return
    setEnviandoComentario(true)
    try {
      await crearComentario(publicacionId, texto)
      setNuevoComentario('')
      setToast({
        tipo: 'info',
        mensaje: 'Tu comentario ha sido enviado y se encuentra en revisión por un moderador.',
      })
      setTimeout(() => setToast(null), 6000)
    } catch (err) {
      setToast({ tipo: 'error', mensaje: 'Error al enviar: ' + getApiErrorMessage(err) })
      setTimeout(() => setToast(null), 6000)
    } finally {
      setEnviandoComentario(false)
    }
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      {toast && (
        <div
          className={`mb-4 p-4 rounded-xl text-sm flex items-center gap-3 ${
            toast.tipo === 'error'
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-blue-50 border border-blue-200 text-blue-700'
          }`}
        >
          {toast.tipo === 'error' ? (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          <span>{toast.mensaje}</span>
          <button onClick={() => setToast(null)} className="ml-auto p-1 hover:opacity-70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 mb-5">
        Comentarios
        {comentarios.length > 0 && (
          <span className="ml-2 text-sm font-normal text-gray-400">({comentarios.length})</span>
        )}
      </h3>

      <form onSubmit={handleEnviarComentario} className="mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <textarea
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value.slice(0, 500))}
            placeholder="Escribe tu comentario..."
            rows={3}
            className="w-full resize-none border-0 p-0 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
          />
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
            <p className="text-xs text-gray-400">
              Tu comentario será revisado por un moderador antes de publicarse.
            </p>
            <div className="text-xs text-slate-400">{nuevoComentario.length}/500</div>
            <button
              type="submit"
              disabled={!nuevoComentario.trim() || enviandoComentario}
              className="px-4 py-2 bg-uniminuto-600 text-white text-sm font-medium rounded-lg hover:bg-uniminuto-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {enviandoComentario ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>
      </form>

      {comentarios.length > 0 ? (
        <div className="space-y-4">
          {comentarios.map((c) => (
            <div key={c.id} className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-leaf-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-leaf-700">
                    {c.usuario_nombre?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{c.usuario_nombre}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(c.fechaCreacion).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed pl-11">{c.contenido}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <svg
            className="w-10 h-10 text-gray-300 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-gray-500 text-sm">Sé el primero en comentar esta publicación.</p>
        </div>
      )}
    </div>
  )
}
