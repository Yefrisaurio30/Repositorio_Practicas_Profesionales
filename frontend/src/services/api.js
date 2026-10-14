import axios from 'axios'

// VITE_API_BASE_URL se inyecta en Vercel. Fallback: en dev (/npm run dev/)
// se usa el proxy local; en build de produccion se apunta a Render para que
// el deploy funcione aunque la variable no este configurada en el dashboard.
// (Es URL publica, visible en el bundle de todas formas: no es secreto.)
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '/api' : 'https://repositorio-practicas-profesionales.onrender.com/api')

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
