import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'User ID required' })

  const body = await readBody(event)

  const [existing] = await db.select().from(schema.users).where(eq(schema.users.id, id))
  if (!existing) throw createError({ statusCode: 404, message: 'Benutzer nicht gefunden' })

  await db.update(schema.users).set({
    name: body.name ?? existing.name,
    email: body.email ?? existing.email,
    roleId: body.roleId ?? existing.roleId,
    isActive: body.isActive ?? existing.isActive,
    updatedAt: new Date().toISOString(),
  }).where(eq(schema.users.id, id))

  if (body.permissions && Array.isArray(body.permissions)) {
    await db.delete(schema.userPermissions).where(eq(schema.userPermissions.userId, id))

    const permissionRows = body.permissions
      .filter((p: any) => p.granted !== undefined)
      .map((p: any) => ({
        id: crypto.randomUUID(),
        userId: id,
        action: p.action,
        subject: p.subject,
        granted: p.granted,
      }))

    if (permissionRows.length > 0) {
      await db.insert(schema.userPermissions).values(permissionRows)
    }
  }

  return { success: true }
})
