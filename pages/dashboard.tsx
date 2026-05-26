// src/pages/dashboard.tsx
import { useEffect, useState } from 'react'
import Head from 'next/head'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import clsx from 'clsx'

// Colores de estado
const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  recibido:       { label: 'Recibido',      color: 'text-blue-300',   bg: 'bg-blue-500/10 border-blue-500/20',   dot: 'bg-blue-400' },
  preimpresion:   { label: 'Preimpresión',  color: 'text-purple-300', bg: 'bg-purple-500/10 border-purple-500/20', dot: 'bg-purple-400' },
  impresion:      { label: 'Impresión',     color: 'text-yellow-300', bg: 'bg-yellow-500/10 border-yellow-500/20', dot: 'bg-yellow-400' },
  encuadernacion: { label: 'Encuadernación',color: 'text-orange-300', bg: 'bg-orange-500/10 border-orange-500/20', dot: 'bg-orange-400' },
  listo:          { label: 'Listo',         color: 'text-cyan-300',   bg: 'bg-cyan-500/10 border-cyan-500/20',   dot: 'bg-cyan-400' },
  entregado:      { label: 'Entregado',     color: 'text-green-300',  bg: 'bg-green-500/10 border-green-500/20', dot: 'bg-green-400' },
  cancelado:      { label: 'Cancelado',     color: 'text-red-300',    bg: 'bg-red-500/10 border-red-500/20',     dot: 'bg-red-400' },
}

const PRIORIDAD_CONFIG: Record<string, { label: string; color: string }> = {
  baja:    { label: 'Baja',    color: 'text-surface-400' },
  normal:  { label: 'Normal',  color: 'text-blue-300' },
  alta:    { label: 'Alta',    color: 'text-yellow-300' },
  urgente: { label: 'Urgente', color: 'text-red-400' },
}

// Datos demo (en producción vienen de la API)
const MONTHLY_DATA = [
  { mes: 'Ene', pedidos: 14, facturado: 8200 },
  { mes: 'Feb', pedidos: 18, facturado: 10400 },
  { mes: 'Mar', pedidos: 22, facturado: 13800 },
  { mes: 'Abr', pedidos: 19, facturado: 11200 },
  { mes: 'May', pedidos: 27, facturado: 16900 },
  { mes: 'Jun', pedidos: 24, facturado: 14500 },
]

const PEDIDOS_RECIENTES = [
  { id: '1', numero: 'PD-2025-0027', cliente: 'Editorial Planeta', estado: 'impresion',    prioridad: 'alta',   importe: 3200, entrega: '2025-06-30' },
  { id: '2', numero: 'PD-2025-0026', cliente: 'Ayuntamiento BCN',  estado: 'preimpresion', prioridad: 'urgente',importe: 1850, entrega: '2025-06-28' },
  { id: '3', numero: 'PD-2025-0025', cliente: 'Grup Mediapro',     estado: 'listo',         prioridad: 'normal', importe: 780,  entrega: '2025-06-27' },
  { id: '4', numero: 'PD-2025-0024', cliente: 'Universidad UAB',   estado: 'encuadernacion',prioridad: 'normal', importe: 2100, entrega: '2025-07-05' },
  { id: '5', numero: 'PD-2025-0023', cliente: 'Nestlé España',     estado: 'entregado',    prioridad: 'baja',   importe: 950,  entrega: '2025-06-25' },
]

function KPICard({ label, value, sub, icon, trend, color = 'brand' }: {
  label: string; value: string; sub?: string; icon: React.ReactNode;
  trend?: { value: string; up: boolean }; color?: string
}) {
  return (
    <div className="card card-hover p-5 flex flex-col gap-3 animate-slide-up">
      <div className="flex items-start justify-between">
        <div className={clsx(
          'w-10 h-10 rounded-xl flex items-center justify-center',
          color === 'brand'   && 'bg-brand-600/15 text-brand-400',
          color === 'success' && 'bg-success/15 text-success',
          color === 'warning' && 'bg-warning/15 text-warning',
          color === 'danger'  && 'bg-danger/15 text-danger',
          color === 'cyan'    && 'bg-cyan-500/15 text-cyan-400',
        )}>
          {icon}
        </div>
        {trend && (
          <span className={clsx(
            'text-xs font-500 px-2 py-0.5 rounded-full',
            trend.up ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
          )}>
            {trend.up ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-display font-700 text-white">{value}</div>
        <div className="text-sm text-surface-300 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-surface-500 mt-1">{sub}</div>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [hora, setHora] = useState('')

  useEffect(() => {
    const tick = () => setHora(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }))
    tick()
    const id = setInterval(tick, 60000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <Head><title>Dashboard — Gràfiques Martí</title></Head>
      <DashboardLayout title="Dashboard">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Saludo */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-700 text-white">Buenos días 👋</h2>
              <p className="text-surface-400 text-sm mt-1">Resumen de actividad — hoy a las {hora}</p>
            </div>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-500 rounded-lg transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nuevo pedido
            </button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            <KPICard
              label="Pedidos activos"
              value="18"
              sub="4 urgentes"
              color="brand"
              trend={{ value: '+3 hoy', up: true }}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}
            />
            <KPICard
              label="Presupuestos pendientes"
              value="7"
              sub="2 por caducar"
              color="warning"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
            />
            <KPICard
              label="Facturado este mes"
              value="16.900 €"
              sub="vs 14.500 € anterior"
              color="success"
              trend={{ value: '+16.5%', up: true }}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
            />
            <KPICard
              label="Facturas pendientes cobro"
              value="3.250 €"
              color="danger"
              sub="2 facturas vencidas"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
            />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

            {/* Pedidos por mes */}
            <div className="card p-5 lg:col-span-3">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-display font-600 text-white">Pedidos por mes</h3>
                  <p className="text-xs text-surface-400 mt-0.5">Últimos 6 meses</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={MONTHLY_DATA} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2d45" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#0d1f3a', border: '1px solid #1a3a5c', borderRadius: 8, fontSize: 13 }}
                    labelStyle={{ color: '#94a3b8' }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                  <Bar dataKey="pedidos" fill="#1a6fd4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Facturación */}
            <div className="card p-5 lg:col-span-2">
              <div className="mb-5">
                <h3 className="font-display font-600 text-white">Facturación (€)</h3>
                <p className="text-xs text-surface-400 mt-0.5">Últimos 6 meses</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={MONTHLY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2d45" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={55}
                    tickFormatter={v => `${(v/1000).toFixed(0)}k€`} />
                  <Tooltip
                    contentStyle={{ background: '#0d1f3a', border: '1px solid #1a3a5c', borderRadius: 8, fontSize: 13 }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(v: any) => [`${v.toLocaleString('es-ES')} €`, 'Facturado']}
                  />
                  <Line type="monotone" dataKey="facturado" stroke="#22c55e" strokeWidth={2.5}
                    dot={{ fill: '#22c55e', strokeWidth: 0, r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pedidos recientes + Estado pipeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Tabla pedidos */}
            <div className="card lg:col-span-2">
              <div className="flex items-center justify-between p-5 border-b border-surface-700">
                <h3 className="font-display font-600 text-white">Pedidos recientes</h3>
                <a href="/pedidos" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">Ver todos →</a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-700">
                      <th className="text-left px-5 py-3 text-xs font-500 text-surface-400 uppercase tracking-wider">Pedido</th>
                      <th className="text-left px-3 py-3 text-xs font-500 text-surface-400 uppercase tracking-wider hidden md:table-cell">Cliente</th>
                      <th className="text-left px-3 py-3 text-xs font-500 text-surface-400 uppercase tracking-wider">Estado</th>
                      <th className="text-right px-5 py-3 text-xs font-500 text-surface-400 uppercase tracking-wider">Importe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-700/50">
                    {PEDIDOS_RECIENTES.map(p => {
                      const est = ESTADO_CONFIG[p.estado]
                      const pri = PRIORIDAD_CONFIG[p.prioridad]
                      return (
                        <tr key={p.id} className="hover:bg-surface-700/30 transition-colors cursor-pointer">
                          <td className="px-5 py-3.5">
                            <div className="font-500 text-white text-xs">{p.numero}</div>
                            <div className={clsx('text-xs mt-0.5', pri.color)}>{pri.label}</div>
                          </td>
                          <td className="px-3 py-3.5 text-surface-300 hidden md:table-cell">{p.cliente}</td>
                          <td className="px-3 py-3.5">
                            <span className={clsx('badge border text-xs', est.bg, est.color)}>
                              <span className={clsx('badge-dot', est.dot)} />
                              {est.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right font-500 text-white">
                            {p.importe.toLocaleString('es-ES')} €
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pipeline de estados */}
            <div className="card p-5">
              <h3 className="font-display font-600 text-white mb-4">Pipeline de producción</h3>
              <div className="space-y-3">
                {Object.entries(ESTADO_CONFIG).filter(([k]) => k !== 'cancelado' && k !== 'entregado').map(([key, cfg]) => {
                  const counts: Record<string, number> = {
                    recibido: 3, preimpresion: 4, impresion: 5, encuadernacion: 3, listo: 3
                  }
                  const count = counts[key] || 0
                  const max = 5
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={clsx('w-2 h-2 rounded-full', cfg.dot)} />
                          <span className="text-sm text-surface-300">{cfg.label}</span>
                        </div>
                        <span className="text-sm font-500 text-white">{count}</span>
                      </div>
                      <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
                        <div className={clsx('h-full rounded-full transition-all', cfg.dot)}
                          style={{ width: `${(count / max) * 100}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-surface-700 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-400">Entregados hoy</span>
                  <span className="text-success font-500">2</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-400">Cancelados mes</span>
                  <span className="text-danger font-500">1</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </DashboardLayout>
    </>
  )
}