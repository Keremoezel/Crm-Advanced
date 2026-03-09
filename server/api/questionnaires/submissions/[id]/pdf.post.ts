import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Fehlende Submission-ID' })
  }

  // Fetch submission with all related data
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

  // Build answer map by questionId
  const answersByQuestionId = new Map<string, (typeof submission.answers)[0]>()
  for (const a of submission.answers) {
    answersByQuestionId.set(a.questionId, a)
  }

  // Build ordered answers array matching question order
  const orderedAnswers = submission.template.questions.map((q) => {
    const answer = answersByQuestionId.get(q.id)
    return {
      questionId: q.id,
      answerValue: answer?.answerValue ?? null,
      answerOptions: answer?.answerOptions ?? null,
    }
  })

  // Generate PDF
  const pdfBytes = generateQuestionnairePdf({
    templateName: submission.template.name,
    companyName: submission.company.name,
    companyCity: submission.company.city,
    companyStreet: submission.company.street,
    companyPostalCode: submission.company.postalCode,
    companyPhone: submission.company.phone,
    companyEmail: submission.company.email,
    completedAt: submission.createdAt.toISOString(),
    questions: submission.template.questions.map((q) => ({
      questionText: q.questionText,
      type: q.type,
      offerText: q.offerText,
      isRequired: q.isRequired,
    })),
    answers: orderedAnswers,
  })

  // Store in NuxtHub Blob
  const blobPath = `questionnaires/${id}.pdf`
  const blob = await hubBlob().put(blobPath, new Blob([pdfBytes], { type: 'application/pdf' }), {
    contentType: 'application/pdf',
  })

  // Update submission with PDF path
  await db
    .update(schema.questionnaireSubmissions)
    .set({ pdfPath: blob.pathname })
    .where(eq(schema.questionnaireSubmissions.id, id))

  return {
    success: true,
    pdfPath: blob.pathname,
  }
})
