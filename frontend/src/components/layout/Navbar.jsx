import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { getUsuarioActual, logout } from '../../services/authService.js'
import { isStaff } from '../../utils/roles.js'

const NAV_LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/buscar', label: 'Proyectos' },
  { to: '/#impacto', label: 'Impacto', hash: true },
  { to: '/#acerca', label: 'Acerca de', hash: true },
]

const NAV_LINKS_USER = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/buscar', label: 'Proyectos' },
  { to: '/mis-proyectos', label: 'Mis Proyectos' },
  { to: '/#impacto', label: 'Impacto', hash: true },
]

function iniciales(nombre) {
  if (!nombre) return '•'
  const partes = nombre.trim().split(/\s+/)
  if (partes.length === 1) return partes[0].slice(0, 1).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const menuRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    const res = await logout()
    setDropdownOpen(false)
    if (res.ok) {
      navigate('/login', { replace: true })
    } else {
      alert('No se pudo cerrar sesión: ' + res.error)
    }
  }

  useEffect(() => {
    let cancelled = false
    getUsuarioActual().then((u) => { if (!cancelled) setUser(u) })
    return () => { cancelled = true }
  }, [location.pathname])

  useEffect(() => {
    setOpen(false)
    setDropdownOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onPageshow = (e) => {
      if (e.persisted) {
        window.location.reload()
      }
    }
    window.addEventListener('pageshow', onPageshow)
    return () => window.removeEventListener('pageshow', onPageshow)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open && !dropdownOpen) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, dropdownOpen])

  const isStaffFlag = isStaff(user)
  const links = user ? NAV_LINKS_USER : NAV_LINKS
  const nombreMostrar = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.username || ''

  const linkCls = ({ isActive }) =>
    `px-3 py-2 text-[14px] font-medium transition-colors relative ${
      isActive ? 'text-uniminuto-800' : 'text-slate-600 hover:text-uniminuto-800'
    }`

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-white ${
          scrolled ? 'shadow-sm' : 'shadow-none border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">
            <Link to="/" className="text-[19px] font-bold text-uniminuto-800 tracking-tight">
              Portal de Proyección Social
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {(links).map((link) =>
                link.hash ? (
                  <a key={link.to} href={link.to} className="px-3 py-2 text-[14px] font-medium text-slate-600 hover:text-uniminuto-800 transition-colors">
                    {link.label}
                  </a>
                ) : (
                  <NavLink key={link.to} to={link.to} end={link.end} className={linkCls}>
                    {({ isActive }) => (
                      <>
                        {link.label}
                        {isActive && <span className="absolute left-3 right-3 -bottom-[1px] h-[2px] bg-uniminuto-800 rounded-full" />}
                      </>
                    )}
                  </NavLink>
                )
              )}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-slate-200 hover:border-slate-300 transition-colors"
                    title={nombreMostrar}
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                  >
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {iniciales(nombreMostrar)}
                    </span>
                    <span className="text-[13px] font-medium text-slate-700 max-w-[120px] truncate">
                      {nombreMostrar}
                    </span>
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-50 animate-fade-up">
                      <button
                        onClick={() => { navigate('/mis-proyectos'); setDropdownOpen(false); }}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Mis Proyectos
                      </button>
                      {isStaffFlag && (
                        <button
                          onClick={() => { navigate('/admin/dashboard'); setDropdownOpen(false); }}
                          className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Panel Admin
                        </button>
                      )}
                      <hr className="my-1 border-slate-100" />
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="text-[14px] font-semibold text-uniminuto-800 hover:text-blue-600 transition-colors">
                  Iniciar sesión
                </Link>
              )}
              {(!user || isStaffFlag) && (
                <Link
                  to={isStaffFlag ? '/admin/dashboard' : '/login'}
                  className="px-4 py-2 bg-uniminuto-600 text-white text-[13px] font-semibold rounded-lg hover:bg-uniminuto-700 transition-colors shadow-sm"
                >
                  {isStaffFlag ? 'Panel Admin' : 'Acceso Admin'}
                </Link>
              )}
            </div>

            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <div ref={menuRef} className="md:hidden bg-white border-t border-slate-100 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {links.filter((l) => !l.hash).map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="pt-2 border-t border-slate-100 mt-2 space-y-2">
                {user ? (
                  <Link
                    to={isStaffFlag ? '/admin/dashboard' : '/'}
                    className="block text-center px-4 py-3 bg-uniminuto-600 text-white text-sm font-semibold rounded-lg"
                  >
                    {isStaffFlag ? 'Panel Admin' : nombreMostrar}
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="block text-center px-4 py-3 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg">
                      Iniciar sesión
                    </Link>
                    <Link to="/login" className="block text-center px-4 py-3 bg-uniminuto-600 text-white text-sm font-semibold rounded-lg">
                      Acceso Admin
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}