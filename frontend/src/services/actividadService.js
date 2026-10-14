import api from './api.js'
import { paginaDe } from '../utils/respuestas.js'

export const getRegistros = async (params) => {
  const { data } = await api.get('/registros/', { params })
  return paginaDe(data)
}

export default { getRegistros }
