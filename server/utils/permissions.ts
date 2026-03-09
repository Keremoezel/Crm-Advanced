export const ACTIONS = [
  'manage',
  'delegate',
  'editOthers',
  'viewOthers',
  'import',
  'edit',
  'create',
  'send',
  'call',
  'delete',
] as const

export const SUBJECTS = [
  'Rights',
  'SystemConfig',
  'KnowledgeBase',
  'CustomersAndTasks',
  'Customer',
  'Dashboard',
  'Appointment',
  'Email',
  'Contact',
  'Task',
  'Questionnaire',
] as const

export type Action = (typeof ACTIONS)[number]
export type Subject = (typeof SUBJECTS)[number]

export interface PermissionEntry {
  action: Action
  subject: Subject
  granted: boolean
}

export const ROLES_META = [
  { id: 'admin', name: 'Admin', description: 'Vollzugriff auf alle Funktionen und Einstellungen.' },
  {
    id: 'geschaeftsfuehrer',
    name: 'Geschäftsführer',
    description: 'Geschäftsleitung mit umfassenden Zugriffsrechten.',
  },
  {
    id: 'projektassistent',
    name: 'Projektassistent',
    description: 'Unterstützt Projekte und Teams bei der täglichen Arbeit.',
  },
  {
    id: 'teamleiter',
    name: 'Teamleiter',
    description: 'Leitet ein Team und verwaltet Kunden und Aufgaben.',
  },
  {
    id: 'abteilungsleiter',
    name: 'Abteilungsleiter',
    description: 'Leitet eine Abteilung mit erweiterten Verwaltungsrechten.',
  },
  {
    id: 'verkaeufer',
    name: 'Verkäufer',
    description: 'Bearbeitet Leads, Kontakte und Deals im Vertrieb.',
  },
  {
    id: 'anrufer',
    name: 'Anrufer',
    description: 'Tätigt und empfängt Anrufe über die Telefonintegration.',
  },
  { id: 'akquisitor', name: 'Akquisitor', description: 'Neukundengewinnung und Kaltakquise.' },
] as const

/** All available permission keys in the system */
export const ALL_PERMISSION_KEYS: Array<{ action: Action; subject: Subject }> = [
  { action: 'manage', subject: 'Rights' },
  { action: 'manage', subject: 'SystemConfig' },
  { action: 'manage', subject: 'KnowledgeBase' },
  { action: 'delegate', subject: 'CustomersAndTasks' },
  { action: 'editOthers', subject: 'CustomersAndTasks' },
  { action: 'viewOthers', subject: 'CustomersAndTasks' },
  { action: 'import', subject: 'Customer' },
  { action: 'edit', subject: 'Dashboard' },
  { action: 'create', subject: 'Appointment' },
  { action: 'send', subject: 'Email' },
  { action: 'call', subject: 'Customer' },
  { action: 'manage', subject: 'Contact' },
  { action: 'delete', subject: 'Customer' },
  { action: 'manage', subject: 'Task' },
  { action: 'delete', subject: 'Task' },
  { action: 'manage', subject: 'Questionnaire' },
]

function allPermissions(): PermissionEntry[] {
  return ALL_PERMISSION_KEYS.map((p) => ({ ...p, granted: true }))
}

function permissions(...keys: Array<[Action, Subject]>): PermissionEntry[] {
  return keys.map(([action, subject]) => ({ action, subject, granted: true }))
}

export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionEntry[]> = {
  admin: allPermissions(),

  geschaeftsfuehrer: allPermissions().filter(
    (p) =>
      !(p.action === 'manage' && p.subject === 'Rights') &&
      !(p.action === 'manage' && p.subject === 'SystemConfig'),
  ),

  abteilungsleiter: permissions(
    ['manage', 'KnowledgeBase'],
    ['delegate', 'CustomersAndTasks'],
    ['editOthers', 'CustomersAndTasks'],
    ['viewOthers', 'CustomersAndTasks'],
    ['import', 'Customer'],
    ['edit', 'Dashboard'],
    ['create', 'Appointment'],
    ['send', 'Email'],
    ['call', 'Customer'],
    ['manage', 'Contact'],
    ['delete', 'Customer'],
    ['manage', 'Task'],
    ['delete', 'Task'],
    ['manage', 'Questionnaire'],
  ),

  teamleiter: permissions(
    ['delegate', 'CustomersAndTasks'],
    ['editOthers', 'CustomersAndTasks'],
    ['viewOthers', 'CustomersAndTasks'],
    ['edit', 'Dashboard'],
    ['create', 'Appointment'],
    ['send', 'Email'],
    ['call', 'Customer'],
    ['manage', 'Contact'],
    ['delete', 'Customer'],
    ['manage', 'Task'],
    ['delete', 'Task'],
    ['manage', 'Questionnaire'],
  ),

  projektassistent: permissions(
    ['viewOthers', 'CustomersAndTasks'],
    ['edit', 'Dashboard'],
    ['create', 'Appointment'],
    ['send', 'Email'],
    ['manage', 'Contact'],
    ['manage', 'Task'],
  ),

  verkaeufer: permissions(
    ['create', 'Appointment'],
    ['send', 'Email'],
    ['call', 'Customer'],
    ['manage', 'Contact'],
    ['manage', 'Task'],
    ['manage', 'Questionnaire'],
  ),

  anrufer: permissions(['call', 'Customer'], ['manage', 'Contact'], ['manage', 'Questionnaire']),

  akquisitor: permissions(
    ['create', 'Appointment'],
    ['send', 'Email'],
    ['call', 'Customer'],
    ['manage', 'Contact'],
    ['manage', 'Questionnaire'],
  ),
}
