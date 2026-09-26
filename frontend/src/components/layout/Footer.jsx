import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-uniminuto-800 text-blue-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="lg:w-56 flex-shrink-0">
            <p className="text-white font-bold text-[17px] leading-snug">
              Portal de Proyección<br />Social
            </p>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-[13px]">
              <span className="hover:text-white cursor-pointer transition-colors">Política de Privacidad</span>
              <span className="hover:text-white cursor-pointer transition-colors">Términos de Servicio</span>
              <span className="hover:text-white cursor-pointer transition-colors">Repositorio Institucional</span>
            </div>
            <div className="mt-2 text-[13px]">
              <Link to="/solicitud" className="hover:text-white transition-colors">Contacto</Link>
            </div>
          </div>
<div className="border-t border-slate-200 mt-8 text-[12px] text-slate-400 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
        <span className="font-semibold tracking-[0.14em]">NEXUS ACADÉMICO</span>
        <span className="hidden sm:inline text-slate-300">•</span>
        <span className="flex gap-4 sm:ml-auto text-uniminuto-800 font-medium">
          <span className="cursor-pointer hover:underline">Institutional Repository</span>
          <span className="cursor-pointer hover:underline">Privacy Policy</span>
          <span className="cursor-pointer hover:underline">Contact Support</span>
          <span className="cursor-pointer hover:underline">Terms of Service</span>
        </span>
        <span className="sm:ml-auto">© 2026</span>
      </div>
        </div>
      </div>
    </footer>
  )
}