import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const templateId = getRouterParam(event, 'id')
  if (!templateId) {
    throw createError({ statusCode: 400, statusMessage: 'Fehlende Vorlagen-ID' })
  }

  const body = await readBody(event)

  if (!Array.isArray(body.order) || body.order.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Sortierreihenfolge ist erforderlich' })
  }

  // Update sort order for each question
  const updates = body.order.map((questionId: string, index: number) =>
    db
      .update(schema.questionnaireQuestions)
      .set({ sortOrder: index })
      .where(eq(schema.questionnaireQuestions.id, questionId)),
  )

  await Promise.all(updates)

  return { success: true }
})
