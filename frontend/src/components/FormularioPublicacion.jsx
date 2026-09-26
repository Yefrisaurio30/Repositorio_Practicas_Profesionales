import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  getCategorias,
  getImagenesPublicacion,
  crearPublicacion,
  actualizarPublicacion,
  subirImagen,
} from '../services/publicacionesService.js'

const SEDES = [
  'Antioquia - Chocó',
  'Bogotá',
  'Caribe',
  'Centro Occidente',
  'Tolima - Huila',
  'Cundinamarca - Boyacá',
  'Santanderes',
  'Orinoquía - Amazonía',
  'Parque Cientifico de Innovación Social (PCIS)',
  'UNIMINUTO Virtual',
]

const VACIO = {
  programa_nombre: '',
  programa_codigo: '',
  coordinador_nombre: '',
  coordinador_email: '',
  sede: '',
  titulo: '',
  categoria: '',
  fecha_inicio: '',
  fecha_fin: '',
  resumen: '',
  contenido: '',
  beneficiarios: '',
  ubicacion: '',
  investigador: '',
}

function desdeInicial(ini) {
  if (!ini) return { ...VACIO }
  return {
    programa_nombre: ini.programa_nombre || '',
    programa_codigo: ini.programa_codigo || '',
    coordinador_nombre: ini.coordinador_nombre || '',
    coordinador_email: ini.coordinador_email || '',
    sede: ini.sede || '',
    titulo: ini.titulo || '',
    categoria: ini.categoria || '',
    fecha_inicio: ini.fecha_inicio || '',
    fecha_fin: ini.fecha_fin || '',
    resumen: ini.resumen || '',
    contenido: ini.contenido || '',
    beneficiarios: ini.beneficiarios ?? '',
    ubicacion: ini.ubicacion || '',
    investigador: ini.investigador || '',
  }
}

function tagsDesde(ini) {
  if (!ini?.etiquetas) return []
  return ini.etiquetas.split(',').map((s) => s.trim()).filter(Boolean)
}

function Section({ icon, title, subtitle, children }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-blue-600">{icon}</span>
        <h2 className="text-[15px] font-bold text-slate-900">{title}</h2>
      </div>
      {subtitle && <p className="text-xs text-slate-400 mb-5 ml-7">{subtitle}</p>}
      <div className={!subtitle ? 'mt-4' : ''}>{children}</div>
    </section>
  )
}

const inputCls =
  'w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors'
const labelCls = 'block text-[13px] font-medium text-slate-700 mb-1.5'

export default function FormularioPublicacion({
  initial = null,
  esAdmin = false,
  titulo,
  subtitulo,
  volverA,
  onGuardado,
}) {
  const [categorias, setCategorias] = useState([])
  const [form, setForm] = useState(() => desdeInicial(initial))
  const [pubId, setPubId] = useState(initial?.id || null)
  const [estadoActual, setEstadoActual] = useState(initial?.estado || 'BORRADOR')
  const [tags, setTags] = useState(() => tagsDesde(initial))
  const [tagInput, setTagInput] = useState('')
  const [portada, setPortada] = useState(null)
  const [portadaPreview, setPortadaPreview] = useState(null)
  const [galeria, setGaleria] = useState([])
  const [galeriaSubidas, setGaleriaSubidas] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [imgWarning, setImgWarning] = useState('')
  const [autosaveAt, setAutosaveAt] = useState(null)
  const [autosaving, setAutosaving] = useState(false)
  const formRef = useRef(form)
  const tagsRef = useRef(tags)
  const estadoRef = useRef(estadoActual)
  formRef.current = form
  tagsRef.current = tags
  estadoRef.current = estadoActual

  useEffect(() => {
    getCategorias()
      .then((data) => setCategorias(data.results || data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!initial?.id) return
    getImagenesPublicacion(initial.id)
      .then((data) => setGaleriaSubidas(data.results || data))
      .catch(() => {})
  }, [initial])

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const addTag = (raw) => {
    const t = raw.trim().replace(/^#/, '')
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  const payload = useCallback((estado) => {
    const f = formRef.current
    return {
      titulo: f.titulo,
      resumen: f.resumen,
      contenido: f.contenido,
      categoria: f.categoria || null,
      estado,
      programa_nombre: f.programa_nombre,
      programa_codigo: f.programa_codigo,
      coordinador_nombre: f.coordinador_nombre,
      coordinador_email: f.coordinador_email,
      sede: f.sede,
      fecha_inicio: f.fecha_inicio || null,
      fecha_fin: f.fecha_fin || null,
      beneficiarios: f.beneficiarios === '' ? null : Number(f.beneficiarios),
      ubicacion: f.ubicacion,
      investigador: f.investigador,
      etiquetas: tagsRef.current.join(', '),
    }
  }, [])

  useEffect(() => {
    if (!pubId) return
    setAutosaving(true)
    const t = setTimeout(async () => {
      try {
        await actualizarPublicacion(pubId, payload(estadoRef.current))
        const now = new Date()
        setAutosaveAt(
          `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        )
      } catch {
        // silent
      } finally {
        setAutosaving(false)
      }
    }, 4000)
    return () => clearTimeout(t)
  }, [form, tags, pubId, payload])

  const subirPendientes = async (id) => {
    const fallos = []
    if (portada) {
      try {
        await subirImagen(portada, { publicacion: id, nombre: `Portada - ${formRef.current.titulo}`.slice(0, 200) })
      } catch {
        fallos.push('portada')
      }
    }
    for (const g of galeria) {
      try {
        const res = await subirImagen(g.file, { publicacion: id, nombre: g.file.name })
        setGaleriaSubidas((prev) => [...prev, res])
      } catch {
        fallos.push(g.file.name)
      }
    }
    if (fallos.length) {
      setImgWarning(
        'La publicación se guardó, pero algunas imágenes no se pudieron subir. Puedes añadirlas luego desde la galería.'
      )
    }
  }

  const guardar = async (estado) => {
    setError('')
    setSaving(true)
    try {
      const data = payload(estado)
      if (!data.titulo || !data.contenido || !data.categoria) {
        setError('Completa al menos el título, la categoría y la memoria descriptiva.')
        setSaving(false)
        return
      }
      let id = pubId
      if (!id) {
        const creada = await crearPublicacion(data)
        id = creada.id
        setPubId(id)
      } else {
        await actualizarPublicacion(id, data)
      }
      setEstadoActual(estado)
      await subirPendientes(id)
      onGuardado(id, estado)
    } catch (err) {
      const d = err.response?.data
      const msg = d?.detail || (typeof d === 'object' && d ? Object.values(d).flat().join(' ') : null)
      setError(msg || 'Error al guardar la publicación.')
    } finally {
      setSaving(false)
    }
  }

  const onPortada = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPortada(file)
    setPortadaPreview(URL.createObjectURL(file))
  }

  const onGaleria = (e) => {
    const files = Array.from(e.target.files || []).slice(0, Math.max(0, 8 - galeria.length - galeriaSubidas.length))
    setGaleria((prev) => [...prev, ...files.map((file) => ({ file, preview: URL.createObjectURL(file) }))])
  }

  const quitarGaleriaLocal = (idx) => setGaleria((prev) => prev.filter((_, i) => i !== idx))

  const portadaActual = portadaPreview || (galeriaSubidas.length > 0 ? galeriaSubidas[0].ruta : null)

  return (
    <div className="max-w-5xl">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[26px] font-bold text-uniminuto-800">{titulo}</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">{subtitulo}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {(autosaveAt || autosaving) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {autosaving ? 'Autoguardando...' : `Borrador autoguardado (${autosaveAt})`}
            </span>
          )}
          <button
            onClick={() => guardar('BORRADOR')}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Guardar como Borrador
          </button>
          {esAdmin ? (
            <button
              onClick={() => guardar('PUBLICADA')}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-uniminuto-600 text-white text-sm font-semibold rounded-lg hover:bg-uniminuto-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              {saving ? 'Guardando...' : 'Publicar Iniciativa'}
            </button>
          ) : (
            <button
              onClick={() => guardar('EN_REVISION')}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-uniminuto-600 text-white text-sm font-semibold rounded-lg hover:bg-uniminuto-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              {saving ? 'Enviando...' : 'Enviar a Revisión'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
      )}
      {imgWarning && (
        <div className="mb-5 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">{imgWarning}</div>
      )}

      <Section
        title="1. Datos del Programa Institucional Asociado"
        subtitle="Vincule esta iniciativa al programa y coordinación académica correspondiente."
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11m16-11v11" /></svg>}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelCls}>Nombre del Programa <span className="text-red-500">*</span></label>
            <input value={form.programa_nombre} onChange={(e) => set('programa_nombre', e.target.value)}
              className={inputCls} placeholder="Programa de Innovación Social y Alfabetización Digital" />
          </div>
          <div>
            <label className={labelCls}>Código del Programa <span className="text-red-500">*</span></label>
            <input value={form.programa_codigo} onChange={(e) => set('programa_codigo', e.target.value)}
              className={inputCls} placeholder="PROG-SOC-2024-08" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Nombre del Coordinador <span className="text-red-500">*</span></label>
            <input value={form.coordinador_nombre} onChange={(e) => set('coordinador_nombre', e.target.value)}
              className={inputCls} placeholder="Dra. Elena Vargas Restrepo" />
          </div>
          <div>
            <label className={labelCls}>Correo del Coordinador <span className="text-red-500">*</span></label>
            <input type="email" value={form.coordinador_email} onChange={(e) => set('coordinador_email', e.target.value)}
              className={inputCls} placeholder="coordinador.programa@universidad" />
          </div>
          <div>
            <label className={labelCls}>Sede <span className="text-red-500">*</span></label>
            <select value={form.sede} onChange={(e) => set('sede', e.target.value)} className={inputCls}>
              <option value="">Seleccionar sede...</option>
              {SEDES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </Section>

      <Section
        title="2. Información Básica de la Publicación"
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelCls}>Título del Proyecto o Iniciativa <span className="text-red-500">*</span></label>
            <input value={form.titulo} onChange={(e) => set('titulo', e.target.value)}
              className={inputCls} placeholder="Ej. Programa Integral de Alfabetización Digital en Comunidades Ribereñas" />
          </div>
          <div>
            <label className={labelCls}>Categoría Temática <span className="text-red-500">*</span></label>
            <select value={form.categoria} onChange={(e) => set('categoria', e.target.value)} className={inputCls}>
              <option value="">Seleccionar categoría...</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Fecha Estimada de Inicio <span className="text-red-500">*</span></label>
            <input type="date" value={form.fecha_inicio} onChange={(e) => set('fecha_inicio', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Fecha Estimada de Culminación</label>
            <input type="date" value={form.fecha_fin} onChange={(e) => set('fecha_fin', e.target.value)} className={inputCls} />
          </div>
        </div>
      </Section>

      <Section
        title="3. Resumen Ejecutivo y Descripción Detallada"
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
      >
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[13px] font-medium text-slate-700">Resumen Ejecutivo (Breve síntesis para catálogos y portal público)</label>
            <span className="text-[11px] text-slate-400">Máx. 300 caracteres</span>
          </div>
          <textarea value={form.resumen} onChange={(e) => set('resumen', e.target.value.slice(0, 300))} rows="3"
            className={`${inputCls} resize-none`} placeholder="Síntesis de la iniciativa..." />
        </div>
        <div>
          <label className={labelCls}>Memoria Descriptiva Completa <span className="text-red-500">*</span></label>
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <div className="flex items-center gap-1 px-3 py-2 bg-slate-100 border-b border-slate-200 text-slate-600">
              {['B', 'I', 'U'].map((b) => (
                <span key={b} className={`px-1.5 text-sm ${b === 'B' ? 'font-bold' : b === 'I' ? 'italic' : 'underline'}`}>{b}</span>
              ))}
              <span className="mx-1 text-slate-300">|</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              <span className="ml-auto text-[11px] text-slate-400">Modo enriquecido activo</span>
            </div>
            <textarea value={form.contenido} onChange={(e) => set('contenido', e.target.value)} rows="8"
              className="w-full px-3.5 py-3 text-sm text-slate-800 focus:outline-none resize-none"
              placeholder="Contexto y Justificación: ...&#10;&#10;Metodología de Implementación: ..." />
          </div>
        </div>
      </Section>

      <Section
        title="4. Recursos Multimedia"
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <p className="text-[13px] font-medium text-slate-700 mb-2">Fotografía Principal de Portada</p>
            <label className="block border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={onPortada} />
              {portadaActual ? (
                <img src={portadaActual} alt="Portada" className="mx-auto max-h-40 rounded-lg object-cover" />
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Haz clic o arrastra tu archivo aquí</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG o WebP (Hasta 10MB, mín. 1200x630px)</p>
                  <span className="inline-block mt-3 px-4 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-600">
                    Examinar archivos
                  </span>
                </>
              )}
            </label>
          </div>
          <div>
            <p className="text-[13px] font-medium text-slate-700 mb-2">
              Galería y Evidencias de Campo ({galeria.length + galeriaSubidas.length} previsualizadas)
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {galeriaSubidas.map((g) => (
                <img key={g.id} src={g.ruta} alt={g.nombre} className="h-20 w-full object-cover rounded-lg border border-slate-200" />
              ))}
              {galeria.map((g, i) => (
                <div key={i} className="relative group">
                  <img src={g.preview} alt="" className="h-20 w-full object-cover rounded-lg border border-slate-200" />
                  <button type="button" onClick={() => quitarGaleriaLocal(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-slate-900/70 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    ×
                  </button>
                </div>
              ))}
              {(galeria.length + galeriaSubidas.length) < 8 && (
                <label className="h-20 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors text-slate-500">
                  <input type="file" accept="image/*" multiple className="hidden" onChange={onGaleria} />
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-[11px] font-medium">Añadir foto</span>
                </label>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Puedes añadir hasta 8 fotos adicionales para documentar el proceso de proyección comunitaria.
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="5. Métricas de Impacto y Alianzas Comunitarias"
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className={labelCls}>Beneficiarios Estimados (Directos)</label>
            <input type="number" min="0" value={form.beneficiarios} onChange={(e) => set('beneficiarios', e.target.value)}
              className={inputCls} placeholder="450" />
          </div>
          <div>
            <label className={labelCls}>Ubicación o Comunidad Beneficiada</label>
            <input value={form.ubicacion} onChange={(e) => set('ubicacion', e.target.value)}
              className={inputCls} placeholder="Distrito Oriental, San Carlos" />
          </div>
          <div>
            <label className={labelCls}>Investigador / Docente a Cargo</label>
            <input value={form.investigador} onChange={(e) => set('investigador', e.target.value)}
              className={inputCls} placeholder="Dra. Elena Vargas (Fac. Ingeniería)" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Etiquetas Temáticas (#Tags para indexación)</label>
          <div className={`${inputCls} flex flex-wrap items-center gap-2 min-h-[46px]`}>
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                #{t}
                <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-blue-900">×</button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput) } }}
              onBlur={() => { if (tagInput.trim()) addTag(tagInput) }}
              className="flex-1 min-w-[180px] bg-transparent focus:outline-none text-sm"
              placeholder={tags.length ? '' : 'Escribe una etiqueta y presiona Enter...'}
            />
          </div>
        </div>
      </Section>

      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center gap-4">
        <p className="flex items-start gap-2 text-[13px] text-slate-500 flex-1">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {esAdmin
            ? 'Como administrador puedes publicar directamente o enviar a revisión.'
            : 'Tu propuesta será revisada por el administrador antes de su publicación en el portal.'}
        </p>
        <div className="flex items-center gap-3">
          <Link to={volverA}
            className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors">
            Cancelar
          </Link>
          <button onClick={() => guardar('BORRADOR')} disabled={saving}
            className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors">
            Guardar como Borrador
          </button>
          <button onClick={() => guardar('EN_REVISION')} disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-uniminuto-600 text-white text-sm font-semibold rounded-lg hover:bg-uniminuto-700 disabled:opacity-50 transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
            {saving ? 'Enviando...' : 'Enviar a Revisión'}
          </button>
        </div>
      </div>
    </div>
  )
}