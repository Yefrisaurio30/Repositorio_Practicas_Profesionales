/**
 * Token CSRF para despliegue cross-site.
 *
 * El navegador solo expone en `document.cookie` las cookies del dominio del
 * documento. Con front y API en dominios distintos, el JS jamas puede leer la
 * cookie `csrftoken` del backend y todo POST con sesion falla con 403.
 * Por eso el backend envia el token vigente en el cuerpo de /auth/login/ y
 * /auth/user/ y aqui se guarda en memoria (+ sessionStorage para recargas).
 * Orden: memoria -> sessionStorage -> cookie (mismo site: dev y prod con proxy).
 */

let memoria = null
const CLAVE = 'nexus.csrf_token'

const leerCookie = () => {
  const cookies = document.cookie.split(';')
  for (let c of cookies) {
    c = c.trim()
    if (c.startsWith('csrftoken=')) return c.substring('csrftoken='.length)
  }
  return null
}

export const setCsrfToken = (token) => {
  if (!token) return
  memoria = token
  try {
    sessionStorage.setItem(CLAVE, token)
  } catch {
    /* almacenamiento no disponible: se sigue con memoria */
  }
}

export const getCsrfToken = () => {
  if (memoria) return memoria
  try {
    const guardado = sessionStorage.getItem(CLAVE)
    if (guardado) {
      memoria = guardado
      return guardado
    }
  } catch {
    /* almacenamiento no disponible: se sigue a la cookie */
  }
  try {
    return leerCookie()
  } catch {
    /* sin DOM (tests/prerender): no hay token */
    return null
  }
}

export const clearCsrfToken = () => {
  memoria = null
  try {
    sessionStorage.removeItem(CLAVE)
  } catch {
    /* nada que limpiar */
  }
}
