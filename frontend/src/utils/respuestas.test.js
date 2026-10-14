import { describe, it, expect } from 'vitest'
import { listaDe, paginaDe, objetoDe } from './respuestas.js'

const HTML = '<!doctype html><html></html>'

describe('listaDe', () => {
  it('pasa arreglos intactos (misma referencia)', () => {
    const arr = [{ id: 1 }]
    expect(listaDe(arr)).toBe(arr)
  })
  it('extrae results paginado', () => {
    expect(listaDe({ count: 2, results: [{ id: 1 }] })).toEqual([{ id: 1 }])
  })
  it('devuelve [] con HTML, null, undefined o numero', () => {
    expect(listaDe(HTML)).toEqual([])
    expect(listaDe(null)).toEqual([])
    expect(listaDe(undefined)).toEqual([])
    expect(listaDe(42)).toEqual([])
  })
  it('devuelve [] si results no es arreglo', () => {
    expect(listaDe({ results: 'x' })).toEqual([])
  })
})

describe('paginaDe', () => {
  it('preserva objeto sano con sus campos', () => {
    const data = { count: 5, next: 'url', results: [{ id: 1 }] }
    expect(paginaDe(data)).toEqual(data)
  })
  it('convierte arreglo en paginado', () => {
    expect(paginaDe([{ id: 1 }])).toEqual({ results: [{ id: 1 }], count: 1 })
  })
  it('degrada HTML/null a paginado vacio', () => {
    expect(paginaDe(HTML)).toEqual({ results: [], count: 0 })
    expect(paginaDe(null)).toEqual({ results: [], count: 0 })
  })
})

describe('objetoDe', () => {
  it('pasa objetos intactos', () => {
    const o = { kpis: {} }
    expect(objetoDe(o)).toBe(o)
  })
  it('degrada HTML/arreglos a {}', () => {
    expect(objetoDe(HTML)).toEqual({})
    expect(objetoDe([1])).toEqual({})
  })
})
