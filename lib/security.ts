// Encriptación AES-256-GCM para datos sensibles + JWT + sanitización
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ''
// jose requiere que el secreto sea un buffer de bytes (Uint8Array)
const JWT_SECRET     = new TextEncoder().encode(process.env.JWT_SECRET || '')
const BCRYPT_ROUNDS  = 12
const ALGORITHM      = 'aes-256-gcm'

// ============================================================
// ENCRIPTACIÓN AES-256-GCM
// ============================================================
export function encrypt(text: string): string {
  if (!text) return ''
  const iv  = crypto.randomBytes(16)
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'gm-salt', 32)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decrypt(data: string): string {
  if (!data) return ''
  try {
    const [ivHex, tagHex, encHex] = data.split(':')
    const iv  = Buffer.from(ivHex,  'hex')
    const tag = Buffer.from(tagHex, 'hex')
    const enc = Buffer.from(encHex, 'hex')
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'gm-salt', 32)
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)
    return decipher.update(enc) + decipher.final('utf8')
  } catch {
    return ''
  }
}

// ============================================================
// BCRYPT — contraseñas
// ============================================================
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

// ============================================================
// JWT — sesiones (Adaptado para Edge Runtime con 'jose')
// ============================================================
export interface JWTPayload {
  userId:  string
  email:   string
  rol:     string
  nombre:  string
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload as unknown as import('jose').JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('gm-dashboard')
    .setAudience('gm-users')
    .setExpirationTime('8h')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer:   'gm-dashboard',
      audience: 'gm-users',
    })
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

// ============================================================
// SANITIZACIÓN
// ============================================================
export function sanitize(input: string): string {
  return input
    .replace(/[<>'"]/g, '')
    .replace(/--|;|\/\*/g, '')
    .trim()
    .slice(0, 500)
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().slice(0, 255)
}

// ============================================================
// RATE LIMITING
// ============================================================
const attempts = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(key: string, max = 5, windowMs = 15 * 60 * 1000): boolean {
  const now  = Date.now()
  const entry = attempts.get(key)

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= max) return false

  entry.count++
  return true
}

export function clearRateLimit(key: string): void {
  attempts.delete(key)
}