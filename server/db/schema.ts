import { sql, relations } from 'drizzle-orm'
import {
  pgTable,
  text,
  boolean,
  integer,
  serial,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'

export const roles = pgTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  isSystem: boolean('is_system').notNull().default(true),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  roleId: text('role_id')
    .notNull()
    .references(() => roles.id),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export const userPermissions = pgTable(
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
    granted: boolean('granted').notNull().default(true),
  },
  (table) => [uniqueIndex('user_action_subject_idx').on(table.userId, table.action, table.subject)],
)

export const rolePermissions = pgTable(
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
    granted: boolean('granted').notNull().default(true),
  },
  (table) => [uniqueIndex('role_action_subject_idx').on(table.roleId, table.action, table.subject)],
)

export const companies = pgTable(
  'companies',
  {
    id: serial('id').primaryKey(),
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
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at'),
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

export const conversationNotes = pgTable(
  'conversation_notes',
  {
    id: serial('id').primaryKey(),
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
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`now()`),
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

export const contacts = pgTable(
  'contacts',
  {
    id: serial('id').primaryKey(),
    tenantId: text('tenant_id').notNull(),
    companyId: integer('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    firstName: text('first_name').notNull(),
    lastName: text('last_name'),
    email: text('email'),
    phone: text('phone'),
    isPrimary: boolean('is_primary').notNull().default(false),
    position: text('position'),
    birthDate: text('birth_date'),
    linkedin: text('linkedin'),
    xing: text('xing'),
    facebook: text('facebook'),
    notes: text('notes'),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at'),
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
