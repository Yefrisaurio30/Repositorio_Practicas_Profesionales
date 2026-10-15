import axios from 'axios'
import { getCsrfToken } from '../utils/csrf.js'

// URL base de la API. En Vercel se llama directo a Render (las cookies de
// sesion ya viajan bien y el CSRF va por header desde utils/csrf.js, sin
// leer cookies cross-site). Solo se usa relativa si se define expresamente.
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://repositorio-practicas-profesionales.onrender.com/api'

/**
 * Resuelve la URL de una imagen: en modo local el backend guarda rutas
 * relativas (/media/...) que en el dominio del front no existen; se
 * prefijan con el origen de la API. Las absolutas (Supabase) pasan intactas.
 */
export const mediaUrl = (ruta) => {
  if (!ruta) return ruta
  if (/^https?:\/\//i.test(ruta)) return ruta
  const origen = BASE_URL.replace(/\/api\/?$/, '')
  return `${origen}${ruta.startsWith('/') ? ruta : `/${ruta}`}`
}

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
