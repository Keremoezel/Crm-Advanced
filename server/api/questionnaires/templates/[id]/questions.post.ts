import { eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const templateId = getRouterParam(event, 'id')
  if (!templateId) {
    throw createError({ statusCode: 400, statusMessage: 'Fehlende Vorlagen-ID' })
  }

  const body = await readBody(event)

  if (!body.questionText?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Fragetext ist erforderlich' })
  }

  const validTypes = ['yes_no', 'single_choice', 'multiple_choice', 'text', 'number', 'rating']
  if (!validTypes.includes(body.type)) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültiger Fragetyp' })
  }

  // Get next sort order
  const [maxOrder] = await db
    .select({ max: sql<number>`coalesce(max(${schema.questionnaireQuestions.sortOrder}), -1)` })
    .from(schema.questionnaireQuestions)
    .where(eq(schema.questionnaireQuestions.templateId, templateId))

  const nextOrder = (Number(maxOrder?.max) || 0) + 1

  const [question] = await db
    .insert(schema.questionnaireQuestions)
    .values({
      templateId,
      parentQuestionId: body.parentQuestionId || null,
      conditionValue: body.conditionValue || null,
      sortOrder: nextOrder,
      type: body.type,
      questionText: body.questionText.trim(),
      options: body.options ? JSON.stringify(body.options) : null,
      isRequired: Boolean(body.isRequired),
      offerText: body.offerText?.trim() || null,
    })
    .returning()

  return question
})
