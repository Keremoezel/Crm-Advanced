import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Role ID required' })

  const [role] = await db.select().from(schema.roles).where(eq(schema.roles.id, id))
  if (!role) throw createError({ statusCode: 404, message: 'Rolle nicht gefunden' })

  const perms = await db.select().from(schema.rolePermissions).where(eq(schema.rolePermissions.roleId, id))

  return {
    ...role,
    defaultPermissions: perms,
  }
})
