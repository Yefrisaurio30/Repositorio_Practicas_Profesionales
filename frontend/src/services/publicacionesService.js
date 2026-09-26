import api from './api.js'

export const getPublicadas = async (params = {}) => {
  const { data } = await api.get('/publicaciones/publicas/', { params })
  return data
}

export const getDetalle = async (id) => {
  const { data } = await api.get(`/publicaciones/publicas/${id}/`)
  return data
}

export const getPublicacionAdmin = async (id) => {
  const { data } = await api.get(`/publicaciones/publicaciones/${id}/`)
  return data
}

export const getPublicacionesAdmin = async (params = {}) => {
  const { data } = await api.get('/publicaciones/publicaciones/', { params })
  return data
}

export const getCategorias = async () => {
  const { data } = await api.get('/publicaciones/categorias/')
  return data
}

export const getImagenesPublicacion = async (publicacionId) => {
  const { data } = await api.get('/imagenes/imagenes/', {
    params: { publicacion: publicacionId },
  })
  return data
}

export const crearPublicacion = async (payload) => {
  const { data } = await api.post('/publicaciones/publicaciones/', payload)
  return data
}

export const actualizarPublicacion = async (id, payload) => {
  const { data } = await api.put(`/publicaciones/publicaciones/${id}/`, payload)
  return data
}

export const eliminarPublicacion = async (id) => {
  const { data } = await api.delete(`/publicaciones/publicaciones/${id}/`)
  return data
}

export const cambiarEstado = async (id, estado) => {
  const action = estado === 'PUBLICADA' ? 'publicar' : estado === 'BORRADOR' ? 'despublicar' : estado === 'EN_REVISION' ? 'enviar-revision' : 'archivar'
  const { data } = await api.post(`/publicaciones/publicaciones/${id}/${action}/`)
  return data
}

export const enviarRevision = async (id) => {
  const { data } = await api.post(`/publicaciones/publicaciones/${id}/enviar-revision/`)
  return data
}

export const subirImagen = async (file, data) => {
  const formData = new FormData()
  formData.append('archivo', file)
  formData.append('publicacion', data.publicacion)
  if (data.nombre) formData.append('nombre', data.nombre)
  if (data.descripcion) formData.append('descripcion', data.descripcion)

  const { data: result } = await api.post('/imagenes/imagenes/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return result
}

export const getImagenes = async (params = {}) => {
  const { data } = await api.get('/imagenes/imagenes/', { params })
  return data
}

export default {
  getPublicadas,
  getDetalle,
  getPublicacionAdmin,
  getPublicacionesAdmin,
  enviarRevision,
  getCategorias,
  getImagenesPublicacion,
  crearPublicacion,
  actualizarPublicacion,
  eliminarPublicacion,
  cambiarEstado,
  subirImagen,
  getImagenes,
}
