import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing customer ID' })
  }

  const companyId = parseInt(id, 10)
  if (Number.isNaN(companyId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid customer ID' })
  }

  const body = await readBody(event)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request body' })
  }

  // Verify company exists
  const existing = await db.query.companies.findFirst({
    where: eq(schema.companies.id, companyId),
    columns: { id: true },
  })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Customer not found' })
  }

  // Update only provided fields
  const updated = await db
    .update(schema.companies)
    .set({
      name: body.name ?? undefined,
      legalForm: body.legalForm ?? undefined,
      industry: body.industry ?? undefined,
      employeeCount: body.employeeCount != null ? Number(body.employeeCount) : undefined,
      website: body.website ?? undefined,
      phone: body.phone ?? undefined,
      email: body.email ?? undefined,
      openingHours: body.openingHours ?? undefined,
      revenueSize: body.revenueSize ?? undefined,
      street: body.street ?? undefined,
      postalCode: body.postalCode ?? undefined,
      city: body.city ?? undefined,
      state: body.state ?? undefined,
      foundingDate: body.foundingDate ?? undefined,
      description: body.description ?? undefined,
      project: body.project ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(schema.companies.id, companyId))
    .returning()
    .get()

  return updated
})
