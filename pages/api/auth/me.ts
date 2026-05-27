// pages/api/auth/me.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../../lib/security'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const token = req.cookies['gm_session']

  if (!token) {
    return res.status(401).json({ error: 'No autenticado' })
  }

  // verifyToken es async en este proyecto — hay que usar await
  const payload = await verifyToken(token)

  if (!payload) {
    return res.status(401).json({ error: 'Sesión inválida o expirada' })
  }

  return res.status(200).json({
    userId: payload.userId,
    email:  payload.email,
    nombre: payload.nombre,
    rol:    payload.rol,
  })
}