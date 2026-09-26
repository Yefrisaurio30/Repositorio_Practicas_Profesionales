import api from './api.js'

export const getUsuarioActual = async () => {
  try {
    const { data } = await api.get('/auth/user/')
    return data
  } catch {
    return null
  }
}

export const login = async (username, password, remember = true) => {
  const { data } = await api.post('/auth/login/', { username, password, remember })
  return data
}

export const logout = async () => {
  try {
    await api.post('/auth/logout/')
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err.response?.data?.detail || err.message }
  }
}

export const register = async (payload) => {
  const { data } = await api.post('/auth/register/', payload)
  return data
}

export default { getUsuarioActual, login, logout, register }