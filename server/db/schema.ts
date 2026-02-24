import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const roles = sqliteTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  isSystem: integer('is_system', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  roleId: text('role_id').notNull().references(() => roles.id),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const userPermissions = sqliteTable('user_permissions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  subject: text('subject').notNull(),
  granted: integer('granted', { mode: 'boolean' }).notNull().default(true),
}, (table) => [
  uniqueIndex('user_action_subject_idx').on(table.userId, table.action, table.subject),
])

export const rolePermissions = sqliteTable('role_permissions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  roleId: text('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  subject: text('subject').notNull(),
  granted: integer('granted', { mode: 'boolean' }).notNull().default(true),
}, (table) => [
  uniqueIndex('role_action_subject_idx').on(table.roleId, table.action, table.subject),
])
