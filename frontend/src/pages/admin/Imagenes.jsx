import React, { useEffect, useState, useCallback } from 'react'
import {
  subirImagen,
  getImagenes,
  getPublicacionesAdmin,
} from '../../services/publicacionesService.js'

export default function Imagenes() {
  const [imagenes, setImagenes] = useState([])
  const [publicaciones, setPublicaciones] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [publicacionId, setPublicacionId] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [imgRes, pubRes] = await Promise.all([
        getImagenes(),
        getPublicacionesAdmin(),
      ])
      setImagenes(imgRes.results || imgRes)
      setPublicaciones(pubRes.results || pubRes)
    } catch (err) {
      alert('Error al cargar imagenes: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleUpload = async () => {
    if (!selectedFile || !publicacionId) {
      alert('Seleccione una imagen y una publicacion.')
      return
    }
    setUploading(true)
    try {
      await subirImagen(selectedFile, {
        publicacion: publicacionId,
        descripcion,
        nombre: selectedFile.name,
      })
      setSelectedFile(null)
      setPreviewUrl(null)
      setPublicacionId('')
      setDescripcion('')
      fetchData()
    } catch (err) {
      alert('Error al subir la imagen: ' + (err.response?.data?.detail || err.message))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Imagenes</h1>
      </div>

      <div className="uploader">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Vista previa"
            style={{ maxWidth: 300, maxHeight: 200, borderRadius: 8, objectFit: 'cover' }}
          />
        ) : (
          <p>Seleccione una imagen para subir</p>
        )}
        <div>
          <input type="file" accept="image/*" onChange={handleFileSelect} />
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
          <select
            className="filter-select"
            value={publicacionId}
            onChange={(e) => setPublicacionId(e.target.value)}
          >
            <option value="">Seleccionar publicacion...</option>
            {publicaciones.map((p) => (
              <option key={p.id} value={p.id}>
                {p.titulo} ({p.estado})
              </option>
            ))}
          </select>
          <input
            className="search-bar"
            placeholder="Descripcion (opcional)"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            style={{ maxWidth: 260 }}
          />
          <button className="btn" onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Subiendo...' : 'Subir Imagen'}
          </button>
        </div>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="preview-grid">
          {imagenes.map((img) => (
            <div key={img.id} className="preview-card">
              <img src={img.ruta} alt={img.nombre} />
              <div className="info">
                <strong>{img.nombre}</strong>
                <p>{img.publicacion_titulo}</p>
                {img.descripcion && <p style={{ color: 'var(--muted)' }}>{img.descripcion}</p>}
                <p style={{ color: 'var(--muted)', fontSize: 12 }}>
                  {new Date(img.fechaCarga).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {imagenes.length === 0 && (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--muted)' }}>
              No hay imagenes cargadas.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
