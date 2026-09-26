import api from './api.js'

export const crearSolicitud = async (payload) => {
  const { data } = await api.post('/solicitudes/nueva/', payload)
  return data
}

export const getSolicitudes = async (params) => {
  const { data } = await api.get('/solicitudes/', { params })
  return data
}

export const cambiarEstadoSolicitud = async (id, estado) => {
  const { data } = await api.patch(`/solicitudes/${id}/`, { estado })
  return data
}

export const eliminarSolicitud = async (id) => {
  const { data } = await api.delete(`/solicitudes/${id}/`)
  return data
}

export default { crearSolicitud, getSolicitudes, cambiarEstadoSolicitud, eliminarSolicitud }