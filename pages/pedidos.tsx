// src/pages/pedidos.tsx
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import DashboardLayout from '@/components/layout/DashboardLayout'
import clsx from 'clsx'

const ESTADOS = ['todos','recibido','preimpresion','impresion','encuadernacion','listo','entregado','cancelado']
const PRIORIDADES = ['todas','baja','normal','alta','urgente']

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  recibido:       { label: 'Recibido',       color: 'text-blue-300',    bg: 'bg-blue-500/10 border-blue-500/20',    dot: 'bg-blue-400' },
  preimpresion:   { label: 'Preimpresión',   color: 'text-purple-300',  bg: 'bg-purple-500/10 border-purple-500/20',dot: 'bg-purple-400' },
  impresion:      { label: 'Impresión',      color: 'text-yellow-300',  bg: 'bg-yellow-500/10 border-yellow-500/20',dot: 'bg-yellow-400' },
  encuadernacion: { label: 'Encuadernación', color: 'text-orange-300',  bg: 'bg-orange-500/10 border-orange-500/20',dot: 'bg-orange-400' },
  listo:          { label: 'Listo',          color: 'text-cyan-300',    bg: 'bg-cyan-500/10 border-cyan-500/20',    dot: 'bg-cyan-400' },
  entregado:      { label: 'Entregado',      color: 'text-green-300',   bg: 'bg-green-500/10 border-green-500/20',  dot: 'bg-green-400' },
  cancelado:      { label: 'Cancelado',      color: 'text-red-300',     bg: 'bg-red-500/10 border-red-500/20',      dot: 'bg-red-400' },
}

const PRIORIDAD_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  baja:    { label: 'Baja',    color: 'text-surface-400', icon: '↓' },
  normal:  { label: 'Normal',  color: 'text-blue-300',    icon: '→' },
  alta:    { label: 'Alta',    color: 'text-yellow-300',  icon: '↑' },
  urgente: { label: 'Urgente', color: 'text-red-400',     icon: '⚡' },
}

// Datos demo
const DEMO_PEDIDOS = [
  { id:'1', numero:'PD-2025-0027', titulo:'Catálogo corporativo Q2', cliente:'Editorial Planeta',   estado:'impresion',      prioridad:'alta',    importe_total:3200, fecha_entrada:'2025-06-20', fecha_entrega:'2025-06-30' },
  { id:'2', numero:'PD-2025-0026', titulo:'Folletos campaña verano', cliente:'Ayuntamiento BCN',    estado:'preimpresion',   prioridad:'urgente', importe_total:1850, fecha_entrada:'2025-06-19', fecha_entrega:'2025-06-28' },
  { id:'3', numero:'PD-2025-0025', titulo:'Memoria anual 2024',      cliente:'Grup Mediapro',       estado:'listo',          prioridad:'normal',  importe_total:780,  fecha_entrada:'2025-06-18', fecha_entrega:'2025-06-27' },
  { id:'4', numero:'PD-2025-0024', titulo:'Manual de instrucciones', cliente:'Universidad UAB',     estado:'encuadernacion', prioridad:'normal',  importe_total:2100, fecha_entrada:'2025-06-17', fecha_entrega:'2025-07-05' },
  { id:'5', numero:'PD-2025-0023', titulo:'Packaging navideño',      cliente:'Nestlé España',       estado:'entregado',      prioridad:'baja',    importe_total:950,  fecha_entrada:'2025-06-15', fecha_entrega:'2025-06-25' },
  { id:'6', numero:'PD-2025-0022', titulo:'Libro de arte limitado',  cliente:'Fundació Joan Miró',  estado:'recibido',       prioridad:'alta',    importe_total:4500, fecha_entrada:'2025-06-14', fecha_entrega:'2025-07-10' },
  { id:'7', numero:'PD-2025-0021', titulo:'Tarjetas de visita',      cliente:'Bufete Garrigues',    estado:'entregado',      prioridad:'baja',    importe_total:320,  fecha_entrada:'2025-06-12', fecha_entrega:'2025-06-20' },
  { id:'8', numero:'PD-2025-0020', titulo:'Carteles feria BCN',      cliente:'Fira de Barcelona',   estado:'impresion',      prioridad:'urgente', importe_total:2800, fecha_entrada:'2025-06-11', fecha_entrega:'2025-06-26' },
]

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState(DEMO_PEDIDOS)
  const [estadoFiltro, setEstadoFiltro] = useState('todos')
  const [prioridadFiltro, setPrioridadFiltro] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [showModal, setShowModal] = useState(false)

  const filtered = pedidos.filter(p => {
    if (estadoFiltro    !== 'todos'  && p.estado    !== estadoFiltro)    return false
    if (prioridadFiltro !== 'todas'  && p.prioridad !== prioridadFiltro) return false
    if (busqueda && !p.numero.toLowerCase().includes(busqueda.toLowerCase()) &&
        !p.titulo.toLowerCase().includes(busqueda.toLowerCase()) &&
        !p.cliente.toLowerCase().includes(busqueda.toLowerCase())) return false
    return true
  })

  function diasRestantes(fecha: string) {
    const diff = Math.ceil((new Date(fecha).getTime() - Date.now()) / 86400000)
    return diff
  }

  return (
    <>
      <Head><title>Pedidos — Gràfiques Martí</title></Head>
      <DashboardLayout title="Pedidos">
        <div className="max-w-7xl mx-auto space-y-5">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-surface-400 text-sm">{filtered.length} pedidos encontrados</p>
            </div>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-500 rounded-lg transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nuevo pedido
            </button>
          </div>

          {/* Filtros */}
          <div className="card p-4 flex flex-col sm:flex-row gap-3">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </span>
              <input type="text" placeholder="Buscar por número, título o cliente…"
                value={busqueda} onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-900 border border-surface-600 rounded-lg text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-400 transition-colors"
              />
            </div>

            {/* Estado */}
            <select value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)}
              className="px-3 py-2 bg-surface-900 border border-surface-600 rounded-lg text-sm text-white focus:outline-none focus:border-brand-400 transition-colors">
              {ESTADOS.map(e => (
                <option key={e} value={e}>{e === 'todos' ? 'Todos los estados' : ESTADO_CONFIG[e]?.label}</option>
              ))}
            </select>

            {/* Prioridad */}
            <select value={prioridadFiltro} onChange={e => setPrioridadFiltro(e.target.value)}
              className="px-3 py-2 bg-surface-900 border border-surface-600 rounded-lg text-sm text-white focus:outline-none focus:border-brand-400 transition-colors">
              {PRIORIDADES.map(p => (
                <option key={p} value={p}>{p === 'todas' ? 'Todas las prioridades' : PRIORIDAD_CONFIG[p]?.label}</option>
              ))}
            </select>
          </div>

          {/* Tabla */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-700 bg-surface-900/50">
                    <th className="text-left px-5 py-3.5 text-xs font-500 text-surface-400 uppercase tracking-wider">Nº Pedido</th>
                    <th className="text-left px-3 py-3.5 text-xs font-500 text-surface-400 uppercase tracking-wider">Título / Cliente</th>
                    <th className="text-left px-3 py-3.5 text-xs font-500 text-surface-400 uppercase tracking-wider">Estado</th>
                    <th className="text-left px-3 py-3.5 text-xs font-500 text-surface-400 uppercase tracking-wider hidden lg:table-cell">Entrega</th>
                    <th className="text-right px-5 py-3.5 text-xs font-500 text-surface-400 uppercase tracking-wider">Importe</th>
                    <th className="px-3 py-3.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-700/40">
                  {filtered.map(p => {
                    const est = ESTADO_CONFIG[p.estado]
                    const pri = PRIORIDAD_CONFIG[p.prioridad]
                    const dias = diasRestantes(p.fecha_entrega)
                    return (
                      <tr key={p.id} className="hover:bg-surface-700/20 transition-colors cursor-pointer group">
                        <td className="px-5 py-4">
                          <div className="font-500 text-white text-xs font-mono">{p.numero}</div>
                          <div className={clsx('text-xs mt-0.5 flex items-center gap-1', pri.color)}>
                            <span>{pri.icon}</span> {pri.label}
                          </div>
                        </td>
                        <td className="px-3 py-4 max-w-xs">
                          <div className="font-500 text-white truncate">{p.titulo}</div>
                          <div className="text-xs text-surface-400 mt-0.5">{p.cliente}</div>
                        </td>
                        <td className="px-3 py-4">
                          <span className={clsx('badge border', est.bg, est.color)}>
                            <span className={clsx('badge-dot', est.dot)} />
                            {est.label}
                          </span>
                        </td>
                        <td className="px-3 py-4 hidden lg:table-cell">
                          <div className="text-surface-300 text-xs">
                            {new Date(p.fecha_entrega).toLocaleDateString('es-ES')}
                          </div>
                          {p.estado !== 'entregado' && p.estado !== 'cancelado' && (
                            <div className={clsx(
                              'text-xs mt-0.5 font-500',
                              dias < 0  ? 'text-danger' :
                              dias <= 3 ? 'text-warning' : 'text-surface-500'
                            )}>
                              {dias < 0 ? `Vencido hace ${Math.abs(dias)}d` : dias === 0 ? 'Hoy' : `${dias}d restantes`}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="font-500 text-white">{p.importe_total.toLocaleString('es-ES')} €</span>
                        </td>
                        <td className="px-3 py-4">
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity text-surface-400 hover:text-brand-400">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-16 text-surface-500">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="mx-auto mb-3 opacity-40">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  No se encontraron pedidos con esos filtros
                </div>
              )}
            </div>
          </div>

        </div>
      </DashboardLayout>
    </>
  )
}