import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.name || !body.email || !body.roleId) {
    throw createError({ statusCode: 400, message: 'Name, E-Mail und Rolle sind erforderlich' })
  }

  const existing = await db.select().from(schema.users).where(eq(schema.users.email, body.email)).limit(1)
  if (existing.length > 0) {
    throw createError({ statusCode: 409, message: 'Ein Benutzer mit dieser E-Mail existiert bereits' })
  }

  const userId = crypto.randomUUID()
  const now = new Date().toISOString()

  await db.insert(schema.users).values({
    id: userId,
    name: body.name,
    email: body.email,
    roleId: body.roleId,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  })

  if (body.permissions && Array.isArray(body.permissions)) {
    const permissionRows = body.permissions
      .filter((p: any) => p.granted !== undefined)
      .map((p: any) => ({
        id: crypto.randomUUID(),
        userId,
        action: p.action,
        subject: p.subject,
        granted: p.granted,
      }))

    if (permissionRows.length > 0) {
      await db.insert(schema.userPermissions).values(permissionRows)
    }
  }

  return { id: userId }
})
