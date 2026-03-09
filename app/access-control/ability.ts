import { AbilityBuilder, createMongoAbility, type MongoAbility } from '@casl/ability'

export type AppAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'
  | 'import'
  | 'assign'
  | 'approve'
  | 'call'
  | 'view'
  | 'manage'
export type AppSubject =
  | 'Lead'
  | 'Contact'
  | 'Deal'
  | 'Invoice'
  | 'Ticket'
  | 'Task'
  | 'CalendarEvent'
  | 'Campaign'
  | 'CallLog'
  | 'EmailThread'
  | 'Report'
  | 'Dashboard'
  | 'AdminPanel'
  | 'User'
  | 'Role'
  | 'Setting'
  | 'Teams'
  | 'Questionnaire'
  | 'all'

export type AppAbility = MongoAbility<[AppAction, AppSubject]>

export interface UserPermission {
  action: string
  subject: string
  granted: boolean
}

export interface CaslUser {
  id: string
  roleId: string
  permissions: UserPermission[]
}

export function defineAbilityFor(user: CaslUser | null): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

  if (!user) {
    return build()
  }

  // Apply all granted permissions
  for (const perm of user.permissions) {
    if (perm.granted) {
      can(perm.action as AppAction, perm.subject as AppSubject)
    }
  }

  return build()
}
