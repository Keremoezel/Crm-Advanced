import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Fehlende Vorlagen-ID' })
  }

  const template = await db.query.questionnaireTemplates.findFirst({
    where: eq(schema.questionnaireTemplates.id, id),
    with: {
      questions: {
        orderBy: (q, { asc }) => [asc(q.sortOrder)],
      },
    },
  })

  if (!template) {
    throw createError({ statusCode: 404, statusMessage: 'Vorlage nicht gefunden' })
  }

  return template
})
