import { defineConfig } from 'vitest/config'

// Pruebas unitarias frontend (F6/T1). Sin jsdom: solo lógica pura.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
