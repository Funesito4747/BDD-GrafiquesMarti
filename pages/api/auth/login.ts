import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '../../../lib/supabase';
import { verifyPassword, signToken, sanitizeEmail, sanitize, checkRateLimit } from '../../../lib/security';
import { serialize } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const clientIp = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(`login_${clientIp}`)) {
    return res.status(429).json({ error: 'Demasiados intentos. Prueba en 15 minutos.' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const safeEmail = sanitizeEmail(email);
    const safePassword = sanitize(password);
    const supabase = getServiceSupabase();

    const { data: usuario, error: dbError } = await supabase
      .from('usuarios')
      .select(`id, email, password_hash, nombre, activo, roles (nombre)`)
      .eq('email', safeEmail)
      .single();

    if (dbError || !usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ error: 'Usuario desactivado. Contacta con el administrador.' });
    }

    const isValid = await verifyPassword(safePassword, usuario.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const rolNombre = Array.isArray(usuario.roles) ? usuario.roles[0].nombre : (usuario.roles as any)?.nombre || 'consulta';

    // AÑADIDO EL AWAIT A CONTINUACIÓN
    const token = await signToken({
      userId: usuario.id,
      email: usuario.email,
      rol: rolNombre,
      nombre: usuario.nombre
    });

    res.setHeader('Set-Cookie', serialize('gm_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60,
      path: '/'
    }));

    await supabase.from('audit_log').insert({
      usuario_id: usuario.id,
      accion: 'LOGIN',
      ip: clientIp,
      detalle: { success: true }
    });

    return res.status(200).json({ success: true, redirect: '/dashboard' });

  } catch (error) {
    console.error('Error crítico en login:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}