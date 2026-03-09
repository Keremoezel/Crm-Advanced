import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Fehlende Submission-ID' })
  }

  const body = await readBody(event)
  const method = body.method as string // 'email' or 'teams'

  if (!['email', 'teams'].includes(method)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ungueltige Versandmethode. Erlaubt: email, teams',
    })
  }

  // Verify submission exists and has PDF
  const submission = await db.query.questionnaireSubmissions.findFirst({
    where: eq(schema.questionnaireSubmissions.id, id),
    columns: { id: true, pdfPath: true },
  })

  if (!submission) {
    throw createError({ statusCode: 404, statusMessage: 'Submission nicht gefunden' })
  }

  if (!submission.pdfPath) {
    throw createError({ statusCode: 400, statusMessage: 'PDF muss zuerst generiert werden' })
  }

  // TODO: Implement actual email sending via SMTP
  // TODO: Implement Teams message sending via Microsoft Graph API
  // For now, just mark the submission as sent

  await db
    .update(schema.questionnaireSubmissions)
    .set({
      sentVia: method,
      sentAt: new Date(),
    })
    .where(eq(schema.questionnaireSubmissions.id, id))

  return {
    success: true,
    message:
      method === 'email'
        ? 'E-Mail-Versand ist als Platzhalter konfiguriert. SMTP-Integration folgt.'
        : 'Teams-Versand ist als Platzhalter konfiguriert. Microsoft Graph-Integration folgt.',
    sentVia: method,
  }
})
