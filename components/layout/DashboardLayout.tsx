// components/layout/DashboardLayout.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import clsx from 'clsx'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
}

const NAV_ITEMS = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    name: 'Pedidos',
    path: '/pedidos',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
      </svg>
    ),
  },
  {
    name: 'Usuarios',
    path: '/admin/usuarios',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
  },
]

export default function DashboardLayout({ children, title = 'Panel de Gestión' }: DashboardLayoutProps) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [userName, setUserName] = useState('')
  const [userRol, setUserRol]   = useState('')
  const [userInitials, setUserInitials] = useState('--')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return
        setUserName(d.nombre || d.email || 'Usuario')
        setUserRol(d.rol || '')
        const parts = (d.nombre || '').trim().split(' ')
        setUserInitials(
          parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : (d.nombre || 'U').slice(0, 2).toUpperCase()
        )
      })
      .catch(() => {})
  }, [])

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (err) {
      console.error('Error al cerrar sesión', err)
    }
  }

  const SidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-surface-700 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center mr-3 shadow-glow flex-shrink-0">
          <span className="text-white font-bold text-sm tracking-tight">GM</span>
        </div>
        <div>
          <div className="text-white font-semibold text-sm leading-tight">Gràfiques Martí</div>
          <div className="text-surface-500 text-xs">Panel de gestión</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-700 text-surface-600 uppercase tracking-widest mb-3">Navegación</p>
        {NAV_ITEMS.map(item => {
          const isActive = router.pathname === item.path || router.pathname.startsWith(item.path + '/')
          return (
            <Link
              key={item.name}
              href={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-500 transition-all duration-150 group',
                isActive
                  ? 'bg-brand-600/15 text-brand-400 border border-brand-500/20'
                  : 'text-surface-400 hover:bg-surface-700/60 hover:text-white border border-transparent'
              )}
            >
              <span className={clsx(
                'transition-colors',
                isActive ? 'text-brand-400' : 'text-surface-500 group-hover:text-surface-300'
              )}>
                {item.icon}
              </span>
              <span>{item.name}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />}
            </Link>
          )
        })}
      </nav>

      {/* Usuario + logout */}
      <div className="p-3 border-t border-surface-700 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-surface-700/40 mb-2">
          <div className="w-9 h-9 rounded-full bg-brand-600/30 border border-brand-500/30 flex items-center justify-center text-sm font-700 text-brand-300 flex-shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-600 text-white truncate">{userName || 'Cargando…'}</div>
            <div className="text-xs text-surface-500 capitalize">{userRol || '—'}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-500 text-surface-400 hover:bg-danger/10 hover:text-danger transition-all duration-150 border border-transparent hover:border-danger/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-900 flex">
      {/* Overlay móvil */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface-800 border-r border-surface-700',
        'transform transition-transform duration-200 ease-in-out',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {SidebarContent}
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
        {/* Topbar */}
        <header className="h-16 bg-surface-800/60 backdrop-blur-md border-b border-surface-700 flex items-center justify-between px-4 sm:px-6 z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-surface-400 hover:text-white rounded-lg hover:bg-surface-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">{title}</h1>
              <p className="text-surface-500 text-xs hidden sm:block">
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Info usuario en topbar */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-surface-400">
              <div className="w-7 h-7 rounded-full bg-brand-600/30 border border-brand-500/30 flex items-center justify-center text-xs font-700 text-brand-300">
                {userInitials}
              </div>
              <span className="text-surface-300 font-500">{userName}</span>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}