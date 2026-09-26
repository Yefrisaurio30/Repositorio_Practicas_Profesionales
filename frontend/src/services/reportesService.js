import api from './api.js'

export const getDashboard = async () => {
  const { data } = await api.get('/reportes/dashboard/')
  return data
}

export const getReportes = async (params) => {
  const { data } = await api.get('/reportes/', { params })
  return data
}

export const crearReporte = async (payload) => {
  const { data } = await api.post('/reportes/', payload)
  return data
}

export default { getDashboard, getReportes, crearReporte }
