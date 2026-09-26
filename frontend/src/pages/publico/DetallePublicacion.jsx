import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  getDetalle,
  getImagenesPublicacion,
  getPublicacionAdmin,
} from '../../services/publicacionesService.js'
import { getUsuarioActual } from '../../services/authService.js'
import {
  getComentariosPublicos,
  crearComentario,
} from '../../services/comentariosService.js'
import SolicitudModal from '../../components/SolicitudModal.jsx'

function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-gray-300">404</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Publicación no encontrada
        </h1>
        <p className="text-gray-500 mb-6">
          La publicación que busca no existe o ha sido removida del sistema.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ← Volver
          </button>
          <Link
            to="/buscar"
            className="px-5 py-2.5 bg-uniminuto-600 text-white text-sm font-medium rounded-xl hover:bg-uniminuto-700 transition-colors"
          >
            Ir a Búsqueda
          </Link>
        </div>
      </div>
    </div>
  )
}

function ServerError() {
  return (
    <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Error del servidor
        </h1>
        <p className="text-gray-500 mb-6">
          Ocurrió un error al cargar la publicación. Por favor intente más tarde.
        </p>
        <Link
          to="/"
          className="px-5 py-2.5 bg-uniminuto-600 text-white text-sm font-medium rounded-xl hover:bg-uniminuto-700 transition-colors inline-block"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  )
}

function ImageGallery({ imagenes }) {
  const [selected, setSelected] = useState(null)

  if (!imagenes || imagenes.length === 0) return null

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-gray-900 mb-5">
        Galería de imágenes ({imagenes.length})
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {imagenes.map((img) => (
          <button
            key={img.id}
            onClick={() => setSelected(img)}
            className="group aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 hover:border-uniminuto-300 hover:shadow-md transition-all"
          >
            <img
              src={img.ruta}
              alt={img.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div
              className="w-full h-full items-center justify-center text-gray-400"
              style={{ display: 'none' }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selected.ruta}
              alt={selected.nombre}
              className="w-full rounded-xl shadow-2xl object-contain max-h-[80vh]"
            />
            {selected.descripcion && (
              <p className="text-white text-sm mt-3 text-center">{selected.descripcion}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DetallePublicacion() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [publicacion, setPublicacion] = useState(null)
  const [imagenes, setImagenes] = useState([])
  const [comentarios, setComentarios] = useState([])
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [enviandoComentario, setEnviandoComentario] = useState(false)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorCode, setErrorCode] = useState(null)
  const [solicitudOpen, setSolicitudOpen] = useState(false)

  const [esPreview, setEsPreview] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setErrorCode(null)
    setEsPreview(false)

    const fetchData = async () => {
      try {
        const [pub, imgs] = await Promise.all([
          getDetalle(id),
          getImagenesPublicacion(id).catch(() => ({ results: [] })),
        ])
        if (!cancelled) {
          setPublicacion(pub)
          setImagenes(imgs.results || imgs || [])
        }
      } catch (err) {
        const status = err.response?.status
        if (status === 404) {
          try {
            const user = await getUsuarioActual()
            const isStaff = user && (user.is_staff || user.is_superuser || (user.roles || []).length > 0)
            if (isStaff) {
              const pubAdmin = await getPublicacionAdmin(id)
              if (!cancelled) {
                setPublicacion(pubAdmin)
                setEsPreview(true)
                const imgs2 = await getImagenesPublicacion(id).catch(() => ({ results: [] }))
                if (!cancelled) setImagenes(imgs2.results || imgs2 || [])
              }
              return
            }
          } catch {}
        }
        if (!cancelled) {
          setErrorCode(status || 500)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    if (!publicacion) return
    getComentariosPublicos(id)
      .then((data) => setComentarios(data))
      .catch(() => {})
  }, [id, publicacion])

  const handleEnviarComentario = async (e) => {
    e.preventDefault()
    const texto = nuevoComentario.trim()
    if (!texto) return
    setEnviandoComentario(true)
    try {
      await crearComentario(id, texto)
      setNuevoComentario('')
      setToast({
        tipo: 'info',
        mensaje: 'Tu comentario ha sido enviado y se encuentra en revisión por un moderador.',
      })
      setTimeout(() => setToast(null), 6000)
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.contenido?.[0] || err.message
      setToast({ tipo: 'error', mensaje: 'Error al enviar: ' + msg })
      setTimeout(() => setToast(null), 6000)
    } finally {
      setEnviandoComentario(false)
    }
  }

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-4">
            <div className="h-6 skeleton w-24 rounded-lg" />
            <div className="h-10 skeleton w-3/4 rounded-lg" />
            <div className="flex gap-4">
              <div className="h-5 skeleton w-32 rounded-lg" />
              <div className="h-5 skeleton w-40 rounded-lg" />
            </div>
            <div className="h-64 skeleton w-full rounded-xl mt-8" />
            <div className="space-y-3 mt-6">
              <div className="h-4 skeleton w-full rounded-lg" />
              <div className="h-4 skeleton w-full rounded-lg" />
              <div className="h-4 skeleton w-5/6 rounded-lg" />
              <div className="h-4 skeleton w-4/5 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (errorCode === 404) return <NotFound />
  if (errorCode) return <ServerError />
  if (!publicacion) return <NotFound />

  const fechaPub = publicacion.fechaPublicacion
    ? new Date(publicacion.fechaPublicacion).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const fechaCreacion = new Date(
    publicacion.fechaCreacion || publicacion.fechaPublicacion
  ).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-6">
          <Link
            to="/buscar"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-uniminuto-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Búsqueda
          </Link>
        </div>

        {esPreview && (
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Vista previa — En Revisión — No visible al público. Solo el administrador ve esto antes de publicar.
          </div>
        )}

        {publicacion.categoria_detail && (
          <span className="inline-flex items-center px-3 py-1 bg-uniminuto-50 text-uniminuto-700 text-xs font-semibold rounded-full mb-4">
            {publicacion.categoria_detail.nombre}
          </span>
        )}
        {publicacion.programa_nombre && (
          <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-4 ml-2">
            Programa: {publicacion.programa_nombre}
          </span>
        )}

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-5">
          {publicacion.titulo}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
          {publicacion.usuario_nombre && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-uniminuto-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-uniminuto-600">
                  {publicacion.usuario_nombre.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-medium text-gray-700">
                {publicacion.usuario_nombre}
              </span>
            </div>
          )}
          {fechaPub && (
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{fechaPub}</span>
            </div>
          )}
          <span className="text-gray-300">·</span>
          <span className="text-xs text-gray-400">
            Creada el {fechaCreacion}
          </span>
        </div>

        {publicacion.resumen && (
          <div className="bg-uniminuto-50/50 border border-uniminuto-100 rounded-xl p-5 mb-8">
            <p className="text-gray-700 leading-relaxed italic">
              {publicacion.resumen}
            </p>
          </div>
        )}

        {publicacion.contenido && (
          <div className="prose prose-gray max-w-none">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[0.95rem]">
                {publicacion.contenido}
              </div>
            </div>
          </div>
        )}

        <ImageGallery imagenes={imagenes} />

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({comentarios.length})
              </span>
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
                  <div className="text-xs text-slate-400">
                    {nuevoComentario.length}/500
                  </div>
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
                      <p className="text-sm font-semibold text-gray-900">
                        {c.usuario_nombre}
                      </p>
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
                  <p className="text-sm text-gray-700 leading-relaxed pl-11">
                    {c.contenido}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-500 text-sm">
                Sé el primero en comentar esta publicación.
              </p>
            </div>
          )}
        </div>
      </article>

      <button
        onClick={() => setSolicitudOpen(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-5 py-3 bg-uniminuto-600 text-white text-sm font-semibold rounded-full shadow-lg hover:bg-uniminuto-700 hover:shadow-xl transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        Enviar Solicitud
      </button>
      <SolicitudModal open={solicitudOpen} onClose={() => setSolicitudOpen(false)} />
    </div>
  )
}
