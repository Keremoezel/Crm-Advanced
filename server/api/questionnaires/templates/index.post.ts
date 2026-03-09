export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Name ist erforderlich' })
  }

  const [template] = await db
    .insert(schema.questionnaireTemplates)
    .values({
      tenantId: 'default',
      name: body.name.trim(),
      description: body.description?.trim() || null,
    })
    .returning({
      id: schema.questionnaireTemplates.id,
      name: schema.questionnaireTemplates.name,
      description: schema.questionnaireTemplates.description,
      isActive: schema.questionnaireTemplates.isActive,
      createdAt: schema.questionnaireTemplates.createdAt,
    })

  return template
})
