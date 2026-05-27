// pages/pedidos.tsx
import { useState, useEffect } from 'react'
import Head from 'next/head'
import DashboardLayout from '@/components/layout/DashboardLayout'
import clsx from 'clsx'

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Pedido {
  id: string
  numero: string
  titulo: string
  cliente: string
  estado: string
  prioridad: string
  importe_total: number
  fecha_entrada: string
  fecha_entrega: string
  notas?: string
  modificado_por?: string
  modificado_at?: string
}

interface HistorialEntry {
  fecha: string
  usuario: string
  accion: string
  detalle: string
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const ESTADOS_ORDER = ['recibido','preimpresion','impresion','encuadernacion','listo','entregado','cancelado']
const ESTADOS       = ['todos', ...ESTADOS_ORDER]
const PRIORIDADES   = ['todas','baja','normal','alta','urgente']

const ESTADO_CFG: Record<string, { label: string; color: string; bg: string; dot: string; border: string }> = {
  recibido:       { label:'Recibido',       color:'text-blue-300',    bg:'bg-blue-500/10',    dot:'bg-blue-400',    border:'border-blue-500/30' },
  preimpresion:   { label:'Preimpresión',   color:'text-purple-300',  bg:'bg-purple-500/10',  dot:'bg-purple-400',  border:'border-purple-500/30' },
  impresion:      { label:'Impresión',      color:'text-yellow-300',  bg:'bg-yellow-500/10',  dot:'bg-yellow-400',  border:'border-yellow-500/30' },
  encuadernacion: { label:'Encuadernación', color:'text-orange-300',  bg:'bg-orange-500/10',  dot:'bg-orange-400',  border:'border-orange-500/30' },
  listo:          { label:'Listo',          color:'text-cyan-300',    bg:'bg-cyan-500/10',    dot:'bg-cyan-400',    border:'border-cyan-500/30' },
  entregado:      { label:'Entregado',      color:'text-green-300',   bg:'bg-green-500/10',   dot:'bg-green-400',   border:'border-green-500/30' },
  cancelado:      { label:'Cancelado',      color:'text-red-300',     bg:'bg-red-500/10',     dot:'bg-red-400',     border:'border-red-500/30' },
}

const PRIORIDAD_CFG: Record<string, { label: string; color: string; icon: string; bg: string }> = {
  baja:    { label:'Baja',    color:'text-surface-400', icon:'↓', bg:'bg-surface-700/50' },
  normal:  { label:'Normal',  color:'text-blue-300',    icon:'→', bg:'bg-blue-500/10' },
  alta:    { label:'Alta',    color:'text-yellow-300',  icon:'↑', bg:'bg-yellow-500/10' },
  urgente: { label:'Urgente', color:'text-red-400',     icon:'⚡', bg:'bg-red-500/10' },
}

const DEMO_PEDIDOS: Pedido[] = [
  { id:'1', numero:'PD-2025-0027', titulo:'Catálogo corporativo Q2',  cliente:'Editorial Planeta',  estado:'impresion',      prioridad:'alta',    importe_total:3200, fecha_entrada:'2025-06-20', fecha_entrega:'2025-06-30', modificado_por:'Joan Puig',    modificado_at:'2025-06-24T09:00:00' },
  { id:'2', numero:'PD-2025-0026', titulo:'Folletos campaña verano',  cliente:'Ayuntamiento BCN',   estado:'preimpresion',   prioridad:'urgente', importe_total:1850, fecha_entrada:'2025-06-19', fecha_entrega:'2025-06-28', modificado_por:'Maria Sánchez', modificado_at:'2025-06-23T14:30:00' },
  { id:'3', numero:'PD-2025-0025', titulo:'Memoria anual 2024',       cliente:'Grup Mediapro',      estado:'listo',          prioridad:'normal',  importe_total:780,  fecha_entrada:'2025-06-18', fecha_entrega:'2025-06-27', modificado_por:'Joan Puig',    modificado_at:'2025-06-26T11:00:00' },
  { id:'4', numero:'PD-2025-0024', titulo:'Manual de instrucciones',  cliente:'Universidad UAB',    estado:'encuadernacion', prioridad:'normal',  importe_total:2100, fecha_entrada:'2025-06-17', fecha_entrega:'2025-07-05', modificado_por:'Maria Sánchez', modificado_at:'2025-06-25T16:00:00' },
  { id:'5', numero:'PD-2025-0023', titulo:'Packaging navideño',       cliente:'Nestlé España',      estado:'entregado',      prioridad:'baja',    importe_total:950,  fecha_entrada:'2025-06-15', fecha_entrega:'2025-06-25', modificado_por:'Joan Puig',    modificado_at:'2025-06-25T10:00:00' },
  { id:'6', numero:'PD-2025-0022', titulo:'Libro de arte limitado',   cliente:'Fundació Joan Miró', estado:'recibido',       prioridad:'alta',    importe_total:4500, fecha_entrada:'2025-06-14', fecha_entrega:'2025-07-10' },
  { id:'7', numero:'PD-2025-0021', titulo:'Tarjetas de visita',       cliente:'Bufete Garrigues',   estado:'entregado',      prioridad:'baja',    importe_total:320,  fecha_entrada:'2025-06-12', fecha_entrega:'2025-06-20', modificado_por:'Maria Sánchez', modificado_at:'2025-06-20T09:00:00' },
  { id:'8', numero:'PD-2025-0020', titulo:'Carteles feria BCN',       cliente:'Fira de Barcelona',  estado:'impresion',      prioridad:'urgente', importe_total:2800, fecha_entrada:'2025-06-11', fecha_entrega:'2025-06-26', modificado_por:'Joan Puig',    modificado_at:'2025-06-24T15:00:00' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function diasRestantes(fecha: string) {
  return Math.ceil((new Date(fecha).getTime() - Date.now()) / 86400000)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit', year:'numeric' })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-ES', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })
}

// ─── Componente Badge de estado ───────────────────────────────────────────────
function EstadoBadge({ estado }: { estado: string }) {
  const cfg = ESTADO_CFG[estado] || ESTADO_CFG.recibido
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-600 border', cfg.bg, cfg.color, cfg.border)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  )
}

// ─── Modal: Nuevo pedido ──────────────────────────────────────────────────────
function ModalNuevoPedido({ onClose, onCrear, siguienteNumero }: {
  onClose: () => void
  onCrear: (pedido: Pedido) => void
  siguienteNumero: string
}) {
  const [form, setForm] = useState({
    titulo: '', cliente: '', prioridad: 'normal',
    importe_total: '', fecha_entrega: '', notas: '',
    nombre_usuario: '',
  })
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.titulo.trim())         return setError('El título es obligatorio.')
    if (!form.cliente.trim())        return setError('El cliente es obligatorio.')
    if (!form.fecha_entrega)         return setError('La fecha de entrega es obligatoria.')
    if (!form.nombre_usuario.trim()) return setError('Debes introducir tu nombre para confirmar la acción.')

    const nuevo: Pedido = {
      id:            Date.now().toString(),
      numero:        siguienteNumero,
      titulo:        form.titulo.trim(),
      cliente:       form.cliente.trim(),
      estado:        'recibido',
      prioridad:     form.prioridad,
      importe_total: parseFloat(form.importe_total) || 0,
      fecha_entrada: new Date().toISOString().split('T')[0],
      fecha_entrega: form.fecha_entrega,
      notas:         form.notas.trim(),
      modificado_por: form.nombre_usuario.trim(),
      modificado_at:  new Date().toISOString(),
    }

    onCrear(nuevo)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-surface-800 border border-surface-600 rounded-2xl w-full max-w-lg shadow-card-lg animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-700">
          <div>
            <h2 className="text-xl font-bold text-white">Nuevo pedido</h2>
            <p className="text-sm text-surface-400 mt-0.5">Nº asignado: <span className="text-brand-400 font-600">{siguienteNumero}</span></p>
          </div>
          <button onClick={onClose} className="p-2 text-surface-400 hover:text-white hover:bg-surface-700 rounded-lg transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Título */}
          <div>
            <label className="label-dark">Título del pedido *</label>
            <input name="titulo" value={form.titulo} onChange={handleChange}
              placeholder="Ej: Catálogo corporativo 2025"
              className="input-dark" />
          </div>

          {/* Cliente */}
          <div>
            <label className="label-dark">Cliente *</label>
            <input name="cliente" value={form.cliente} onChange={handleChange}
              placeholder="Nombre del cliente o empresa"
              className="input-dark" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Prioridad */}
            <div>
              <label className="label-dark">Prioridad</label>
              <select name="prioridad" value={form.prioridad} onChange={handleChange} className="input-dark">
                {['baja','normal','alta','urgente'].map(p => (
                  <option key={p} value={p}>{PRIORIDAD_CFG[p].label}</option>
                ))}
              </select>
            </div>

            {/* Importe */}
            <div>
              <label className="label-dark">Importe (€)</label>
              <input name="importe_total" type="number" min="0" step="0.01"
                value={form.importe_total} onChange={handleChange}
                placeholder="0.00" className="input-dark" />
            </div>
          </div>

          {/* Fecha entrega */}
          <div>
            <label className="label-dark">Fecha de entrega *</label>
            <input name="fecha_entrega" type="date" value={form.fecha_entrega} onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="input-dark" />
          </div>

          {/* Notas */}
          <div>
            <label className="label-dark">Notas / observaciones</label>
            <textarea name="notas" value={form.notas} onChange={handleChange}
              rows={3} placeholder="Instrucciones especiales, detalles del trabajo…"
              className="input-dark resize-none" />
          </div>

          {/* Firma del usuario — OBLIGATORIA */}
          <div className="bg-brand-600/8 border border-brand-500/20 rounded-xl p-4">
            <label className="label-dark text-brand-400">
              ✍️ Tu nombre (confirma que realizas esta acción) *
            </label>
            <input name="nombre_usuario" value={form.nombre_usuario} onChange={handleChange}
              placeholder="Escribe tu nombre completo"
              className="input-dark mt-1" />
            <p className="text-xs text-surface-500 mt-2">
              Este nombre quedará registrado como responsable de la creación del pedido.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Crear pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Modal: Editar estado ─────────────────────────────────────────────────────
function ModalEditarEstado({ pedido, onClose, onGuardar }: {
  pedido: Pedido
  onClose: () => void
  onGuardar: (id: string, nuevoEstado: string, nombre: string, notas: string) => void
}) {
  const [nuevoEstado, setNuevoEstado] = useState(pedido.estado)
  const [nombre, setNombre]           = useState('')
  const [notas, setNotas]             = useState('')
  const [error, setError]             = useState('')

  function handleGuardar() {
    setError('')
    if (!nombre.trim()) return setError('Debes introducir tu nombre para confirmar el cambio.')
    if (nuevoEstado === pedido.estado) return setError('El estado seleccionado es el mismo que el actual.')
    onGuardar(pedido.id, nuevoEstado, nombre.trim(), notas.trim())
    onClose()
  }

  const estadoActualIdx  = ESTADOS_ORDER.indexOf(pedido.estado)
  const estadoNuevoIdx   = ESTADOS_ORDER.indexOf(nuevoEstado)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-surface-800 border border-surface-600 rounded-2xl w-full max-w-md shadow-card-lg animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-700">
          <div>
            <h2 className="text-xl font-bold text-white">Actualizar estado</h2>
            <p className="text-sm text-brand-400 font-600 mt-0.5">{pedido.numero}</p>
          </div>
          <button onClick={onClose} className="p-2 text-surface-400 hover:text-white hover:bg-surface-700 rounded-lg transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Info pedido */}
          <div className="bg-surface-900/60 rounded-xl p-4 space-y-1">
            <p className="text-sm font-600 text-white">{pedido.titulo}</p>
            <p className="text-sm text-surface-400">{pedido.cliente}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-surface-500">Estado actual:</span>
              <EstadoBadge estado={pedido.estado} />
            </div>
          </div>

          {/* Pipeline visual */}
          <div>
            <label className="label-dark">Nuevo estado *</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {ESTADOS_ORDER.map((est, idx) => {
                const cfg = ESTADO_CFG[est]
                const isSelected = nuevoEstado === est
                const isCurrent  = pedido.estado === est
                return (
                  <button
                    key={est}
                    type="button"
                    onClick={() => setNuevoEstado(est)}
                    className={clsx(
                      'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-500 transition-all duration-150 text-left',
                      isSelected
                        ? clsx(cfg.bg, cfg.color, cfg.border, 'ring-1 ring-offset-1 ring-offset-surface-800', cfg.border.replace('border-', 'ring-'))
                        : isCurrent
                          ? 'border-surface-500 bg-surface-700/50 text-surface-300'
                          : 'border-surface-700 text-surface-400 hover:border-surface-500 hover:text-surface-200 hover:bg-surface-700/30'
                    )}
                  >
                    <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', cfg.dot)} />
                    <span>{cfg.label}</span>
                    {isCurrent && <span className="ml-auto text-xs text-surface-500">(actual)</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Indicador de avance/retroceso */}
          {nuevoEstado !== pedido.estado && (
            <div className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-500',
              estadoNuevoIdx > estadoActualIdx
                ? 'bg-success/10 border border-success/20 text-success'
                : 'bg-warning/10 border border-warning/20 text-warning'
            )}>
              <span>{estadoNuevoIdx > estadoActualIdx ? '⬆️ Avanzar a:' : '⬇️ Retroceder a:'}</span>
              <span className="font-700">{ESTADO_CFG[nuevoEstado].label}</span>
            </div>
          )}

          {/* Notas del cambio */}
          <div>
            <label className="label-dark">Notas del cambio (opcional)</label>
            <textarea value={notas} onChange={e => setNotas(e.target.value)}
              rows={2} placeholder="Motivo del cambio, observaciones…"
              className="input-dark resize-none" />
          </div>

          {/* Firma — OBLIGATORIA */}
          <div className="bg-brand-600/8 border border-brand-500/20 rounded-xl p-4">
            <label className="label-dark text-brand-400">
              ✍️ Tu nombre (confirma el cambio) *
            </label>
            <input value={nombre} onChange={e => setNombre(e.target.value)}
              placeholder="Escribe tu nombre completo"
              className="input-dark mt-1" />
            <p className="text-xs text-surface-500 mt-2">
              Quedará registrado quién realizó este cambio de estado.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="button" onClick={handleGuardar} className="btn-primary flex-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
              </svg>
              Guardar cambio
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Modal: Ver detalle ───────────────────────────────────────────────────────
function ModalDetalle({ pedido, onClose, onEditarEstado }: {
  pedido: Pedido
  onClose: () => void
  onEditarEstado: () => void
}) {
  const est  = ESTADO_CFG[pedido.estado]
  const pri  = PRIORIDAD_CFG[pedido.prioridad]
  const dias = diasRestantes(pedido.fecha_entrega)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-surface-800 border border-surface-600 rounded-2xl w-full max-w-lg shadow-card-lg animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-700">
          <div>
            <p className="text-sm font-700 text-brand-400">{pedido.numero}</p>
            <h2 className="text-xl font-bold text-white mt-0.5">{pedido.titulo}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-surface-400 hover:text-white hover:bg-surface-700 rounded-lg transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Datos principales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-900/60 rounded-xl p-4">
              <p className="text-xs text-surface-500 mb-1">Cliente</p>
              <p className="text-sm font-600 text-white">{pedido.cliente}</p>
            </div>
            <div className="bg-surface-900/60 rounded-xl p-4">
              <p className="text-xs text-surface-500 mb-1">Importe</p>
              <p className="text-sm font-600 text-white">{pedido.importe_total.toLocaleString('es-ES')} €</p>
            </div>
            <div className="bg-surface-900/60 rounded-xl p-4">
              <p className="text-xs text-surface-500 mb-2">Estado actual</p>
              <EstadoBadge estado={pedido.estado} />
            </div>
            <div className="bg-surface-900/60 rounded-xl p-4">
              <p className="text-xs text-surface-500 mb-1">Prioridad</p>
              <span className={clsx('text-sm font-600 flex items-center gap-1', pri.color)}>
                {pri.icon} {pri.label}
              </span>
            </div>
            <div className="bg-surface-900/60 rounded-xl p-4">
              <p className="text-xs text-surface-500 mb-1">Entrada</p>
              <p className="text-sm font-600 text-white">{formatDate(pedido.fecha_entrada)}</p>
            </div>
            <div className="bg-surface-900/60 rounded-xl p-4">
              <p className="text-xs text-surface-500 mb-1">Entrega</p>
              <p className="text-sm font-600 text-white">{formatDate(pedido.fecha_entrega)}</p>
              {pedido.estado !== 'entregado' && pedido.estado !== 'cancelado' && (
                <p className={clsx('text-xs mt-1 font-600',
                  dias < 0 ? 'text-danger' : dias <= 3 ? 'text-warning' : 'text-surface-500'
                )}>
                  {dias < 0 ? `Vencido ${Math.abs(dias)}d` : dias === 0 ? 'Hoy' : `${dias}d restantes`}
                </p>
              )}
            </div>
          </div>

          {/* Notas */}
          {pedido.notas && (
            <div className="bg-surface-900/60 rounded-xl p-4">
              <p className="text-xs text-surface-500 mb-1">Notas</p>
              <p className="text-sm text-surface-300">{pedido.notas}</p>
            </div>
          )}

          {/* Registro de quién lo modificó */}
          {pedido.modificado_por && (
            <div className="flex items-center gap-3 px-4 py-3 bg-brand-600/8 border border-brand-500/20 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-brand-600/30 flex items-center justify-center text-xs font-700 text-brand-300 flex-shrink-0">
                {pedido.modificado_por.slice(0,2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-surface-500">Última modificación por</p>
                <p className="text-sm font-600 text-white">{pedido.modificado_por}</p>
                {pedido.modificado_at && (
                  <p className="text-xs text-surface-500">{formatDateTime(pedido.modificado_at)}</p>
                )}
              </div>
            </div>
          )}

          {/* Pipeline de progreso */}
          <div>
            <p className="text-xs text-surface-500 mb-3 uppercase tracking-widest font-600">Progreso de producción</p>
            <div className="flex items-center gap-1">
              {ESTADOS_ORDER.filter(e => e !== 'cancelado').map((est, i) => {
                const cfg  = ESTADO_CFG[est]
                const done = ESTADOS_ORDER.indexOf(pedido.estado) >= i && pedido.estado !== 'cancelado'
                const curr = pedido.estado === est
                return (
                  <div key={est} className="flex items-center flex-1">
                    <div className={clsx(
                      'h-1.5 flex-1 rounded-full transition-all',
                      done ? cfg.dot : 'bg-surface-700'
                    )} />
                    {i === ESTADOS_ORDER.filter(e => e !== 'cancelado').length - 1 && (
                      <div className={clsx(
                        'w-3 h-3 rounded-full ml-1 border-2 flex-shrink-0',
                        done ? `${cfg.dot} border-transparent` : 'bg-surface-700 border-surface-600'
                      )} />
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-surface-600">Recibido</span>
              <span className="text-xs text-surface-600">Entregado</span>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cerrar</button>
            {pedido.estado !== 'entregado' && pedido.estado !== 'cancelado' && (
              <button type="button" onClick={() => { onClose(); onEditarEstado() }} className="btn-primary flex-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Actualizar estado
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function PedidosPage() {
  const [pedidos, setPedidos]             = useState<Pedido[]>(DEMO_PEDIDOS)
  const [estadoFiltro, setEstadoFiltro]   = useState('todos')
  const [priori, setPriori]               = useState('todas')
  const [busqueda, setBusqueda]           = useState('')
  const [modalNuevo, setModalNuevo]       = useState(false)
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null)
  const [pedidoEditar, setPedidoEditar]   = useState<Pedido | null>(null)
  const [toastMsg, setToastMsg]           = useState('')

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3500)
  }

  const filtered = pedidos.filter(p => {
    if (estadoFiltro !== 'todos'  && p.estado    !== estadoFiltro) return false
    if (priori       !== 'todas'  && p.prioridad !== priori)       return false
    if (busqueda) {
      const q = busqueda.toLowerCase()
      if (!p.numero.toLowerCase().includes(q) &&
          !p.titulo.toLowerCase().includes(q) &&
          !p.cliente.toLowerCase().includes(q)) return false
    }
    return true
  })

  function siguienteNumero() {
    const last = pedidos.length > 0
      ? Math.max(...pedidos.map(p => parseInt(p.numero.split('-')[2] || '0')))
      : 0
    return `PD-2025-${String(last + 1).padStart(4,'0')}`
  }

  function handleCrear(nuevo: Pedido) {
    setPedidos(prev => [nuevo, ...prev])
    showToast(`✅ Pedido ${nuevo.numero} creado por ${nuevo.modificado_por}`)
  }

  function handleActualizarEstado(id: string, nuevoEstado: string, nombre: string, notas: string) {
    setPedidos(prev => prev.map(p =>
      p.id === id
        ? { ...p, estado: nuevoEstado, modificado_por: nombre, modificado_at: new Date().toISOString(), notas: notas || p.notas }
        : p
    ))
    const p = pedidos.find(x => x.id === id)
    showToast(`✅ ${p?.numero} → ${ESTADO_CFG[nuevoEstado].label} (por ${nombre})`)
  }

  // Contadores por estado para las pills de filtro
  const counts = ESTADOS_ORDER.reduce((acc, e) => {
    acc[e] = pedidos.filter(p => p.estado === e).length
    return acc
  }, {} as Record<string, number>)

  return (
    <>
      <Head><title>Pedidos — Gràfiques Martí</title></Head>
      <DashboardLayout title="Pedidos">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in">
            <div>
              <p className="text-base text-surface-400">
                <span className="text-white font-700 text-lg">{filtered.length}</span> pedidos
                {estadoFiltro !== 'todos' && <span className="text-brand-400"> · {ESTADO_CFG[estadoFiltro]?.label}</span>}
              </p>
            </div>
            <button
              onClick={() => setModalNuevo(true)}
              className="btn-primary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nuevo pedido
            </button>
          </div>

          {/* Pills de estado rápido */}
          <div className="flex flex-wrap gap-2 animate-in-delay-1">
            {ESTADOS.map(est => {
              const cfg     = est === 'todos' ? null : ESTADO_CFG[est]
              const isActive = estadoFiltro === est
              const count   = est === 'todos' ? pedidos.length : (counts[est] || 0)
              return (
                <button
                  key={est}
                  onClick={() => setEstadoFiltro(est)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-500 border transition-all duration-150',
                    isActive
                      ? cfg
                        ? clsx(cfg.bg, cfg.color, cfg.border)
                        : 'bg-brand-600/15 text-brand-300 border-brand-500/30'
                      : 'bg-surface-800 text-surface-400 border-surface-700 hover:border-surface-500 hover:text-surface-200'
                  )}
                >
                  {cfg && <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />}
                  {est === 'todos' ? 'Todos' : cfg?.label}
                  <span className={clsx(
                    'text-xs px-1.5 py-0.5 rounded-full font-700',
                    isActive ? 'bg-white/20' : 'bg-surface-700'
                  )}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="card p-4 flex flex-col sm:flex-row gap-3 animate-in-delay-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Buscar número, título o cliente…"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="input-dark pl-10"
              />
            </div>
            <select value={priori} onChange={e => setPriori(e.target.value)} className="select-dark">
              {PRIORIDADES.map(p => (
                <option key={p} value={p}>{p === 'todas' ? 'Todas las prioridades' : PRIORIDAD_CFG[p]?.label}</option>
              ))}
            </select>
          </div>

          {/* Tabla */}
          <div className="card overflow-hidden animate-in-delay-3">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-700 bg-surface-900/60">
                    <th className="th">Pedido</th>
                    <th className="th">Título / Cliente</th>
                    <th className="th">Estado</th>
                    <th className="th hidden lg:table-cell">Entrega</th>
                    <th className="th text-right">Importe</th>
                    <th className="th hidden md:table-cell">Responsable</th>
                    <th className="th text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-700/40">
                  {filtered.map(p => {
                    const est  = ESTADO_CFG[p.estado]
                    const pri  = PRIORIDAD_CFG[p.prioridad]
                    const dias = diasRestantes(p.fecha_entrega)
                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-surface-700/25 transition-colors group"
                      >
                        {/* Número + prioridad */}
                        <td className="td">
                          <div className="font-700 text-white font-mono text-sm">{p.numero}</div>
                          <span className={clsx(
                            'inline-flex items-center gap-1 text-xs font-500 px-1.5 py-0.5 rounded-md mt-1',
                            pri.bg, pri.color
                          )}>
                            {pri.icon} {pri.label}
                          </span>
                        </td>

                        {/* Título + cliente */}
                        <td className="td max-w-[220px]">
                          <div className="font-600 text-white text-base leading-tight truncate">{p.titulo}</div>
                          <div className="text-sm text-surface-400 mt-0.5">{p.cliente}</div>
                        </td>

                        {/* Estado */}
                        <td className="td">
                          <EstadoBadge estado={p.estado} />
                        </td>

                        {/* Entrega */}
                        <td className="td hidden lg:table-cell">
                          <div className="text-sm text-surface-300">{formatDate(p.fecha_entrega)}</div>
                          {p.estado !== 'entregado' && p.estado !== 'cancelado' && (
                            <div className={clsx(
                              'text-xs font-600 mt-0.5',
                              dias < 0 ? 'text-danger' : dias <= 3 ? 'text-warning' : 'text-surface-500'
                            )}>
                              {dias < 0 ? `Vencido ${Math.abs(dias)}d` : dias === 0 ? '⚠️ Hoy' : `${dias}d`}
                            </div>
                          )}
                        </td>

                        {/* Importe */}
                        <td className="td text-right">
                          <span className="font-700 text-white text-base">{p.importe_total.toLocaleString('es-ES')} €</span>
                        </td>

                        {/* Responsable */}
                        <td className="td hidden md:table-cell">
                          {p.modificado_por ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-brand-600/25 border border-brand-500/20 flex items-center justify-center text-xs font-700 text-brand-300 flex-shrink-0">
                                {p.modificado_por.slice(0,2).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm text-surface-300 font-500">{p.modificado_por}</div>
                                {p.modificado_at && (
                                  <div className="text-xs text-surface-600">{formatDateTime(p.modificado_at)}</div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-surface-600">—</span>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="td text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* Ver detalle */}
                            <button
                              onClick={() => setPedidoDetalle(p)}
                              title="Ver detalle"
                              className="p-2 text-surface-500 hover:text-brand-400 hover:bg-brand-600/10 rounded-lg transition-all"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>

                            {/* Editar estado */}
                            {p.estado !== 'entregado' && p.estado !== 'cancelado' && (
                              <button
                                onClick={() => setPedidoEditar(p)}
                                title="Actualizar estado"
                                className="p-2 text-surface-500 hover:text-success hover:bg-success/10 rounded-lg transition-all"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="text-center py-20">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="mx-auto mb-4 text-surface-700">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <p className="text-surface-400 text-base font-500">No hay pedidos con estos filtros</p>
                  <p className="text-surface-600 text-sm mt-1">Prueba a cambiar el estado o la búsqueda</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </DashboardLayout>

      {/* Modales */}
      {modalNuevo && (
        <ModalNuevoPedido
          onClose={() => setModalNuevo(false)}
          onCrear={handleCrear}
          siguienteNumero={siguienteNumero()}
        />
      )}

      {pedidoDetalle && (
        <ModalDetalle
          pedido={pedidoDetalle}
          onClose={() => setPedidoDetalle(null)}
          onEditarEstado={() => setPedidoEditar(pedidoDetalle)}
        />
      )}

      {pedidoEditar && (
        <ModalEditarEstado
          pedido={pedidoEditar}
          onClose={() => setPedidoEditar(null)}
          onGuardar={handleActualizarEstado}
        />
      )}

      {/* Toast de confirmación */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 bg-surface-800 border border-success/30 rounded-xl shadow-card-lg animate-in text-sm font-600 text-white max-w-sm">
          {toastMsg}
        </div>
      )}
    </>
  )
}