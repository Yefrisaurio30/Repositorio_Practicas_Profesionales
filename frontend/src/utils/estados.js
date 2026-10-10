// Etiquetas y estilos de estado compartidos (F4). Una sola fuente.
export const ESTADOS_PUBLICACION = {
  BORRADOR: { label: 'Borrador', pill: 'bg-slate-100 text-slate-600' },
  EN_REVISION: { label: 'En revisión', pill: 'bg-blue-50 text-blue-700' },
  PUBLICADA: { label: 'Publicada', pill: 'bg-green-50 text-green-700' },
  ARCHIVADA: { label: 'Archivada', pill: 'bg-slate-100 text-slate-600' },
}

export const ESTADOS_COMENTARIO = {
  PENDIENTE: { label: 'Pendiente', pill: 'bg-blue-50 text-blue-700' },
  APROBADO: { label: 'Aprobado', pill: 'bg-green-50 text-green-700' },
  RECHAZADO: { label: 'Rechazado', pill: 'bg-red-50 text-red-600' },
}
