export async function seedRoles() {
  const existingRoles = await db.select().from(schema.roles).limit(1)
  if (existingRoles.length > 0) return

  await db.insert(schema.roles).values(
    ROLES_META.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: true,
      createdAt: new Date().toISOString(),
    })),
  )

  // Seed default role permissions
  const allRolePerms = Object.entries(DEFAULT_ROLE_PERMISSIONS).flatMap(([roleId, perms]) =>
    perms.map((p) => ({
      roleId,
      action: p.action,
      subject: p.subject,
      granted: p.granted,
    })),
  )

  // Insert in batches of 50 (SQLite variable limit)
  for (let i = 0; i < allRolePerms.length; i += 50) {
    await db.insert(schema.rolePermissions).values(allRolePerms.slice(i, i + 50))
  }
}

export async function seedCustomers() {
  const existing = await db.select({ id: schema.companies.id }).from(schema.companies).limit(1)
  if (existing.length > 0) return

  const tenantId = 'default'

  // Insert sample company
  const [company] = await db
    .insert(schema.companies)
    .values({
      tenantId,
      name: 'Müller & Schmidt GmbH',
      project: 'CRM Einführung',
      legalForm: 'GmbH',
      industry: 'IT-Dienstleistungen',
      employeeCount: 85,
      website: 'https://mueller-schmidt.de',
      phone: '+49 30 12345678',
      email: 'info@mueller-schmidt.de',
      description: 'Führender IT-Dienstleister im Bereich Cloud-Lösungen und Softwareentwicklung.',
      revenueSize: '5-10 Mio €',
      openingHours: 'Mo-Fr 08:00-17:00',
      street: 'Berliner Str. 42',
      postalCode: '10115',
      city: 'Berlin',
      state: 'Berlin',
      foundingDate: '2005-03-15',
    })
    .returning()

  // Insert primary contact
  await db.insert(schema.contacts).values({
    tenantId,
    companyId: company!.id,
    firstName: 'Thomas',
    lastName: 'Müller',
    email: 't.mueller@mueller-schmidt.de',
    phone: '+49 30 12345679',
    isPrimary: true,
    position: 'Geschäftsführer',
    birthDate: '1978-06-12',
    linkedin: 'https://linkedin.com/in/thomas-mueller',
    xing: 'https://xing.com/profile/thomas-mueller',
    notes: 'Bevorzugt E-Mail-Kommunikation. Termine nur nachmittags.',
  })

  // Insert secondary contact
  await db.insert(schema.contacts).values({
    tenantId,
    companyId: company!.id,
    firstName: 'Anna',
    lastName: 'Schmidt',
    email: 'a.schmidt@mueller-schmidt.de',
    phone: '+49 30 12345680',
    isPrimary: false,
    position: 'Vertriebsleiterin',
    birthDate: '1985-11-23',
    linkedin: 'https://linkedin.com/in/anna-schmidt',
    notes: 'Hauptansprechpartnerin für Vertriebsthemen.',
  })

  // Insert conversation notes
  await db.insert(schema.conversationNotes).values({
    tenantId,
    companyId: company!.id,
    conversationHook: 'Interesse an neuer CRM-Lösung. Aktuelles System veraltet.',
    researchResult:
      'Wachsendes Unternehmen, plant Expansion nach München. Budget für IT-Modernisierung vorhanden.',
  })
}
