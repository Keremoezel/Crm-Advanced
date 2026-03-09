import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Fehlende Submission-ID' })
  }

  const submission = await db.query.questionnaireSubmissions.findFirst({
    where: eq(schema.questionnaireSubmissions.id, id),
    columns: { pdfPath: true },
  })

  if (!submission?.pdfPath) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PDF nicht gefunden. Bitte zuerst generieren.',
    })
  }

  // Serve the blob
  const blob = await hubBlob().get(submission.pdfPath)
  if (!blob) {
    throw createError({ statusCode: 404, statusMessage: 'PDF-Datei nicht gefunden' })
  }

  setResponseHeader(event, 'Content-Type', 'application/pdf')
  setResponseHeader(event, 'Content-Disposition', `inline; filename="fragebogen-${id}.pdf"`)

  return blob
})
