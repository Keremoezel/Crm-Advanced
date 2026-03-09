import { sql } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const templates = await db
    .select({
      id: schema.questionnaireTemplates.id,
      name: schema.questionnaireTemplates.name,
      description: schema.questionnaireTemplates.description,
      isActive: schema.questionnaireTemplates.isActive,
      createdAt: schema.questionnaireTemplates.createdAt,
      questionCount: sql<number>`(
        SELECT count(*) FROM questionnaire_questions
        WHERE questionnaire_questions.template_id = ${schema.questionnaireTemplates.id}
      )`,
    })
    .from(schema.questionnaireTemplates)
    .orderBy(schema.questionnaireTemplates.createdAt)

  return templates
})
