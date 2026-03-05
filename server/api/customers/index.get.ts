import { like, sql, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 25))
  const offset = (page - 1) * limit
  const search = (query.search as string)?.trim()

  // Build where conditions
  const conditions: ReturnType<typeof like>[] = []

  if (search) {
    const escaped = search.replace(/[%_\\]/g, '\\$&')
    conditions.push(like(schema.companies.name, `%${escaped}%`))
  }

  const whereClause = conditions.length > 1 ? and(...conditions) : (conditions[0] ?? undefined)

  // Count total
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.companies)
    .where(whereClause)

  const total = Number(countResult?.count) || 0

  // Fetch companies with contacts and notes
  const companiesData = await db.query.companies.findMany({
    where: whereClause,
    orderBy: (companies, { desc }) => [desc(companies.createdAt)],
    limit,
    offset,
    with: {
      contacts: {
        orderBy: (contacts, { desc }) => [desc(contacts.isPrimary)],
      },
      conversationNotes: true,
    },
  })

  const data = companiesData.map((company) => ({
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
  }))

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  }
})
