import { createMongoAbility, AbilityBuilder } from '@casl/ability'
import { eq } from 'drizzle-orm'
import type { H3Event } from 'h3'

type AppAction = 'create' | 'read' | 'update' | 'delete' | 'export' | 'import' | 'assign' | 'approve' | 'call' | 'view' | 'manage'
type AppSubject = 'Lead' | 'Contact' | 'Deal' | 'Invoice' | 'Ticket' | 'Task' | 'CalendarEvent' | 'Campaign' | 'CallLog' | 'EmailThread' | 'Report' | 'Dashboard' | 'AdminPanel' | 'User' | 'Role' | 'Setting' | 'Teams' | 'all'

/**
 * Build a CASL ability for a user by their ID.
 * Merges role defaults with per-user overrides from the DB.
 */
export async function buildAbilityForUser(userId: string) {
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId))
  if (!user) return null

  // Read role permissions from DB (editable via admin panel)
  const rolePerms = await db.select().from(schema.rolePermissions).where(eq(schema.rolePermissions.roleId, user.roleId))
  const userOverrides = await db.select().from(schema.userPermissions).where(eq(schema.userPermissions.userId, userId))

  // Start with role permissions, then apply user-specific overrides
  const permMap = new Map<string, boolean>()
  for (const p of rolePerms) {
    permMap.set(`${p.action}:${p.subject}`, p.granted)
  }
  for (const p of userOverrides) {
    permMap.set(`${p.action}:${p.subject}`, p.granted)
  }

  const { can, cannot, build } = new AbilityBuilder(createMongoAbility)

  for (const [key, granted] of permMap) {
    const [action, subject] = key.split(':') as [AppAction, AppSubject]
    if (granted) {
      can(action, subject)
    }
  }

  return build()
}

/**
 * Authorize an API request. Throws 403 if denied.
 * For now, reads userId from X-User-Id header (will be replaced by JWT later).
 */
export async function authorizeRequest(event: H3Event, action: AppAction, subject: AppSubject) {
  const userId = getHeader(event, 'x-user-id')
  if (!userId) {
    throw createError({ statusCode: 401, message: 'Nicht authentifiziert' })
  }

  const ability = await buildAbilityForUser(userId)
  if (!ability) {
    throw createError({ statusCode: 401, message: 'Benutzer nicht gefunden' })
  }

  if (!ability.can(action, subject)) {
    throw createError({
      statusCode: 403,
      message: `Sie dürfen "${action}" für "${subject}" nicht ausführen`,
    })
  }

  return ability
}
