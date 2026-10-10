// Traduce errores de la API a mensajes para el usuario (F3).
// Nunca muestra tecnicismos en crudo.
export const getApiErrorMessage = (err, porDefecto = 'Ocurrió un error inesperado.') => {
  const d = err?.response?.data
  if (!d) return err?.message || porDefecto
  if (typeof d === 'string') return d
  if (d.detail && typeof d.detail === 'string') return d.detail
  if (typeof d === 'object') {
    const partes = Object.values(d)
      .flat()
      .filter((v) => typeof v === 'string')
    if (partes.length > 0) return partes.join(' ')
  }
  return porDefecto
}
