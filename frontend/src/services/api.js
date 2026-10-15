import axios from 'axios'
import { getCsrfToken } from '../utils/csrf.js'

// Siempre relativo: en dev lo resuelve el proxy de Vite y en produccion el
// rewrite de vercel.json hacia Render. Asi el front y la API comparten site
// (misma cookie first-party) y el JS puede leer la cookie CSRF — cross-site
// document.cookie jamas ve las cookies del otro dominio y todo POST con
// sesion fallaba con 403. Solo se usa URL absoluta si se define expresamente.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

export const getCSRFToken = getCsrfToken

api.interceptors.request.use((config) => {
  const csrf = getCsrfToken()
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
      // Navegación vía router (sin recarga) con ?next= para volver (F2).
      window.dispatchEvent(
        new CustomEvent('auth:unauthorized', {
          detail: { next: window.location.pathname + window.location.search },
        })
      )
    }
    return Promise.reject(error)
  }
)

export default api
