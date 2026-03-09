import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Fehlende Submission-ID' })
  }

  const submission = await db.query.questionnaireSubmissions.findFirst({
    where: eq(schema.questionnaireSubmissions.id, id),
    with: {
      answers: true,
      template: {
        with: {
          questions: {
            orderBy: (q, { asc }) => [asc(q.sortOrder)],
          },
        },
      },
      company: true,
    },
  })

  if (!submission) {
    throw createError({ statusCode: 404, statusMessage: 'Submission nicht gefunden' })
  }

  return submission
})
