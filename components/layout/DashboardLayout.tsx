import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import clsx from 'clsx'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
}

export default function DashboardLayout({ children, title = 'Panel de Gestión' }: DashboardLayoutProps) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Pedidos', path: '/pedidos', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { name: 'Usuarios', path: '/admin/usuarios', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' }
  ]

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Error al cerrar sesión', error)
    }
  }

  return (
    <div className="min-h-screen bg-surface-900 flex">
      {/* Sidebar móvil overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface-800 border-r border-surface-700 transform transition-transform duration-200 ease-in-out flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-surface-700">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center mr-3">
            <span className="text-white font-display font-700 text-sm">GM</span>
          </div>
          <span className="text-white font-display font-600 tracking-tight">Gràfiques Martí</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-2 text-xs font-500 text-surface-500 uppercase tracking-wider mb-4">Menú principal</p>
          {navItems.map((item) => {
            const isActive = router.pathname.startsWith(item.path)
            return (
              <Link key={item.name} href={item.path} className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-500 transition-colors group",
                isActive 
                  ? "bg-brand-600/10 text-brand-400" 
                  : "text-surface-400 hover:bg-surface-700 hover:text-white"
              )}>
                <svg className={clsx("w-5 h-5", isActive ? "text-brand-400" : "text-surface-500 group-hover:text-surface-300")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-surface-700">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-500 text-surface-400 hover:bg-danger/10 hover:text-danger transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-surface-800/50 backdrop-blur-md border-b border-surface-700 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-surface-400 hover:text-white p-1"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-white font-display font-600 text-lg sm:text-xl truncate">{title}</h1>
          </div>
        </header>

        {/* Renderizado de las páginas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}