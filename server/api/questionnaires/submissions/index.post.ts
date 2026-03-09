import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.templateId) {
    throw createError({ statusCode: 400, statusMessage: 'Vorlagen-ID ist erforderlich' })
  }

  if (!body.companyId) {
    throw createError({ statusCode: 400, statusMessage: 'Kunden-ID ist erforderlich' })
  }

  // Verify template exists and is active
  const template = await db.query.questionnaireTemplates.findFirst({
    where: eq(schema.questionnaireTemplates.id, body.templateId),
  })

  if (!template || !template.isActive) {
    throw createError({ statusCode: 404, statusMessage: 'Vorlage nicht gefunden oder inaktiv' })
  }

  const [submission] = await db
    .insert(schema.questionnaireSubmissions)
    .values({
      tenantId: 'default',
      templateId: body.templateId,
      companyId: Number(body.companyId),
      completedBy: body.completedBy || null,
      status: 'in_progress',
    })
    .returning()

  return submission
})
