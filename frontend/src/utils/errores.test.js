import { describe, expect, it } from 'vitest'
import { getApiErrorMessage } from './errores.js'

describe('getApiErrorMessage', () => {
  it('usa detail de DRF', () => {
    const err = { response: { data: { detail: 'No encontrado.' } } }
    expect(getApiErrorMessage(err)).toBe('No encontrado.')
  })

  it('une errores por campo', () => {
    const err = { response: { data: { contenido: ['Muy largo.'], x: ['Y.'] } } }
    expect(getApiErrorMessage(err)).toBe('Muy largo. Y.')
  })

  it('acepta string directo', () => {
    expect(getApiErrorMessage({ response: { data: 'Mal.' } })).toBe('Mal.')
  })

  it('usa el mensaje o el valor por defecto sin respuesta', () => {
    expect(getApiErrorMessage({ message: 'Network Error' }, 'Defecto')).toBe('Network Error')
    expect(getApiErrorMessage({}, 'Defecto')).toBe('Defecto')
  })
})
