import { describe, it, expect } from 'vitest'
import { mediaUrl } from './api.js'

describe('mediaUrl', () => {
  it('pasa absolutas intactas', () => {
    expect(mediaUrl('https://cdn.com/a.jpg')).toBe('https://cdn.com/a.jpg')
  })
  it('prefija relativas con el origen de la API', () => {
    expect(mediaUrl('/media/publicaciones/x.jpg')).toBe(
      'https://repositorio-practicas-profesionales.onrender.com/media/publicaciones/x.jpg'
    )
  })
  it('tolera vacios', () => {
    expect(mediaUrl(null)).toBe(null)
    expect(mediaUrl('')).toBe('')
  })
})
