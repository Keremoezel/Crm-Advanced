import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Fehlende Vorlagen-ID' })
  }

  const body = await readBody(event)

  const updates: Record<string, unknown> = {
    updatedAt: new Date(),
  }

  if (body.name !== undefined) updates.name = body.name.trim()
  if (body.description !== undefined) updates.description = body.description?.trim() || null
  if (body.isActive !== undefined) updates.isActive = Boolean(body.isActive)

  const [updated] = await db
    .update(schema.questionnaireTemplates)
    .set(updates)
    .where(eq(schema.questionnaireTemplates.id, id))
    .returning({
      id: schema.questionnaireTemplates.id,
      name: schema.questionnaireTemplates.name,
      description: schema.questionnaireTemplates.description,
      isActive: schema.questionnaireTemplates.isActive,
    })

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Vorlage nicht gefunden' })
  }

  return updated
})
