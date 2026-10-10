import React from 'react'
import { ESTADOS_PUBLICACION } from '../utils/estados.js'

export default function EstadoPill({ estado, mapa = ESTADOS_PUBLICACION, conBorde = false }) {
  const cfg = mapa[estado]
  const borde = conBorde ? 'border' : ''
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${borde} ${cfg?.pill || 'bg-slate-100 text-slate-600'}`}
    >
      {cfg?.label || estado}
    </span>
  )
}
