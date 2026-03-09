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

// --- Questionnaire System ---

export const questionnaireTemplates = pgTable(
  'questionnaire_templates',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tenantId: text('tenant_id').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    isActive: boolean('is_active').notNull().default(true),
    createdBy: text('created_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at'),
  },
  (table) => [index('qt_tenant_idx').on(table.tenantId)],
)

export const questionnaireTemplatesRelations = relations(
  questionnaireTemplates,
  ({ many, one }) => ({
    questions: many(questionnaireQuestions),
    submissions: many(questionnaireSubmissions),
    creator: one(users, {
      fields: [questionnaireTemplates.createdBy],
      references: [users.id],
    }),
  }),
)

export const questionnaireQuestions = pgTable(
  'questionnaire_questions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    templateId: text('template_id')
      .notNull()
      .references(() => questionnaireTemplates.id, { onDelete: 'cascade' }),
    parentQuestionId: text('parent_question_id'),
    conditionValue: text('condition_value'),
    sortOrder: integer('sort_order').notNull().default(0),
    type: text('type').notNull(),
    questionText: text('question_text').notNull(),
    options: text('options'),
    isRequired: boolean('is_required').notNull().default(false),
    offerText: text('offer_text'),
  },
  (table) => [index('qq_template_sort_idx').on(table.templateId, table.sortOrder)],
)

export const questionnaireQuestionsRelations = relations(
  questionnaireQuestions,
  ({ one, many }) => ({
    template: one(questionnaireTemplates, {
      fields: [questionnaireQuestions.templateId],
      references: [questionnaireTemplates.id],
    }),
    parentQuestion: one(questionnaireQuestions, {
      fields: [questionnaireQuestions.parentQuestionId],
      references: [questionnaireQuestions.id],
      relationName: 'parentChild',
    }),
    childQuestions: many(questionnaireQuestions, {
      relationName: 'parentChild',
    }),
    answers: many(questionnaireAnswers),
  }),
)

export const questionnaireSubmissions = pgTable(
  'questionnaire_submissions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tenantId: text('tenant_id').notNull(),
    templateId: text('template_id')
      .notNull()
      .references(() => questionnaireTemplates.id),
    companyId: integer('company_id')
      .notNull()
      .references(() => companies.id),
    completedBy: text('completed_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    status: text('status').notNull().default('in_progress'),
    pdfPath: text('pdf_path'),
    sentVia: text('sent_via'),
    sentAt: timestamp('sent_at'),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index('qs_tenant_idx').on(table.tenantId),
    index('qs_company_idx').on(table.companyId),
    index('qs_template_idx').on(table.templateId),
  ],
)

export const questionnaireSubmissionsRelations = relations(
  questionnaireSubmissions,
  ({ one, many }) => ({
    template: one(questionnaireTemplates, {
      fields: [questionnaireSubmissions.templateId],
      references: [questionnaireTemplates.id],
    }),
    company: one(companies, {
      fields: [questionnaireSubmissions.companyId],
      references: [companies.id],
    }),
    completedByUser: one(users, {
      fields: [questionnaireSubmissions.completedBy],
      references: [users.id],
    }),
    answers: many(questionnaireAnswers),
  }),
)

export const questionnaireAnswers = pgTable(
  'questionnaire_answers',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    submissionId: text('submission_id')
      .notNull()
      .references(() => questionnaireSubmissions.id, { onDelete: 'cascade' }),
    questionId: text('question_id')
      .notNull()
      .references(() => questionnaireQuestions.id),
    answerValue: text('answer_value'),
    answerOptions: text('answer_options'),
  },
  (table) => [index('qa_submission_idx').on(table.submissionId)],
)

export const questionnaireAnswersRelations = relations(questionnaireAnswers, ({ one }) => ({
  submission: one(questionnaireSubmissions, {
    fields: [questionnaireAnswers.submissionId],
    references: [questionnaireSubmissions.id],
  }),
  question: one(questionnaireQuestions, {
    fields: [questionnaireAnswers.questionId],
    references: [questionnaireQuestions.id],
  }),
}))
