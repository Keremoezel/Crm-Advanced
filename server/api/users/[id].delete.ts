import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'User ID required' })

  const [existing] = await db.select().from(schema.users).where(eq(schema.users.id, id))
  if (!existing) throw createError({ statusCode: 404, message: 'Benutzer nicht gefunden' })

  await db.delete(schema.userPermissions).where(eq(schema.userPermissions.userId, id))
  await db.delete(schema.users).where(eq(schema.users.id, id))

  return { success: true }
})
