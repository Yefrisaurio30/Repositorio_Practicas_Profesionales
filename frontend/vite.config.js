import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Destino del proxy de la API. Local (sin Docker) el Django corre en tu
// maquina; dentro de Docker el backend se llama "backend".
const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:8080'

// En Windows los bind mounts no siempre notifican cambios de archivo, asi que
// el watcher necesita polling para que el HMR funcione.
const usePolling = process.env.VITE_USE_POLLING === 'true'

export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: 5173,

    watch: {
      usePolling,
    },

    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      },

      '/media': {
        target: proxyTarget,
        changeOrigin: true,
      },

      '/static': {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',

    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})