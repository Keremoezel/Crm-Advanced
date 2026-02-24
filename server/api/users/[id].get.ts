import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'User ID required' })

  const [user] = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      roleId: schema.users.roleId,
      roleName: schema.roles.name,
      isActive: schema.users.isActive,
      createdAt: schema.users.createdAt,
      updatedAt: schema.users.updatedAt,
    })
    .from(schema.users)
    .leftJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
    .where(eq(schema.users.id, id))

  if (!user) throw createError({ statusCode: 404, message: 'Benutzer nicht gefunden' })

  const permissions = await db
    .select()
    .from(schema.userPermissions)
    .where(eq(schema.userPermissions.userId, id))

  return { ...user, permissions }
})
