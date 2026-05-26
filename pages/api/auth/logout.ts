import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  // Destruir la cookie estableciendo una fecha de expiración en el pasado
  res.setHeader('Set-Cookie', serialize('gm_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: -1, 
    path: '/'
  }))

  return res.status(200).json({ success: true })
}