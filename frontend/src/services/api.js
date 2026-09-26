import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

export const getCSRFToken = () => {
  const name = 'csrftoken'
  const cookies = document.cookie.split(';')
  for (let c of cookies) {
    c = c.trim()
    if (c.startsWith(name + '=')) return c.substring(name.length + 1)
  }
  return null
}

api.interceptors.request.use((config) => {
  const csrf = getCSRFToken()
  if (csrf) {
    config.headers['X-CSRFToken'] = csrf
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // No redirigir en endpoints de login/usuario para no borrar el estado de error del formulario
    const url = error.config?.url || ''
    const isAuthEndpoint = url.includes('/auth/login/') || url.includes('/auth/user/')
    if (error.response?.status === 401 && !isAuthEndpoint) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api
