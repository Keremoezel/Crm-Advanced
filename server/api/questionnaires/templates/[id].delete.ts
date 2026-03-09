import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Fehlende Vorlagen-ID' })
  }

  const [updated] = await db
    .update(schema.questionnaireTemplates)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(schema.questionnaireTemplates.id, id))
    .returning({ id: schema.questionnaireTemplates.id })

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Vorlage nicht gefunden' })
  }

  return { success: true }
})
