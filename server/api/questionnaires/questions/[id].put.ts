import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Fehlende Frage-ID' })
  }

  const body = await readBody(event)
  const updates: Record<string, unknown> = {}

  if (body.questionText !== undefined) updates.questionText = body.questionText.trim()
  if (body.type !== undefined) updates.type = body.type
  if (body.options !== undefined)
    updates.options = body.options ? JSON.stringify(body.options) : null
  if (body.isRequired !== undefined) updates.isRequired = Boolean(body.isRequired)
  if (body.offerText !== undefined) updates.offerText = body.offerText?.trim() || null
  if (body.parentQuestionId !== undefined) updates.parentQuestionId = body.parentQuestionId || null
  if (body.conditionValue !== undefined) updates.conditionValue = body.conditionValue || null

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Keine Änderungen angegeben' })
  }

  const [updated] = await db
    .update(schema.questionnaireQuestions)
    .set(updates)
    .where(eq(schema.questionnaireQuestions.id, id))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Frage nicht gefunden' })
  }

  return updated
})
