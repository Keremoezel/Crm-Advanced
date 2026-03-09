import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Fehlende Kunden-ID' })
  }

  const companyId = parseInt(id, 10)
  if (Number.isNaN(companyId)) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültige Kunden-ID' })
  }

  const company = await db.query.companies.findFirst({
    where: eq(schema.companies.id, companyId),
    with: {
      contacts: {
        orderBy: (contacts, { desc }) => [desc(contacts.isPrimary)],
      },
      conversationNotes: true,
    },
  })

  if (!company) {
    throw createError({ statusCode: 404, statusMessage: 'Kunde nicht gefunden' })
  }

  return {
    id: company.id,
    name: company.name,
    project: company.project || '',
    legalForm: company.legalForm || '',
    industry: company.industry || '',
    employeeCount: company.employeeCount ?? 0,
    website: company.website || '',
    phone: company.phone || '',
    email: company.email || '',
    openingHours: company.openingHours || '',
    revenueSize: company.revenueSize || '',
    street: company.street || '',
    postalCode: company.postalCode || '',
    city: company.city || '',
    state: company.state || '',
    foundingDate: company.foundingDate || '',
    description: company.description || '',
    conversationHook: company.conversationNotes?.conversationHook || '',
    researchResult: company.conversationNotes?.researchResult || '',
    contacts: company.contacts.map((c) => ({
      id: c.id,
      isPrimary: c.isPrimary,
      firstName: c.firstName,
      lastName: c.lastName || '',
      email: c.email || '',
      phone: c.phone || '',
      position: c.position || '',
      birthDate: c.birthDate || '',
      linkedin: c.linkedin || '',
      xing: c.xing || '',
      facebook: c.facebook || '',
      notes: c.notes || '',
    })),
  }
})
