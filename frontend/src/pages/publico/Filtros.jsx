import React from 'react'

const ORDEN_OPTIONS = [
  { value: '-fechaPublicacion', label: 'Más recientes' },
  { value: 'fechaPublicacion', label: 'Más antiguas' },
  { value: 'titulo', label: 'A – Z' },
]

export default function Filtros({
  categorias,
  categoriaSeleccionada,
  onCategoriaChange,
  orden,
  onOrdenChange,
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Ordenar por
        </label>
        <select
          value={orden}
          onChange={(e) => onOrdenChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-uniminuto-200 focus:border-uniminuto-400 transition-colors appearance-none cursor-pointer"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '1rem',
          }}
        >
          {ORDEN_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Categorías
        </label>
        <div className="space-y-1">
          <button
            onClick={() => onCategoriaChange('')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
              !categoriaSeleccionada
                ? 'bg-uniminuto-50 text-uniminuto-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            Todas las categorías
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoriaChange(String(cat.id))}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                String(cat.id) === categoriaSeleccionada
                  ? 'bg-uniminuto-50 text-uniminuto-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
          {categorias.length === 0 && (
            <p className="text-xs text-gray-400 px-3 py-2">Cargando categorías...</p>
          )}
        </div>
      </div>
    </div>
  )
}
