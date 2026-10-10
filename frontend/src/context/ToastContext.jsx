import React, { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext(null)
let siguienteId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [confirmacion, setConfirmacion] = useState(null)
  const resolverRef = useRef(null)

  const descartar = useCallback((id) => {
    setToasts((actual) => actual.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (mensaje, tipo = 'info', ms = 5000) => {
      const id = ++siguienteId
      setToasts((actual) => [...actual, { id, mensaje, tipo }])
      setTimeout(() => descartar(id), ms)
    },
    [descartar]
  )

  // Modal propio en vez de window.confirm (F3). Resuelve true/false.
  const confirmar = useCallback((mensaje, titulo = 'Confirmar acción') => {
    setConfirmacion({ mensaje, titulo })
    return new Promise((resolver) => {
      resolverRef.current = resolver
    })
  }, [])

  const responder = useCallback((valor) => {
    setConfirmacion(null)
    resolverRef.current?.(valor)
    resolverRef.current = null
  }, [])

  const estilos = {
    info: 'bg-slate-900 text-white',
    exito: 'bg-green-700 text-white',
    error: 'bg-red-50 border border-red-200 text-red-700',
  }

  return (
    <ToastContext.Provider value={{ toast, confirmar }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${estilos[t.tipo] || estilos.info} rounded-lg px-4 py-3 text-sm shadow-lg`}
          >
            {t.mensaje}
          </div>
        ))}
      </div>
      {confirmacion && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">{confirmacion.titulo}</h2>
            <p className="text-sm text-slate-600 mb-6">{confirmacion.mensaje}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => responder(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => responder(true)}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}
