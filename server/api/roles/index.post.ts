import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ name: string; description?: string }>(event)

  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
    throw createError({ statusCode: 400, message: 'Name ist erforderlich (min. 2 Zeichen).' })
  }

  const id = body.name
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

  const [existing] = await db
    .select({ id: schema.roles.id })
    .from(schema.roles)
    .where(eq(schema.roles.id, id))

  if (existing) {
    throw createError({
      statusCode: 409,
      message: 'Eine Rolle mit diesem Namen existiert bereits.',
    })
  }

  const [created] = await db
    .insert(schema.roles)
    .values({
      id,
      name: body.name.trim(),
      description: body.description?.trim() || '',
      isSystem: false,
    })
    .returning()

  return created
})
