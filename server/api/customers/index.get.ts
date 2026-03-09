import { ilike, sql, and, eq, gte, lte, or } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 25))
  const offset = (page - 1) * limit
  const search = (query.search as string)?.trim()
  const industry = (query.industry as string)?.trim()
  const city = (query.city as string)?.trim()
  const revenueSize = (query.revenueSize as string)?.trim()
  const employeeCountMin = parseInt(query.employeeCountMin as string) || undefined
  const employeeCountMax = parseInt(query.employeeCountMax as string) || undefined

  // Build where conditions
  const conditions = []

  if (search) {
    const escaped = search.replace(/[%_\\]/g, '\\$&')
    const pattern = `%${escaped}%`
    conditions.push(
      or(
        ilike(schema.companies.name, pattern),
        ilike(schema.companies.industry, pattern),
        ilike(schema.companies.city, pattern),
      ),
    )
  }

  if (industry) {
    conditions.push(eq(schema.companies.industry, industry))
  }

  if (city) {
    conditions.push(eq(schema.companies.city, city))
  }

  if (revenueSize) {
    conditions.push(eq(schema.companies.revenueSize, revenueSize))
  }

  if (employeeCountMin !== undefined) {
    conditions.push(gte(schema.companies.employeeCount, employeeCountMin))
  }

  if (employeeCountMax !== undefined) {
    conditions.push(lte(schema.companies.employeeCount, employeeCountMax))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  // Count total
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.companies)
    .where(whereClause)

  const total = Number(countResult?.count) || 0

  // Fetch companies — lightweight for table list, only primary contact
  const companiesData = await db.query.companies.findMany({
    where: whereClause,
    columns: {
      id: true,
      name: true,
      industry: true,
      city: true,
      employeeCount: true,
      revenueSize: true,
      phone: true,
    },
    orderBy: (companies, { desc }) => [desc(companies.createdAt)],
    limit,
    offset,
    with: {
      contacts: {
        where: eq(schema.contacts.isPrimary, true),
        columns: {
          firstName: true,
          lastName: true,
          phone: true,
        },
        limit: 1,
      },
    },
  })

  const data = companiesData.map((company) => {
    const primary = company.contacts[0]
    return {
      id: company.id,
      name: company.name,
      industry: company.industry || '',
      city: company.city || '',
      employeeCount: company.employeeCount ?? 0,
      revenueSize: company.revenueSize || '',
      phone: company.phone || '',
      primaryContact: primary ? `${primary.firstName} ${primary.lastName || ''}`.trim() : '',
      primaryContactPhone: primary?.phone || '',
    }
  })

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
