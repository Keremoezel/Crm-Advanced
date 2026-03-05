import { eq, and, notInArray } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const companyId = parseInt(getRouterParam(event, 'id') || '0', 10)
  if (!companyId || Number.isNaN(companyId)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing company ID' })
  }

  const body = await readBody(event)
  if (!Array.isArray(body)) {
    throw createError({ statusCode: 400, statusMessage: 'Expected array of contacts' })
  }

  // Verify company exists
  const company = await db.query.companies.findFirst({
    where: eq(schema.companies.id, companyId),
    columns: { id: true, tenantId: true },
  })

  if (!company) {
    throw createError({ statusCode: 404, statusMessage: 'Company not found' })
  }

  const incomingIds = body.filter((c: { id?: number }) => c.id).map((c: { id: number }) => c.id)

  // Delete contacts not in incoming list
  if (incomingIds.length > 0) {
    await db
      .delete(schema.contacts)
      .where(
        and(eq(schema.contacts.companyId, companyId), notInArray(schema.contacts.id, incomingIds)),
      )
  } else {
    await db.delete(schema.contacts).where(eq(schema.contacts.companyId, companyId))
  }

  // Separate updates and inserts
  type ContactInsert = typeof schema.contacts.$inferInsert

  for (const contact of body) {
    const contactData: Partial<ContactInsert> = {
      firstName: contact.firstName ?? '',
      lastName: contact.lastName ?? undefined,
      email: contact.email ?? undefined,
      phone: contact.phone ?? undefined,
      position: contact.position ?? undefined,
      birthDate: contact.birthDate ?? undefined,
      isPrimary: contact.isPrimary ?? false,
      linkedin: contact.linkedin ?? undefined,
      xing: contact.xing ?? undefined,
      facebook: contact.facebook ?? undefined,
      notes: contact.notes ?? undefined,
      updatedAt: new Date(),
    }

    if (contact.id) {
      await db
        .update(schema.contacts)
        .set(contactData)
        .where(and(eq(schema.contacts.id, contact.id), eq(schema.contacts.companyId, companyId)))
    } else {
      await db.insert(schema.contacts).values({
        ...contactData,
        companyId,
        tenantId: company.tenantId,
        firstName: contact.firstName ?? '',
      } as ContactInsert)
    }
  }

  return { success: true }
})
