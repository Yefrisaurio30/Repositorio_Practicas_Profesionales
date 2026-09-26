import api from './api.js'

export const getComentariosPublicos = async (publicacionId) => {
  const { data } = await api.get('/comentarios/publicos/', {
    params: { publicacion_id: publicacionId },
  })
  return data
}

export const crearComentario = async (publicacionId, contenido) => {
  const { data } = await api.post('/comentarios/', {
    publicacion: publicacionId,
    contenido,
  })
  return data
}

export const getComentariosPendientes = async () => {
  const { data } = await api.get('/comentarios/pendientes/')
  return data
}

export const getComentariosAdmin = async (params = {}) => {
  const { data } = await api.get('/comentarios/', { params })
  return data
}

export const aprobarComentario = async (id) => {
  const { data } = await api.patch(`/comentarios/${id}/aprobar/`)
  return data
}

export const rechazarComentario = async (id, motivo = '') => {
  const { data } = await api.patch(`/comentarios/${id}/rechazar/`, { motivo })
  return data
}

export default {
  getComentariosPublicos,
  crearComentario,
  getComentariosPendientes,
  getComentariosAdmin,
  aprobarComentario,
  rechazarComentario,
}
