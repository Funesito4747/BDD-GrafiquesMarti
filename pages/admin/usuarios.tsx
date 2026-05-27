// pages/admin/usuarios.tsx
import { useState } from 'react'
import Head from 'next/head'
import DashboardLayout from '@/components/layout/DashboardLayout'
import clsx from 'clsx'

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Usuario {
  id: string
  nombre: string
  apellidos: string
  email: string
  rol: string
  activo: boolean
  ultimo_acceso: string
}

// ─── Datos demo ───────────────────────────────────────────────────────────────
const DEMO_USUARIOS: Usuario[] = [
  { id:'1', nombre:'Martí Berrio',  apellidos:'Prieto',  email:'admin@grafiquesmarti.com',  rol:'admin',    activo:true,  ultimo_acceso:'2025-06-26T10:12:00' },
  { id:'2', nombre:'Joan',          apellidos:'Puig',    email:'joan@grafiquesmarti.com',    rol:'empleado', activo:true,  ultimo_acceso:'2025-06-26T09:45:00' },
  { id:'3', nombre:'Maria',         apellidos:'Sánchez', email:'maria@grafiquesmarti.com',   rol:'empleado', activo:true,  ultimo_acceso:'2025-06-25T16:30:00' },
  { id:'4', nombre:'Carlos',        apellidos:'Romero',  email:'carlos@grafiquesmarti.com',  rol:'consulta', activo:true,  ultimo_acceso:'2025-06-24T11:00:00' },
  { id:'5', nombre:'Laura',         apellidos:'Vidal',   email:'laura@grafiquesmarti.com',   rol:'empleado', activo:false, ultimo_acceso:'2025-06-10T08:20:00' },
]

const ROL_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  admin:    { label:'Admin',    color:'text-yellow-300', bg:'bg-yellow-500/10', border:'border-yellow-500/20' },
  empleado: { label:'Empleado', color:'text-blue-300',   bg:'bg-blue-500/10',   border:'border-blue-500/20' },
  consulta: { label:'Consulta', color:'text-slate-300',  bg:'bg-slate-700/50',  border:'border-slate-600' },
}

interface FormCrear { nombre: string; apellidos: string; email: string; password: string; rol_id: string }
interface FormEditar { nombre: string; apellidos: string; rol_id: string }

// ─── Modal: Crear usuario ─────────────────────────────────────────────────────
function ModalCrear({ onClose, onCreado }: { onClose: () => void; onCreado: (u: Usuario) => void }) {
  const [form, setForm]     = useState<FormCrear>({ nombre:'', apellidos:'', email:'', password:'', rol_id:'2' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res  = await fetch('/api/admin/usuarios', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, rol_id: +form.rol_id }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al crear usuario'); return }

      const rolMap: Record<string, string> = { '1':'admin', '2':'empleado', '3':'consulta' }
      onCreado({
        id:            data.data?.id || Date.now().toString(),
        nombre:        form.nombre,
        apellidos:     form.apellidos,
        email:         form.email,
        rol:           rolMap[form.rol_id] || 'empleado',
        activo:        true,
        ultimo_acceso: '',
      })
      setSuccess('Usuario creado correctamente')
      setTimeout(() => onClose(), 1800)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl w-full max-w-md shadow-card-lg animate-in">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#334155]">
          <h2 className="text-xl font-bold text-white">Crear usuario</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-[#334155] rounded-lg transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-dark">Nombre *</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} required
                placeholder="Joan" className="input-dark" />
            </div>
            <div>
              <label className="label-dark">Apellidos</label>
              <input name="apellidos" value={form.apellidos} onChange={handleChange}
                placeholder="Puig" className="input-dark" />
            </div>
          </div>

          <div>
            <label className="label-dark">Email *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required
              placeholder="joan@grafiquesmarti.com" className="input-dark" />
          </div>

          <div>
            <label className="label-dark">Contraseña * (mín. 8 caracteres)</label>
            <input name="password" type="password" value={form.password} onChange={handleChange}
              required minLength={8} placeholder="••••••••" className="input-dark" />
          </div>

          <div>
            <label className="label-dark">Rol *</label>
            <select name="rol_id" value={form.rol_id} onChange={handleChange} className="input-dark">
              <option value="1">Administrador</option>
              <option value="2">Empleado</option>
              <option value="3">Solo consulta</option>
            </select>
          </div>

          {error   && <div className="p-3 rounded-lg text-sm" style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444' }}>{error}</div>}
          {success && <div className="p-3 rounded-lg text-sm" style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.2)', color:'#22c55e' }}>{success}</div>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Creando…' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Modal: Editar usuario ────────────────────────────────────────────────────
function ModalEditar({ usuario, onClose, onGuardado }: {
  usuario: Usuario
  onClose: () => void
  onGuardado: (id: string, datos: Partial<Usuario>) => void
}) {
  const [form, setForm]       = useState<FormEditar>({
    nombre:    usuario.nombre,
    apellidos: usuario.apellidos,
    rol_id:    usuario.rol === 'admin' ? '1' : usuario.rol === 'empleado' ? '2' : '3',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleGuardar() {
    if (!form.nombre.trim()) return setError('El nombre es obligatorio.')
    setError(''); setLoading(true)

    // En producción aquí iría la llamada a la API de actualización
    const rolMap: Record<string, string> = { '1':'admin', '2':'empleado', '3':'consulta' }
    setTimeout(() => {
      onGuardado(usuario.id, {
        nombre:    form.nombre.trim(),
        apellidos: form.apellidos.trim(),
        rol:       rolMap[form.rol_id] || 'empleado',
      })
      setSuccess('Usuario actualizado')
      setLoading(false)
      setTimeout(() => onClose(), 1500)
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl w-full max-w-md shadow-card-lg animate-in">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#334155]">
          <div>
            <h2 className="text-xl font-bold text-white">Editar usuario</h2>
            <p className="text-sm text-slate-400 mt-0.5">{usuario.email}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-[#334155] rounded-lg transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Avatar + info */}
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.15)' }}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background:'rgba(37,99,235,0.3)', color:'#93c5fd' }}>
              {usuario.nombre.slice(0,2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{usuario.nombre} {usuario.apellidos}</p>
              <p className="text-xs text-slate-400">{usuario.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-dark">Nombre *</label>
              <input name="nombre" value={form.nombre} onChange={handleChange}
                className="input-dark" />
            </div>
            <div>
              <label className="label-dark">Apellidos</label>
              <input name="apellidos" value={form.apellidos} onChange={handleChange}
                className="input-dark" />
            </div>
          </div>

          <div>
            <label className="label-dark">Rol</label>
            <select name="rol_id" value={form.rol_id} onChange={handleChange} className="input-dark">
              <option value="1">Administrador</option>
              <option value="2">Empleado</option>
              <option value="3">Solo consulta</option>
            </select>
          </div>

          {error   && <div className="p-3 rounded-lg text-sm" style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444' }}>{error}</div>}
          {success && <div className="p-3 rounded-lg text-sm" style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.2)', color:'#22c55e' }}>{success}</div>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="button" onClick={handleGuardar} disabled={loading} className="btn-primary flex-1">
              {loading ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Modal: Confirmar desactivar/activar ──────────────────────────────────────
function ModalToggleActivo({ usuario, onClose, onConfirmar }: {
  usuario: Usuario
  onClose: () => void
  onConfirmar: (id: string) => void
}) {
  const [loading, setLoading] = useState(false)
  const accion = usuario.activo ? 'desactivar' : 'activar'

  function handleConfirmar() {
    setLoading(true)
    setTimeout(() => {
      onConfirmar(usuario.id)
      setLoading(false)
      onClose()
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl w-full max-w-sm shadow-card-lg animate-in">
        <div className="px-6 py-6 text-center space-y-4">
          {/* Icono */}
          <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
            style={{ background: usuario.activo ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)' }}>
            {usuario.activo ? (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-white capitalize">{accion} usuario</h2>
            <p className="text-sm text-slate-400 mt-2">
              ¿Seguro que quieres <strong className="text-white">{accion}</strong> a{' '}
              <strong className="text-white">{usuario.nombre} {usuario.apellidos}</strong>?
            </p>
            {usuario.activo && (
              <p className="text-xs text-slate-500 mt-2">
                El usuario no podrá acceder al panel hasta que sea reactivado.
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button
              type="button"
              onClick={handleConfirmar}
              disabled={loading}
              className={clsx('flex-1 py-3 rounded-lg text-sm font-semibold transition-all border', usuario.activo
                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                : 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20'
              )}
            >
              {loading ? 'Procesando…' : `Sí, ${accion}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


// ─── Modal: Confirmar borrar ──────────────────────────────────────────────────
function ModalBorrar({ usuario, onClose, onConfirmar }: {
  usuario: Usuario
  onClose: () => void
  onConfirmar: (id: string) => void
}) {
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const nombreCompleto = `${usuario.nombre} ${usuario.apellidos}`.trim()
  const valido = confirm.toLowerCase() === 'borrar'

  function handleBorrar() {
    if (!valido) return
    setLoading(true)
    setTimeout(() => {
      onConfirmar(usuario.id)
      setLoading(false)
      onClose()
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl w-full max-w-sm shadow-card-lg animate-in">
        <div className="px-6 py-6 space-y-5">
          {/* Icono peligro */}
          <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
            style={{ background:'rgba(239,68,68,0.12)', border:'2px solid rgba(239,68,68,0.25)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold text-white">Borrar usuario</h2>
            <p className="text-sm text-slate-400 mt-2">
              Vas a eliminar permanentemente a{' '}
              <strong className="text-white">{nombreCompleto}</strong>.
              Esta acción <strong className="text-red-400">no se puede deshacer</strong>.
            </p>
          </div>

          {/* Confirmación por texto */}
          <div>
            <label className="label-dark text-center block">
              Escribe <span className="text-red-400 font-bold">borrar</span> para confirmar
            </label>
            <input
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="borrar"
              className="input-dark text-center mt-1"
              style={{ borderColor: valido ? '#22c55e' : undefined }}
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button
              type="button"
              onClick={handleBorrar}
              disabled={!valido || loading}
              className="flex-1 py-3 rounded-lg text-sm font-semibold transition-all border"
              style={{
                background: valido ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.05)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: valido ? '#ef4444' : 'rgba(239,68,68,0.4)',
                cursor: valido ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? 'Borrando…' : '🗑️ Borrar definitivamente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function UsuariosAdminPage() {
  const [usuarios, setUsuarios]           = useState<Usuario[]>(DEMO_USUARIOS)
  const [modalCrear, setModalCrear]       = useState(false)
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null)
  const [usuarioToggle, setUsuarioToggle] = useState<Usuario | null>(null)
  const [usuarioBorrar, setUsuarioBorrar] = useState<Usuario | null>(null)
  const [toastMsg, setToastMsg]           = useState('')

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3500)
  }

  function handleCreado(nuevo: Usuario) {
    setUsuarios(prev => [...prev, nuevo])
    showToast(`✅ Usuario ${nuevo.nombre} creado correctamente`)
  }

  function handleGuardado(id: string, datos: Partial<Usuario>) {
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ...datos } : u))
    showToast(`✅ Usuario actualizado correctamente`)
  }

  function handleToggleActivo(id: string) {
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, activo: !u.activo } : u))
    const u = usuarios.find(x => x.id === id)
    showToast(u?.activo ? `⛔ ${u.nombre} desactivado` : `✅ ${u?.nombre} activado`)
  }

  function handleBorrar(id: string) {
    const u = usuarios.find(x => x.id === id)
    setUsuarios(prev => prev.filter(x => x.id !== id))
    showToast(`🗑️ Usuario ${u?.nombre} eliminado`)
  }

  const activos   = usuarios.filter(u => u.activo).length
  const inactivos = usuarios.filter(u => !u.activo).length

  return (
    <>
      <Head><title>Usuarios — Administración</title></Head>
      <DashboardLayout title="Gestión de Usuarios">
        <div className="max-w-5xl mx-auto space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between animate-in">
            <div className="flex items-center gap-4">
              <p className="text-base text-slate-400">
                <span className="text-white font-bold text-lg">{usuarios.length}</span> usuarios
              </p>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e', border:'1px solid rgba(34,197,94,0.2)' }}>
                {activos} activos
              </span>
              {inactivos > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ background:'rgba(100,116,139,0.15)', color:'#94a3b8', border:'1px solid rgba(100,116,139,0.2)' }}>
                  {inactivos} inactivos
                </span>
              )}
            </div>
            <button onClick={() => setModalCrear(true)} className="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Crear usuario
            </button>
          </div>

          {/* Tabla */}
          <div className="card overflow-hidden animate-in-delay-1">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#334155]" style={{ background:'rgba(15,23,42,0.6)' }}>
                    <th className="th">Usuario</th>
                    <th className="th hidden md:table-cell">Email</th>
                    <th className="th">Rol</th>
                    <th className="th hidden lg:table-cell">Último acceso</th>
                    <th className="th">Estado</th>
                    <th className="th text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody style={{ borderTop:'none' }}>
                  {usuarios.map((u, i) => {
                    const rol = ROL_CONFIG[u.rol] || ROL_CONFIG.consulta
                    return (
                      <tr key={u.id}
                        className="transition-colors"
                        style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(51,65,85,0.5)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(51,65,85,0.2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* Usuario */}
                        <td className="td">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                              style={{ background:'rgba(30,64,175,0.3)', color:'#93c5fd' }}>
                              {u.nombre.slice(0,2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-white text-base">{u.nombre} {u.apellidos}</div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="td hidden md:table-cell" style={{ color:'#94a3b8', fontSize:'0.8rem' }}>
                          {u.email}
                        </td>

                        {/* Rol */}
                        <td className="td">
                          <span className={clsx('badge', rol.color)} style={{ background: rol.bg.replace('/10','').includes('yellow') ? 'rgba(234,179,8,0.1)' : rol.bg.includes('blue') ? 'rgba(59,130,246,0.1)' : 'rgba(71,85,105,0.3)', border:`1px solid ${rol.border.replace('border-','').includes('yellow') ? 'rgba(234,179,8,0.2)' : rol.border.includes('blue') ? 'rgba(59,130,246,0.2)' : 'rgba(71,85,105,0.4)'}` }}>
                            {rol.label}
                          </span>
                        </td>

                        {/* Último acceso */}
                        <td className="td hidden lg:table-cell" style={{ color:'#64748b', fontSize:'0.8rem' }}>
                          {u.ultimo_acceso
                            ? new Date(u.ultimo_acceso).toLocaleString('es-ES', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })
                            : '—'
                          }
                        </td>

                        {/* Estado */}
                        <td className="td">
                          <span className="badge" style={{
                            background: u.activo ? 'rgba(34,197,94,0.1)'    : 'rgba(71,85,105,0.3)',
                            border:     u.activo ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(71,85,105,0.4)',
                            color:      u.activo ? '#22c55e' : '#94a3b8',
                          }}>
                            <span className="badge-dot" style={{ background: u.activo ? '#22c55e' : '#64748b' }} />
                            {u.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td className="td text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* Editar */}
                            <button
                              onClick={() => setUsuarioEditar(u)}
                              title="Editar usuario"
                              className="p-2 rounded-lg transition-all"
                              style={{ color:'#64748b' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color='#60a5fa'; (e.currentTarget as HTMLButtonElement).style.background='rgba(59,130,246,0.1)' }}
                              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color='#64748b'; (e.currentTarget as HTMLButtonElement).style.background='transparent' }}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>

                            {/* Activar / Desactivar */}
                            <button
                              onClick={() => setUsuarioToggle(u)}
                              title={u.activo ? 'Desactivar usuario' : 'Activar usuario'}
                              className="p-2 rounded-lg transition-all"
                              style={{ color:'#64748b' }}
                              onMouseEnter={e => {
                                const btn = e.currentTarget as HTMLButtonElement
                                btn.style.color = u.activo ? '#ef4444' : '#22c55e'
                                btn.style.background = u.activo ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)'
                              }}
                              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color='#64748b'; (e.currentTarget as HTMLButtonElement).style.background='transparent' }}
                            >
                              {u.activo ? (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                  <circle cx="12" cy="12" r="10"/>
                                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                                </svg>
                              ) : (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                  <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                              )}
                            </button>

                            {/* Borrar */}
                            <button
                              onClick={() => setUsuarioBorrar(u)}
                              title="Eliminar usuario"
                              className="p-2 rounded-lg transition-all"
                              style={{ color:'#64748b' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color='#f87171'; (e.currentTarget as HTMLButtonElement).style.background='rgba(239,68,68,0.12)' }}
                              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color='#64748b'; (e.currentTarget as HTMLButtonElement).style.background='transparent' }}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info roles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in-delay-2">
            {[
              { rol:'admin',    desc:'Acceso total: gestión de usuarios, configuración y todos los módulos.' },
              { rol:'empleado', desc:'Puede crear y editar pedidos, clientes y presupuestos.' },
              { rol:'consulta', desc:'Solo lectura: puede ver toda la información sin modificarla.' },
            ].map(({ rol, desc }) => {
              const cfg = ROL_CONFIG[rol]
              return (
                <div key={rol} className="card p-4">
                  <span className={clsx('badge mb-3 text-xs', cfg.color)} style={{
                    background: rol === 'admin' ? 'rgba(234,179,8,0.1)' : rol === 'empleado' ? 'rgba(59,130,246,0.1)' : 'rgba(71,85,105,0.3)',
                    border: rol === 'admin' ? '1px solid rgba(234,179,8,0.2)' : rol === 'empleado' ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(71,85,105,0.4)',
                  }}>
                    {cfg.label}
                  </span>
                  <p className="text-sm text-slate-400">{desc}</p>
                </div>
              )
            })}
          </div>

        </div>
      </DashboardLayout>

      {/* Modales */}
      {modalCrear && (
        <ModalCrear
          onClose={() => setModalCrear(false)}
          onCreado={handleCreado}
        />
      )}

      {usuarioEditar && (
        <ModalEditar
          usuario={usuarioEditar}
          onClose={() => setUsuarioEditar(null)}
          onGuardado={handleGuardado}
        />
      )}

      {usuarioToggle && (
        <ModalToggleActivo
          usuario={usuarioToggle}
          onClose={() => setUsuarioToggle(null)}
          onConfirmar={handleToggleActivo}
        />
      )}

      {usuarioBorrar && (
        <ModalBorrar
          usuario={usuarioBorrar}
          onClose={() => setUsuarioBorrar(null)}
          onConfirmar={handleBorrar}
        />
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[100] px-5 py-3.5 rounded-xl text-sm font-semibold text-white animate-in"
          style={{ background:'#1e293b', border:'1px solid rgba(34,197,94,0.3)', boxShadow:'0 10px 40px rgba(0,0,0,0.5)' }}>
          {toastMsg}
        </div>
      )}
    </>
  )
}