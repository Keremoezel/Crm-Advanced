import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const companyId = parseInt(getRouterParam(event, 'id') || '0', 10)
  if (!companyId || Number.isNaN(companyId)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing company ID' })
  }

  const body = await readBody(event)

  // Verify company exists
  const company = await db.query.companies.findFirst({
    where: eq(schema.companies.id, companyId),
    columns: { id: true, tenantId: true },
  })

  if (!company) {
    throw createError({ statusCode: 404, statusMessage: 'Company not found' })
  }

  // Upsert conversation notes
  await db
    .insert(schema.conversationNotes)
    .values({
      companyId,
      tenantId: company.tenantId,
      conversationHook: body.conversationHook ?? '',
      researchResult: body.researchResult ?? '',
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.conversationNotes.companyId,
      set: {
        conversationHook: body.conversationHook ?? '',
        researchResult: body.researchResult ?? '',
        updatedAt: new Date(),
      },
    })

  return { success: true }
})
