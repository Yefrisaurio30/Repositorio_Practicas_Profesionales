import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import RutaAutenticada from './RutaAutenticada.jsx'
import Inicio from '../pages/publico/Inicio.jsx'
import Buscar from '../pages/publico/Buscar.jsx'
import DetallePublicacion from '../pages/publico/DetallePublicacion.jsx'
import Solicitud from '../pages/publico/Solicitud.jsx'
import MisProyectos from '../pages/publico/MisProyectos.jsx'
import Propuesta from '../pages/publico/Propuesta.jsx'

export default function PublicRouter() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/buscar" element={<Buscar />} />
          <Route path="/publicacion/:id" element={<DetallePublicacion />} />
          <Route path="/solicitud" element={<Solicitud />} />
          <Route path="/mis-proyectos" element={<RutaAutenticada><MisProyectos /></RutaAutenticada>} />
          <Route path="/mis-proyectos/nueva" element={<RutaAutenticada><Propuesta /></RutaAutenticada>} />
          <Route path="/mis-proyectos/:id/editar" element={<RutaAutenticada><Propuesta /></RutaAutenticada>} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
