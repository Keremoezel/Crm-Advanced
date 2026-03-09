import { jsPDF } from 'jspdf'

interface PdfQuestion {
  questionText: string
  type: string
  offerText: string | null
  isRequired: boolean
}

interface PdfAnswer {
  questionId: string
  answerValue: string | null
  answerOptions: string | null
}

interface PdfData {
  templateName: string
  companyName: string
  companyCity?: string | null
  companyStreet?: string | null
  companyPostalCode?: string | null
  companyPhone?: string | null
  companyEmail?: string | null
  completedAt: string
  questions: PdfQuestion[]
  answers: PdfAnswer[]
}

function formatAnswerValue(
  type: string,
  answerValue: string | null,
  answerOptions: string | null,
): string {
  if (type === 'yes_no') {
    return answerValue === 'yes' ? 'Ja' : answerValue === 'no' ? 'Nein' : '-'
  }
  if (type === 'multiple_choice' && answerOptions) {
    try {
      const opts = JSON.parse(answerOptions) as string[]
      return opts.join(', ')
    } catch {
      return answerOptions
    }
  }
  if (type === 'rating' && answerValue) {
    return `${answerValue} / 5`
  }
  return answerValue || '-'
}

export function generateQuestionnairePdf(data: PdfData): Uint8Array {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // --- Header ---
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(114, 9, 35) // #720923
  doc.text(data.templateName, margin, y)
  y += 10

  // Company info
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  doc.text(`Kunde: ${data.companyName}`, margin, y)
  y += 6

  if (data.companyStreet || data.companyCity) {
    const address = [
      data.companyStreet,
      [data.companyPostalCode, data.companyCity].filter(Boolean).join(' '),
    ]
      .filter(Boolean)
      .join(', ')
    doc.text(`Adresse: ${address}`, margin, y)
    y += 6
  }

  if (data.companyPhone) {
    doc.text(`Telefon: ${data.companyPhone}`, margin, y)
    y += 6
  }

  if (data.companyEmail) {
    doc.text(`E-Mail: ${data.companyEmail}`, margin, y)
    y += 6
  }

  doc.text(
    `Datum: ${new Date(data.completedAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
    margin,
    y,
  )
  y += 10

  // Divider
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  // --- Section 1: Gespraechsprotokoll ---
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(114, 9, 35)
  doc.text('Gespraechsprotokoll', margin, y)
  y += 8

  doc.setFontSize(10)
  for (let i = 0; i < data.questions.length; i++) {
    const q = data.questions[i]!
    // Find matching answer by checking all answers
    const matchedAnswer = data.answers[i]

    // Check if we need a new page
    if (y > 270) {
      doc.addPage()
      y = margin
    }

    // Question
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(40, 40, 40)
    const questionLines = doc.splitTextToSize(`${i + 1}. ${q.questionText}`, contentWidth)
    doc.text(questionLines, margin, y)
    y += questionLines.length * 4.5

    // Answer
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    const answerText = matchedAnswer
      ? formatAnswerValue(q.type, matchedAnswer.answerValue, matchedAnswer.answerOptions)
      : 'Nicht beantwortet'
    const answerLines = doc.splitTextToSize(`Antwort: ${answerText}`, contentWidth)
    doc.text(answerLines, margin, y)
    y += answerLines.length * 4.5 + 4
  }

  // --- Section 2: Angebot ---
  const offerItems = data.questions.filter((q, i) => {
    if (!q.offerText) return false
    const matchedAnswer = data.answers[i]
    if (!matchedAnswer) return false
    // Include if answer is positive (yes, or any selected option for choice types)
    if (q.type === 'yes_no') return matchedAnswer.answerValue === 'yes'
    return !!matchedAnswer.answerValue || !!matchedAnswer.answerOptions
  })

  if (offerItems.length > 0) {
    if (y > 250) {
      doc.addPage()
      y = margin
    }

    y += 6
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, y, pageWidth - margin, y)
    y += 8

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(114, 9, 35)
    doc.text('Angebot', margin, y)
    y += 8

    doc.setFontSize(10)
    for (const item of offerItems) {
      if (y > 270) {
        doc.addPage()
        y = margin
      }

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(60, 60, 60)
      const offerLines = doc.splitTextToSize(`• ${item.offerText}`, contentWidth - 5)
      doc.text(offerLines, margin + 2, y)
      y += offerLines.length * 4.5 + 3
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Seite ${p} von ${pageCount} | Erstellt am ${new Date().toLocaleDateString('de-DE')}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' },
    )
  }

  return doc.output('arraybuffer') as unknown as Uint8Array
}
