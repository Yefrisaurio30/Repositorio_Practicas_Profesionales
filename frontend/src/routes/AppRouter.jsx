import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import RutaProtegida from './RutaProtegida.jsx'
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
          <Route
            path="/mis-proyectos"
            element={
              <RutaProtegida>
                <MisProyectos />
              </RutaProtegida>
            }
          />
          <Route
            path="/mis-proyectos/nueva"
            element={
              <RutaProtegida>
                <Propuesta />
              </RutaProtegida>
            }
          />
          <Route
            path="/mis-proyectos/:id/editar"
            element={
              <RutaProtegida>
                <Propuesta />
              </RutaProtegida>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
