import api from './api.js'

export const getUsuarios = async (params) => {
  const { data } = await api.get('/usuarios/', { params })
  return data
}

export const actualizarUsuario = async (id, payload) => {
  const { data } = await api.patch(`/usuarios/${id}/`, payload)
  return data
}

export const eliminarUsuario = async (id) => {
  const { data } = await api.delete(`/usuarios/${id}/`)
  return data
}

export const getRoles = async () => {
  const { data } = await api.get('/roles/')
  return data
}

export const asignarRol = async (usuarioId, rolNombre) => {
  const { data } = await api.post('/roles/asignar/', { usuario: usuarioId, rol: rolNombre })
  return data
}

export const retirarRol = async (usuarioId, rolNombre) => {
  const { data } = await api.delete('/roles/asignar/', { data: { usuario: usuarioId, rol: rolNombre } })
  return data
}

export default { getUsuarios, actualizarUsuario, eliminarUsuario, getRoles, asignarRol, retirarRol }