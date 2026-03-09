import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Fehlende Submission-ID' })
  }

  const body = await readBody(event)

  // Verify submission exists
  const existing = await db.query.questionnaireSubmissions.findFirst({
    where: eq(schema.questionnaireSubmissions.id, id),
  })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Submission nicht gefunden' })
  }

  // Upsert answers
  if (Array.isArray(body.answers)) {
    for (const answer of body.answers) {
      if (!answer.questionId) continue

      // Check if answer already exists for this question
      const existingAnswer = await db.query.questionnaireAnswers.findFirst({
        where: and(
          eq(schema.questionnaireAnswers.submissionId, id),
          eq(schema.questionnaireAnswers.questionId, answer.questionId),
        ),
      })

      if (existingAnswer) {
        await db
          .update(schema.questionnaireAnswers)
          .set({
            answerValue: answer.answerValue ?? null,
            answerOptions: answer.answerOptions ? JSON.stringify(answer.answerOptions) : null,
          })
          .where(eq(schema.questionnaireAnswers.id, existingAnswer.id))
      } else {
        await db.insert(schema.questionnaireAnswers).values({
          submissionId: id,
          questionId: answer.questionId,
          answerValue: answer.answerValue ?? null,
          answerOptions: answer.answerOptions ? JSON.stringify(answer.answerOptions) : null,
        })
      }
    }
  }

  // Update status if provided
  if (body.status) {
    await db
      .update(schema.questionnaireSubmissions)
      .set({ status: body.status })
      .where(eq(schema.questionnaireSubmissions.id, id))
  }

  // Return updated submission with answers
  const updated = await db.query.questionnaireSubmissions.findFirst({
    where: eq(schema.questionnaireSubmissions.id, id),
    with: {
      answers: true,
    },
  })

  return updated
})
