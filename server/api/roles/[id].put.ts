import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Role ID required' })

  const [role] = await db.select().from(schema.roles).where(eq(schema.roles.id, id))
  if (!role) throw createError({ statusCode: 404, message: 'Rolle nicht gefunden' })

  const body = await readBody<{
    permissions: Array<{ action: string, subject: string, granted: boolean }>
  }>(event)

  if (!body.permissions || !Array.isArray(body.permissions)) {
    throw createError({ statusCode: 400, message: 'permissions[] required' })
  }

  // Delete existing role permissions and replace with new ones
  await db.delete(schema.rolePermissions).where(eq(schema.rolePermissions.roleId, id))

  const rows = body.permissions.map(p => ({
    roleId: id,
    action: p.action,
    subject: p.subject,
    granted: p.granted,
  }))

  if (rows.length > 0) {
    for (let i = 0; i < rows.length; i += 50) {
      await db.insert(schema.rolePermissions).values(rows.slice(i, i + 50))
    }
  }

  return { success: true, count: rows.length }
})
