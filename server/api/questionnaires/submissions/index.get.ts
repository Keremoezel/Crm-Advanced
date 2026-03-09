import { eq, desc, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const conditions = []

  if (query.companyId) {
    conditions.push(eq(schema.questionnaireSubmissions.companyId, Number(query.companyId)))
  }

  if (query.templateId) {
    conditions.push(eq(schema.questionnaireSubmissions.templateId, String(query.templateId)))
  }

  if (query.status) {
    conditions.push(eq(schema.questionnaireSubmissions.status, String(query.status)))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const submissions = await db
    .select({
      id: schema.questionnaireSubmissions.id,
      templateId: schema.questionnaireSubmissions.templateId,
      templateName: schema.questionnaireTemplates.name,
      companyId: schema.questionnaireSubmissions.companyId,
      companyName: schema.companies.name,
      completedBy: schema.questionnaireSubmissions.completedBy,
      status: schema.questionnaireSubmissions.status,
      pdfPath: schema.questionnaireSubmissions.pdfPath,
      sentVia: schema.questionnaireSubmissions.sentVia,
      sentAt: schema.questionnaireSubmissions.sentAt,
      createdAt: schema.questionnaireSubmissions.createdAt,
    })
    .from(schema.questionnaireSubmissions)
    .leftJoin(
      schema.questionnaireTemplates,
      eq(schema.questionnaireSubmissions.templateId, schema.questionnaireTemplates.id),
    )
    .leftJoin(schema.companies, eq(schema.questionnaireSubmissions.companyId, schema.companies.id))
    .where(whereClause)
    .orderBy(desc(schema.questionnaireSubmissions.createdAt))
    .limit(100)

  return submissions
})
