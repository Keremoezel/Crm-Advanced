import { eq } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const allUsers = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      roleId: schema.users.roleId,
      roleName: schema.roles.name,
      isActive: schema.users.isActive,
      createdAt: schema.users.createdAt,
    })
    .from(schema.users)
    .leftJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))

  return allUsers
})
