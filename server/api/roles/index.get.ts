export default defineEventHandler(async () => {
  const allRoles = await db.select().from(schema.roles)
  const allPerms = await db.select().from(schema.rolePermissions)

  return allRoles.map(role => ({
    ...role,
    defaultPermissions: allPerms.filter(p => p.roleId === role.id),
  }))
})
