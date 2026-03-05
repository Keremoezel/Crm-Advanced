import { eq, count } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Role ID required' })

  const [role] = await db
    .select({ id: schema.roles.id, name: schema.roles.name, isSystem: schema.roles.isSystem })
    .from(schema.roles)
    .where(eq(schema.roles.id, id))

  if (!role) {
    throw createError({ statusCode: 404, message: 'Rolle nicht gefunden.' })
  }

  if (role.isSystem) {
    throw createError({ statusCode: 403, message: 'Systemrollen können nicht gelöscht werden.' })
  }

  const [result] = await db
    .select({ total: count() })
    .from(schema.users)
    .where(eq(schema.users.roleId, id))

  if (result && result.total > 0) {
    throw createError({
      statusCode: 409,
      message: `Rolle kann nicht gelöscht werden. ${result.total} Benutzer sind dieser Rolle zugewiesen.`,
    })
  }

  await db.delete(schema.rolePermissions).where(eq(schema.rolePermissions.roleId, id))
  await db.delete(schema.roles).where(eq(schema.roles.id, id))

  return { success: true, deleted: role.name }
})
