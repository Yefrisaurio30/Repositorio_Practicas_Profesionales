import { describe, it, expect, beforeEach } from 'vitest'
import { setCsrfToken, getCsrfToken, clearCsrfToken } from './csrf.js'

beforeEach(() => {
  clearCsrfToken()
})

describe('csrf token en memoria', () => {
  it('devuelve lo guardado con set', () => {
    setCsrfToken('abc123')
    expect(getCsrfToken()).toBe('abc123')
  })
  it('ignora valores vacios', () => {
    setCsrfToken('')
    setCsrfToken(null)
    expect(getCsrfToken()).toBe(null)
  })
  it('clear lo elimina', () => {
    setCsrfToken('abc123')
    clearCsrfToken()
    expect(getCsrfToken()).toBe(null)
  })
})
