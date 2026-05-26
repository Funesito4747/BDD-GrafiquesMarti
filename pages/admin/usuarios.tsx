// src/pages/admin/usuarios.tsx
import { useState } from 'react'
import Head from 'next/head'
import DashboardLayout from '@/components/layout/DashboardLayout'
import clsx from 'clsx'

const DEMO_USUARIOS = [
  { id:'1', nombre:'Martí Berrio',    apellidos:'Prieto',   email:'admin@grafiquesmarti.com',     rol:'admin',    activo:true,  ultimo_acceso:'2025-06-26T10:12:00' },
  { id:'2', nombre:'Joan',            apellidos:'Puig',     email:'joan@grafiquesmarti.com',       rol:'empleado', activo:true,  ultimo_acceso:'2025-06-26T09:45:00' },
  { id:'3', nombre:'Maria',           apellidos:'Sánchez',  email:'maria@grafiquesmarti.com',      rol:'empleado', activo:true,  ultimo_acceso:'2025-06-25T16:30:00' },
  { id:'4', nombre:'Carlos',          apellidos:'Romero',   email:'carlos@grafiquesmarti.com',     rol:'consulta', activo:true,  ultimo_acceso:'2025-06-24T11:00:00' },
  { id:'5', nombre:'Laura',           apellidos:'Vidal',    email:'laura@grafiquesmarti.com',      rol:'empleado', activo:false, ultimo_acceso:'2025-06-10T08:20:00' },
]

const ROL_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  admin:    { label: 'Admin',     color: 'text-yellow-300', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  empleado: { label: 'Empleado',  color: 'text-blue-300',   bg: 'bg-blue-500/10 border-blue-500/20' },
  consulta: { label: 'Consulta',  color: 'text-surface-300',bg: 'bg-surface-700/50 border-surface-600' },
}

interface FormData { nombre: string; apellidos: string; email: string; password: string; rol_id: string }

export default function UsuariosAdminPage() {
  const [usuarios, setUsuarios] = useState(DEMO_USUARIOS)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [form, setForm] = useState<FormData>({
    nombre: '', apellidos: '', email: '', password: '', rol_id: '2'
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)

    try {
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, rol_id: +form.rol_id }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }

      setUsuarios(prev => [...prev, {
        id: data.data.id,
        nombre: form.nombre, apellidos: form.apellidos,
        email: form.email, rol: ['','admin','empleado','consulta'][+form.rol_id],
        activo: true, ultimo_acceso: '',
      }])
      setSuccess('Usuario creado correctamente')
      setForm({ nombre:'', apellidos:'', email:'', password:'', rol_id:'2' })
      setTimeout(() => { setSuccess(''); setShowModal(false) }, 2000)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head><title>Usuarios — Administración</title></Head>
      <DashboardLayout title="Gestión de Usuarios">
        <div className="max-w-5xl mx-auto space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-surface-400 text-sm">{usuarios.length} usuarios registrados</p>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-500 rounded-lg transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Crear usuario
            </button>
          </div>

          {/* Tabla */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-700 bg-surface-900/50">
                    <th className="text-left px-5 py-3.5 text-xs font-500 text-surface-400 uppercase tracking-wider">Usuario</th>
                    <th className="text-left px-3 py-3.5 text-xs font-500 text-surface-400 uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th className="text-left px-3 py-3.5 text-xs font-500 text-surface-400 uppercase tracking-wider">Rol</th>
                    <th className="text-left px-3 py-3.5 text-xs font-500 text-surface-400 uppercase tracking-wider hidden lg:table-cell">Último acceso</th>
                    <th className="text-left px-3 py-3.5 text-xs font-500 text-surface-400 uppercase tracking-wider">Estado</th>
                    <th className="px-3 py-3.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-700/40">
                  {usuarios.map(u => {
                    const rol = ROL_CONFIG[u.rol] || ROL_CONFIG.consulta
                    return (
                      <tr key={u.id} className="hover:bg-surface-700/20 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-800 flex items-center justify-center text-xs font-700 text-brand-300 flex-shrink-0">
                              {u.nombre.slice(0,2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-500 text-white">{u.nombre} {u.apellidos}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-surface-400 text-xs hidden md:table-cell">{u.email}</td>
                        <td className="px-3 py-4">
                          <span className={clsx('badge border text-xs', rol.bg, rol.color)}>{rol.label}</span>
                        </td>
                        <td className="px-3 py-4 text-surface-400 text-xs hidden lg:table-cell">
                          {u.ultimo_acceso
                            ? new Date(u.ultimo_acceso).toLocaleString('es-ES', { day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit' })
                            : '—'
                          }
                        </td>
                        <td className="px-3 py-4">
                          <span className={clsx(
                            'badge border text-xs',
                            u.activo ? 'bg-success/10 border-success/20 text-success' : 'bg-surface-700/50 border-surface-600 text-surface-400'
                          )}>
                            <span className={clsx('badge-dot', u.activo ? 'bg-success' : 'bg-surface-500')} />
                            {u.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-2">
                            <button className="text-surface-400 hover:text-brand-400 transition-colors p-1" title="Editar">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button className="text-surface-400 hover:text-danger transition-colors p-1" title="Desactivar">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
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

          {/* Info de roles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { rol:'admin',    desc:'Acceso total: gestión de usuarios, configuración, todos los módulos.' },
              { rol:'empleado', desc:'Puede crear y editar pedidos, clientes y presupuestos.' },
              { rol:'consulta', desc:'Solo lectura: puede ver toda la información sin modificarla.' },
            ].map(({ rol, desc }) => {
              const cfg = ROL_CONFIG[rol]
              return (
                <div key={rol} className="card p-4">
                  <span className={clsx('badge border text-xs mb-2', cfg.bg, cfg.color)}>{cfg.label}</span>
                  <p className="text-xs text-surface-400">{desc}</p>
                </div>
              )
            })}
          </div>

        </div>

        {/* Modal crear usuario */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-surface-800 border border-surface-600 rounded-2xl w-full max-w-md p-6 shadow-card-lg animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-700 text-white">Crear usuario</h2>
                <button onClick={() => setShowModal(false)} className="text-surface-400 hover:text-white transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {['nombre','apellidos'].map(field => (
                    <div key={field}>
                      <label className="block text-xs font-500 text-surface-400 uppercase tracking-wider mb-1.5">
                        {field === 'nombre' ? 'Nombre *' : 'Apellidos'}
                      </label>
                      <input type="text" name={field} value={(form as any)[field]} onChange={handleChange}
                        required={field === 'nombre'} placeholder={field === 'nombre' ? 'Joan' : 'Puig'}
                        className="w-full px-3 py-2.5 bg-surface-900 border border-surface-600 rounded-lg text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-400 transition-colors"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-500 text-surface-400 uppercase tracking-wider mb-1.5">Email *</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required
                    placeholder="joan@grafiquesmarti.com"
                    className="w-full px-3 py-2.5 bg-surface-900 border border-surface-600 rounded-lg text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-500 text-surface-400 uppercase tracking-wider mb-1.5">Contraseña * (mín. 8 caracteres)</label>
                  <input type="password" name="password" value={form.password} onChange={handleChange}
                    required minLength={8} placeholder="••••••••"
                    className="w-full px-3 py-2.5 bg-surface-900 border border-surface-600 rounded-lg text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-500 text-surface-400 uppercase tracking-wider mb-1.5">Rol *</label>
                  <select name="rol_id" value={form.rol_id} onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-surface-900 border border-surface-600 rounded-lg text-sm text-white focus:outline-none focus:border-brand-400 transition-colors">
                    <option value="1">Administrador</option>
                    <option value="2">Empleado</option>
                    <option value="3">Solo consulta</option>
                  </select>
                </div>

                {error   && <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">{error}</div>}
                {success && <div className="p-3 bg-success/10 border border-success/20 rounded-lg text-success text-sm">{success}</div>}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 border border-surface-600 text-surface-300 hover:bg-surface-700 rounded-lg text-sm transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-lg text-sm font-500 transition-colors">
                    {loading ? 'Creando…' : 'Crear usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </DashboardLayout>
    </>
  )
}