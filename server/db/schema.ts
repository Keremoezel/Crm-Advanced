import { sql, relations } from 'drizzle-orm'
import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core'

export const roles = sqliteTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  isSystem: integer('is_system', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  roleId: text('role_id')
    .notNull()
    .references(() => roles.id),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export const userPermissions = sqliteTable(
  'user_permissions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    action: text('action').notNull(),
    subject: text('subject').notNull(),
    granted: integer('granted', { mode: 'boolean' }).notNull().default(true),
  },
  (table) => [uniqueIndex('user_action_subject_idx').on(table.userId, table.action, table.subject)],
)

export const rolePermissions = sqliteTable(
  'role_permissions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    roleId: text('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    action: text('action').notNull(),
    subject: text('subject').notNull(),
    granted: integer('granted', { mode: 'boolean' }).notNull().default(true),
  },
  (table) => [uniqueIndex('role_action_subject_idx').on(table.roleId, table.action, table.subject)],
)

export const companies = sqliteTable(
  'companies',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tenantId: text('tenant_id').notNull(),
    name: text('name').notNull(),
    project: text('project'),
    legalForm: text('legal_form'),
    industry: text('industry'),
    employeeCount: integer('employee_count'),
    website: text('website'),
    phone: text('phone'),
    email: text('email'),
    description: text('description'),
    revenueSize: text('revenue_size'),
    openingHours: text('opening_hours'),
    street: text('street'),
    postalCode: text('postal_code'),
    city: text('city'),
    state: text('state'),
    foundingDate: text('founding_date'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
  },
  (table) => [index('companies_tenant_idx').on(table.tenantId)],
)

export const companiesRelations = relations(companies, ({ one, many }) => ({
  conversationNotes: one(conversationNotes, {
    fields: [companies.id],
    references: [conversationNotes.companyId],
  }),
  contacts: many(contacts),
}))

export const conversationNotes = sqliteTable(
  'conversation_notes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tenantId: text('tenant_id').notNull(),
    companyId: integer('company_id')
      .notNull()
      .unique()
      .references(() => companies.id, { onDelete: 'cascade' }),
    conversationHook: text('conversation_hook'),
    researchResult: text('research_result'),
    updatedBy: text('updated_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index('conv_notes_tenant_idx').on(table.tenantId)],
)

export const conversationNotesRelations = relations(conversationNotes, ({ one }) => ({
  company: one(companies, {
    fields: [conversationNotes.companyId],
    references: [companies.id],
  }),
  updater: one(users, {
    fields: [conversationNotes.updatedBy],
    references: [users.id],
  }),
}))

export const contacts = sqliteTable(
  'contacts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tenantId: text('tenant_id').notNull(),
    companyId: integer('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    firstName: text('first_name').notNull(),
    lastName: text('last_name'),
    email: text('email'),
    phone: text('phone'),
    isPrimary: integer('is_primary', { mode: 'boolean' }).notNull().default(false),
    position: text('position'),
    birthDate: text('birth_date'),
    linkedin: text('linkedin'),
    xing: text('xing'),
    facebook: text('facebook'),
    notes: text('notes'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
  },
  (table) => [
    index('contacts_tenant_idx').on(table.tenantId),
    index('contacts_company_idx').on(table.companyId),
  ],
)

export const contactsRelations = relations(contacts, ({ one }) => ({
  company: one(companies, {
    fields: [contacts.companyId],
    references: [companies.id],
  }),
}))
