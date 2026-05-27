// pages/api/admin/usuarios/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceSupabase } from '../../../../lib/supabase'
import { verifyToken, hashPassword, sanitize, sanitizeEmail } from '../../../../lib/security'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // verifyToken es async — hay que usar await
  const token = req.cookies['gm_session']
  if (!token) return res.status(401).json({ error: 'No autenticado' })

  const user = await verifyToken(token)
  if (!user)  return res.status(401).json({ error: 'Sesión inválida o expirada' })

  if (user.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo los administradores pueden gestionar usuarios' })
  }

  const supabase = getServiceSupabase()

  // ── GET: listar usuarios ──────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, email, nombre, apellidos, activo, ultimo_acceso, roles(nombre)')
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data })
  }

  // ── POST: crear usuario ───────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { email, password, nombre, apellidos, rol_id } = req.body

    if (!email || !password || !nombre) {
      return res.status(400).json({ error: 'Email, contraseña y nombre son obligatorios' })
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' })
    }

    const cleanEmail = sanitizeEmail(email)
    const hash       = await hashPassword(password)

    const { data, error } = await supabase
      .from('usuarios')
      .insert({
        email:         cleanEmail,
        password_hash: hash,
        nombre:        sanitize(nombre),
        apellidos:     apellidos ? sanitize(apellidos) : null,
        rol_id:        rol_id || 2,
        created_by:    user.userId,
      })
      .select('id, email, nombre, activo')
      .single()

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Ya existe un usuario con ese email' })
      }
      return res.status(500).json({ error: error.message })
    }

    // Registrar en auditoría
    await supabase.from('audit_log').insert({
      usuario_id:  user.userId,
      accion:      'CREATE',
      tabla:       'usuarios',
      registro_id: data?.id,
      detalle:     { email: cleanEmail, creado_por: user.email },
    })

    return res.status(201).json({ data })
  }

  return res.status(405).json({ error: 'Método no permitido' })
}