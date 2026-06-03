import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/authContext'

export function Navbar() {
  const { logout } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const isAdmin = location.pathname.startsWith('/admin')

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }`

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-3">

          {/* Hamburguer — lado esquerdo, só no admin */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Menu"
              >
                {menuOpen ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute left-0 mt-2 w-52 bg-white rounded-xl border border-gray-200 shadow-lg z-20 py-2">
                    <NavLink
                      to="/admin"
                      end
                      className={navLinkClass}
                      onClick={() => setMenuOpen(false)}
                    >
                      Eventos
                    </NavLink>
                    <NavLink
                      to="/admin/groups"
                      className={navLinkClass}
                      onClick={() => setMenuOpen(false)}
                    >
                      Células e Grupos
                    </NavLink>
                    <div className="my-2 border-t border-gray-100" />
                    <button
                      onClick={() => { setMenuOpen(false); logout() }}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Logo + breadcrumb */}
          <Link
            to="/admin"
            className="flex items-center gap-2 text-gray-600 font-bold text-lg hover:text-gray-800 transition-colors"
          >
            <img src="/sh-icon.png" alt="SH" className="w-8 h-8 rounded-lg object-cover" />
            <span className="hidden sm:inline">SH GRU - Engajamento</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
