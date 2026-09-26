import api from './api.js'

export const getRegistros = async (params) => {
  const { data } = await api.get('/registros/', { params })
  return data
}

export default { getRegistros }
