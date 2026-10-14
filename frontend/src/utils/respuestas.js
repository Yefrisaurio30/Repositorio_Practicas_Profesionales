/**
 * Normalizadores de respuestas de la API.
 *
 * Si el backend no responde JSON (caída, CORS, o un rewrite del hosting que
 * devuelve index.html con 200), axios resuelve con un string/objeto inesperado
 * y los `.map()` de las pantallas revientan con "r.map is not a function"
 * dejando la app en blanco. Estas funciones garantizan la forma que cada
 * pantalla espera sin cambiar nada cuando la API responde bien.
 */

/** Garantiza un arreglo (para selects, galerías, comentarios, roles). */
export const listaDe = (data) => {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && Array.isArray(data.results)) {
    return data.results
  }
  return []
}

/**
 * Garantiza un objeto paginado `{ ...data, results: [] }`.
 * Preserva `count/next/previous` cuando existen (cursor o page-number).
 */
export const paginaDe = (data) => {
  if (Array.isArray(data)) return { results: data, count: data.length }
  if (data && typeof data === 'object') {
    return {
      ...data,
      results: Array.isArray(data.results) ? data.results : [],
    }
  }
  return { results: [], count: 0 }
}

/** Garantiza un objeto (para dashboard/detalle). */
export const objetoDe = (data) => {
  if (data && typeof data === 'object' && !Array.isArray(data)) return data
  return {}
}
