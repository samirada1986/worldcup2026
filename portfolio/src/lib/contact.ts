import { createHash, createHmac, timingSafeEqual } from 'crypto'

const secret = () => process.env.PAYLOAD_SECRET || 'dev-secret'

/** Signed render timestamp: lets the server reject instant bot submissions without cookies. */
export const issueFormToken = () => {
  const ts = Date.now().toString()
  const sig = createHmac('sha256', secret()).update(ts).digest('hex').slice(0, 32)
  return `${ts}.${sig}`
}

export const checkFormToken = (token: string, minMs = 2500, maxMs = 1000 * 60 * 60 * 24) => {
  const [ts, sig] = token.split('.')
  if (!ts || !sig) return false
  const expected = createHmac('sha256', secret()).update(ts).digest('hex').slice(0, 32)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false
  const age = Date.now() - Number(ts)
  return age >= minMs && age <= maxMs
}

export const hashIp = (ip: string) => createHash('sha256').update(`${ip}:${secret()}`).digest('hex').slice(0, 40)

export const KINDS = ['exhibition', 'publication', 'press', 'acquisition', 'other'] as const

export type FieldErrors = Partial<Record<'name' | 'email' | 'message' | 'kind', 'required' | 'badEmail' | 'tooShort'>>

export type ContactInput = { name: string; email: string; kind: string; message: string }

export function validateContact(v: ContactInput): FieldErrors {
  const e: FieldErrors = {}
  if (!v.name.trim()) e.name = 'required'
  if (!v.email.trim()) e.email = 'required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim()) || v.email.length > 200) e.email = 'badEmail'
  if (!v.message.trim()) e.message = 'required'
  else if (v.message.trim().length < 10) e.message = 'tooShort'
  if (!(KINDS as readonly string[]).includes(v.kind)) e.kind = 'required'
  return e
}
