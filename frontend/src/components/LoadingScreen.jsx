import React from 'react'

export default function LoadingScreen({ error, onRetry }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f5fa] px-4">
      <div className="text-center max-w-md">
        {!error ? (
          <>
            <div className="mx-auto mb-6 h-12 w-12 rounded-full border-4 border-slate-200 border-t-uniminuto-600 animate-spin" />
            <h1 className="text-xl font-bold text-uniminuto-800">El servidor se está levantando</h1>
            <p className="mt-2 text-sm text-slate-500">Por favor, espera un momento...</p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-red-600">No se pudo conectar con el servidor</h1>
            <p className="mt-2 text-sm text-slate-500">Verifica tu conexión e inténtalo de nuevo.</p>
            <button
              onClick={onRetry}
              className="mt-6 px-5 py-2.5 bg-uniminuto-600 text-white text-sm font-semibold rounded-lg hover:bg-uniminuto-700"
            >
              Reintentar
            </button>
          </>
        )}
      </div>
    </div>
  )
}
