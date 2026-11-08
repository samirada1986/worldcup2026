import type { Access, FieldAccess, PayloadRequest, Where } from 'payload'

type Role = 'admin' | 'editor'

const roleOf = (req: PayloadRequest): Role | null => {
  const user = req.user as { role?: Role; collection?: string } | null
  if (!user || user.collection !== 'users') return null
  return user.role ?? 'editor'
}

export const isLoggedIn: Access = ({ req }) => Boolean(roleOf(req))
export const isAdmin: Access = ({ req }) => roleOf(req) === 'admin'
export const isAdminField: FieldAccess = ({ req }) => roleOf(req) === 'admin'

/** Public visitors only see published documents (Payload drafts: `_status`). */
export const publishedOrLoggedIn: Access = ({ req }) => {
  if (roleOf(req)) return true
  return { _status: { equals: 'published' } }
}

/** Projects additionally hide archived items from the public. */
export const publicProjects: Access = ({ req }) => {
  if (roleOf(req)) return true
  const where: Where = { and: [{ _status: { equals: 'published' } }, { archived: { not_equals: true } }] }
  return where
}

export const anyone: Access = () => true

/** Users may read/update themselves; admins may manage everyone. */
export const adminOrSelf: Access = ({ req }) => {
  const role = roleOf(req)
  if (role === 'admin') return true
  if (role && req.user) return { id: { equals: req.user.id } }
  return false
}
