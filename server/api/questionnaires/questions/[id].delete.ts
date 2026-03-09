import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Fehlende Frage-ID' })
  }

  const [deleted] = await db
    .delete(schema.questionnaireQuestions)
    .where(eq(schema.questionnaireQuestions.id, id))
    .returning({ id: schema.questionnaireQuestions.id })

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Frage nicht gefunden' })
  }

  return { success: true }
})
