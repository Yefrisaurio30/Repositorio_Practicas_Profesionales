import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PublicRouter from './routes/AppRouter.jsx'
import RutaPrivada from './routes/RutaPrivada.jsx'
import AdminLayout from './components/layout/AdminLayout.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import Publicaciones from './pages/admin/Publicaciones.jsx'
import NuevaPublicacion from './pages/admin/NuevaPublicacion.jsx'
import Imagenes from './pages/admin/Imagenes.jsx'
import Comentarios from './pages/admin/Comentarios.jsx'
import Usuarios from './pages/admin/Usuarios.jsx'
import SolicitudesAdmin from './pages/admin/Solicitudes.jsx'
import Actividad from './pages/admin/Actividad.jsx'
import Reportes from './pages/admin/Reportes.jsx'
import Login from './pages/publico/Login.jsx'
import Registro from './pages/publico/Registro.jsx'
import NoAutorizado from './pages/publico/NoAutorizado.jsx'

function AdminRouter() {
  return (
    <RutaPrivada>
      <AdminLayout>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="publicaciones" element={<Publicaciones />} />
          <Route path="publicaciones/nueva" element={<NuevaPublicacion />} />
          <Route path="imagenes" element={<Imagenes />} />
          <Route path="comentarios" element={<Comentarios />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="solicitudes" element={<SolicitudesAdmin />} />
          <Route path="trazabilidad" element={<Actividad />} />
          <Route path="reportes" element={<Reportes />} />
        </Routes>
      </AdminLayout>
    </RutaPrivada>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={<AdminRouter />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/unauthorized" element={<NoAutorizado />} />
        <Route path="*" element={<PublicRouter />} />
      </Routes>
    </Router>
  )
}
