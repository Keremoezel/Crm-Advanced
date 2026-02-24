export async function seedRoles() {
  const existingRoles = await db.select().from(schema.roles).limit(1)
  if (existingRoles.length > 0) return

  await db.insert(schema.roles).values(
    ROLES_META.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: true,
      createdAt: new Date().toISOString(),
    })),
  )

  // Seed default role permissions
  const allRolePerms = Object.entries(DEFAULT_ROLE_PERMISSIONS).flatMap(
    ([roleId, perms]) => perms.map(p => ({
      roleId,
      action: p.action,
      subject: p.subject,
      granted: p.granted,
    })),
  )

  // Insert in batches of 50 (SQLite variable limit)
  for (let i = 0; i < allRolePerms.length; i += 50) {
    await db.insert(schema.rolePermissions).values(allRolePerms.slice(i, i + 50))
  }

  console.log(`[seed] Inserted 9 roles + ${allRolePerms.length} role permissions`)
}
