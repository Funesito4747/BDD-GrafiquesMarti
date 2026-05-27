// pages/dashboard.tsx
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Cell
} from 'recharts'
import clsx from 'clsx'

// ─── Datos ────────────────────────────────────────────────────────────────────
const MONTHLY_DATA = [
  { mes: 'Ene', pedidos: 14, facturado: 8200 },
  { mes: 'Feb', pedidos: 18, facturado: 10400 },
  { mes: 'Mar', pedidos: 22, facturado: 13800 },
  { mes: 'Abr', pedidos: 19, facturado: 11200 },
  { mes: 'May', pedidos: 27, facturado: 16900 },
  { mes: 'Jun', pedidos: 24, facturado: 14500 },
]

const PEDIDOS_RECIENTES = [
  { id:'1', numero:'PD-2025-0027', titulo:'Catálogo corporativo Q2', cliente:'Editorial Planeta',  estado:'impresion',    prioridad:'alta',    importe:3200, entrega:'2025-06-30', responsable:'Joan Puig' },
  { id:'2', numero:'PD-2025-0026', titulo:'Folletos campaña verano', cliente:'Ayuntamiento BCN',   estado:'preimpresion', prioridad:'urgente', importe:1850, entrega:'2025-06-28', responsable:'Maria Sánchez' },
  { id:'3', numero:'PD-2025-0025', titulo:'Memoria anual 2024',      cliente:'Grup Mediapro',      estado:'listo',        prioridad:'normal',  importe:780,  entrega:'2025-06-27', responsable:'Joan Puig' },
  { id:'4', numero:'PD-2025-0024', titulo:'Manual instrucciones',    cliente:'Universidad UAB',    estado:'encuadernacion',prioridad:'normal', importe:2100, entrega:'2025-07-05', responsable:'Maria Sánchez' },
  { id:'5', numero:'PD-2025-0023', titulo:'Packaging navideño',      cliente:'Nestlé España',      estado:'entregado',    prioridad:'baja',    importe:950,  entrega:'2025-06-25', responsable:'Joan Puig' },
]

const ESTADO_CFG: Record<string, { label: string; color: string; bg: string; dot: string; border: string }> = {
  recibido:       { label:'Recibido',       color:'text-blue-300',   bg:'bg-blue-500/10',   dot:'bg-blue-400',   border:'border-blue-500/30' },
  preimpresion:   { label:'Preimpresión',   color:'text-purple-300', bg:'bg-purple-500/10', dot:'bg-purple-400', border:'border-purple-500/30' },
  impresion:      { label:'Impresión',      color:'text-yellow-300', bg:'bg-yellow-500/10', dot:'bg-yellow-400', border:'border-yellow-500/30' },
  encuadernacion: { label:'Encuadernación', color:'text-orange-300', bg:'bg-orange-500/10', dot:'bg-orange-400', border:'border-orange-500/30' },
  listo:          { label:'Listo',          color:'text-cyan-300',   bg:'bg-cyan-500/10',   dot:'bg-cyan-400',   border:'border-cyan-500/30' },
  entregado:      { label:'Entregado',      color:'text-green-300',  bg:'bg-green-500/10',  dot:'bg-green-400',  border:'border-green-500/30' },
  cancelado:      { label:'Cancelado',      color:'text-red-300',    bg:'bg-red-500/10',    dot:'bg-red-400',    border:'border-red-500/30' },
}

const PRIORIDAD_CFG: Record<string, { label: string; color: string; icon: string }> = {
  baja:    { label:'Baja',    color:'text-surface-400', icon:'↓' },
  normal:  { label:'Normal',  color:'text-blue-300',    icon:'→' },
  alta:    { label:'Alta',    color:'text-yellow-300',  icon:'↑' },
  urgente: { label:'Urgente', color:'text-red-400',     icon:'⚡' },
}

const PIPELINE = [
  { key:'recibido',       count:3 },
  { key:'preimpresion',   count:4 },
  { key:'impresion',      count:5 },
  { key:'encuadernacion', count:3 },
  { key:'listo',          count:3 },
]
const MAX_PIPELINE = 5

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, icon, trend, color = 'brand', delay = 0 }: {
  label: string; value: string; sub?: string; icon: React.ReactNode
  trend?: { value: string; up: boolean }; color?: string; delay?: number
}) {
  const iconClass = {
    brand:   'bg-brand-600/15 text-brand-400',
    success: 'bg-success/15 text-success',
    warning: 'bg-warning/15 text-warning',
    danger:  'bg-danger/15 text-danger',
    cyan:    'bg-cyan-500/15 text-cyan-400',
  }[color] || 'bg-brand-600/15 text-brand-400'

  return (
    <div className={clsx('card card-hover p-5 flex flex-col gap-4', `animate-in-delay-${delay}`)}>
      <div className="flex items-start justify-between">
        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center', iconClass)}>
          {icon}
        </div>
        {trend && (
          <span className={clsx(
            'text-xs font-700 px-2.5 py-1 rounded-full',
            trend.up ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
          )}>
            {trend.up ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold text-white leading-none">{value}</div>
        <div className="text-base text-surface-300 font-500 mt-1">{label}</div>
        {sub && <div className="text-sm text-surface-500 mt-1">{sub}</div>}
      </div>
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [hora, setHora]       = useState('')
  const [saludo, setSaludo]   = useState('Hola')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const h = new Date().getHours()
    setSaludo(h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches')
    const tick = () => setHora(new Date().toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' }))
    tick()
    const id = setInterval(tick, 60000)

    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.nombre) setUserName(d.nombre.split(' ')[0]) })
      .catch(() => {})

    return () => clearInterval(id)
  }, [])

  return (
    <>
      <Head><title>Dashboard — Gràfiques Martí</title></Head>
      <DashboardLayout title="Dashboard">
        <div className="max-w-7xl mx-auto space-y-7">

          {/* Saludo */}
          <div className="flex items-start justify-between gap-4 animate-in">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {saludo}{userName ? `, ${userName}` : ''} 👋
              </h2>
              <p className="text-base text-surface-400 mt-1">
                Resumen del panel · <span className="text-surface-300">{hora}</span>
              </p>
            </div>
            <Link
              href="/pedidos"
              className="hidden sm:flex items-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-500 text-white text-sm font-600 rounded-xl transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nuevo pedido
            </Link>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard delay={1}
              label="Pedidos activos"
              value="18"
              sub="4 urgentes hoy"
              color="brand"
              trend={{ value: '+3 esta semana', up: true }}
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>}
            />
            <KPICard delay={2}
              label="Presupuestos pend."
              value="7"
              sub="2 caducan pronto"
              color="warning"
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
            />
            <KPICard delay={3}
              label="Facturado este mes"
              value="16.900 €"
              sub="vs 14.500 € anterior"
              color="success"
              trend={{ value: '+16.5%', up: true }}
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
            />
            <KPICard delay={4}
              label="Pendiente de cobro"
              value="3.250 €"
              sub="2 facturas vencidas"
              color="danger"
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
            />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 animate-in-delay-2">

            {/* Barras — pedidos por mes */}
            <div className="card p-6 lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Pedidos por mes</h3>
                  <p className="text-sm text-surface-400 mt-0.5">Últimos 6 meses</p>
                </div>
                <span className="text-2xl font-bold text-white">
                  {MONTHLY_DATA.reduce((a, b) => a + b.pedidos, 0)}
                  <span className="text-sm font-400 text-surface-400 ml-1">total</span>
                </span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={MONTHLY_DATA} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill: '#64748b', fontSize: 13 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 13 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(59,130,246,0.06)' }}
                    contentStyle={{ background:'#1e293b', border:'1px solid #334155', borderRadius:10, fontSize:13 }}
                    labelStyle={{ color:'#94a3b8', fontWeight:600 }}
                    itemStyle={{ color:'#60a5fa' }}
                  />
                  <Bar dataKey="pedidos" radius={[6,6,0,0]}>
                    {MONTHLY_DATA.map((_, i) => (
                      <Cell key={i} fill={i === MONTHLY_DATA.length - 1 ? '#3b82f6' : '#1e40af'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Línea — facturación */}
            <div className="card p-6 lg:col-span-2">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white">Facturación</h3>
                <p className="text-sm text-surface-400 mt-0.5">Últimos 6 meses</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={MONTHLY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill:'#64748b', fontSize:13 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'#64748b', fontSize:13 }} axisLine={false} tickLine={false} width={58}
                    tickFormatter={v => `${(v/1000).toFixed(0)}k€`} />
                  <Tooltip
                    contentStyle={{ background:'#1e293b', border:'1px solid #334155', borderRadius:10, fontSize:13 }}
                    labelStyle={{ color:'#94a3b8', fontWeight:600 }}
                    formatter={(v: any) => [`${Number(v).toLocaleString('es-ES')} €`, 'Facturado']}
                  />
                  <Line
                    type="monotone" dataKey="facturado" stroke="#22c55e" strokeWidth={2.5}
                    dot={{ fill:'#22c55e', strokeWidth:0, r:4 }} activeDot={{ r:6, fill:'#4ade80' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabla recientes + pipeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in-delay-3">

            {/* Tabla pedidos recientes */}
            <div className="card lg:col-span-2 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-surface-700">
                <h3 className="text-lg font-bold text-white">Pedidos recientes</h3>
                <Link href="/pedidos" className="text-sm text-brand-400 hover:text-brand-300 font-600 transition-colors">
                  Ver todos →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-700/50">
                      <th className="text-left px-6 py-3.5 text-xs font-700 text-surface-500 uppercase tracking-widest">Pedido</th>
                      <th className="text-left px-3 py-3.5 text-xs font-700 text-surface-500 uppercase tracking-widest hidden md:table-cell">Cliente</th>
                      <th className="text-left px-3 py-3.5 text-xs font-700 text-surface-500 uppercase tracking-widest">Estado</th>
                      <th className="text-right px-6 py-3.5 text-xs font-700 text-surface-500 uppercase tracking-widest">Importe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-700/30">
                    {PEDIDOS_RECIENTES.map(p => {
                      const est = ESTADO_CFG[p.estado]
                      const pri = PRIORIDAD_CFG[p.prioridad]
                      return (
                        <tr key={p.id} className="hover:bg-surface-700/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-700 text-white text-sm font-mono">{p.numero}</div>
                            <div className={clsx('text-xs font-600 mt-0.5', pri.color)}>
                              {pri.icon} {pri.label}
                            </div>
                          </td>
                          <td className="px-3 py-4 hidden md:table-cell">
                            <div className="text-sm text-surface-200 font-500">{p.cliente}</div>
                            <div className="text-xs text-surface-500 mt-0.5">{p.responsable}</div>
                          </td>
                          <td className="px-3 py-4">
                            <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-600 border', est.bg, est.color, est.border)}>
                              <span className={clsx('w-1.5 h-1.5 rounded-full', est.dot)} />
                              {est.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-700 text-white text-base">{p.importe.toLocaleString('es-ES')} €</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pipeline */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-white mb-5">Pipeline producción</h3>
              <div className="space-y-4">
                {PIPELINE.map(({ key, count }) => {
                  const cfg  = ESTADO_CFG[key]
                  const pct  = Math.round((count / MAX_PIPELINE) * 100)
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={clsx('w-2.5 h-2.5 rounded-full', cfg.dot)} />
                          <span className="text-sm font-500 text-surface-300">{cfg.label}</span>
                        </div>
                        <span className="text-base font-700 text-white">{count}</span>
                      </div>
                      <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                        <div
                          className={clsx('h-full rounded-full transition-all duration-500', cfg.dot)}
                          style={{ width:`${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 pt-5 border-t border-surface-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-400">Entregados hoy</span>
                  <span className="text-base font-700 text-success">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-400">Cancelados este mes</span>
                  <span className="text-base font-700 text-danger">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-400">Total en producción</span>
                  <span className="text-base font-700 text-white">{PIPELINE.reduce((a, b) => a + b.count, 0)}</span>
                </div>
              </div>

              <Link
                href="/pedidos"
                className="flex items-center justify-center gap-2 w-full mt-5 py-3 bg-brand-600/10 hover:bg-brand-600/20 border border-brand-500/20 hover:border-brand-500/40 text-brand-400 text-sm font-600 rounded-xl transition-all"
              >
                Gestionar pedidos →
              </Link>
            </div>
          </div>

        </div>
      </DashboardLayout>
    </>
  )
}