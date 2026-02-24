export const ACTIONS = [
  'create', 'read', 'update', 'delete',
  'export', 'import', 'assign', 'approve',
  'call', 'view', 'manage',
] as const

export const SUBJECTS = [
  'Lead', 'Contact', 'Deal', 'Invoice',
  'Ticket', 'Task', 'CalendarEvent', 'Campaign',
  'CallLog', 'EmailThread', 'Report', 'Dashboard',
  'AdminPanel', 'User', 'Role', 'Setting', 'Teams',
] as const

export type Action = typeof ACTIONS[number]
export type Subject = typeof SUBJECTS[number]

export interface PermissionEntry {
  action: Action
  subject: Subject
  granted: boolean
}

export const ROLES_META = [
  { id: 'superadmin', name: 'Superadmin', description: 'Vollzugriff auf das gesamte System. Verwaltet Mandanten, globale Einstellungen, Benutzerverwaltung, Audit-Logs.' },
  { id: 'admin', name: 'Admin', description: 'Organisationsweiter Administrator. Verwaltet Benutzer, Rollen, CRM-Einstellungen, Integrationen.' },
  { id: 'geschaeftsfuehrer', name: 'Geschäftsführer', description: 'Geschäftsleitung. Sieht alle Berichte, genehmigt Deals, überblickt alle Abteilungen und Teams.' },
  { id: 'abteilungsleiter', name: 'Abteilungsleiter', description: 'Leitet eine Abteilung. Sieht Leistungsdashboards, kann Leads/Deals neu zuweisen und genehmigen.' },
  { id: 'teamleiter', name: 'Teamleiter', description: 'Leitet ein Team. Sieht Team-Performance, genehmigt Deals, weist Leads neu zu.' },
  { id: 'projektassistent', name: 'Projektassistent', description: 'Unterstützt Projekte und Teams. Verwaltet Aufgaben, Kalender, Tickets.' },
  { id: 'verkaeufer', name: 'Verkäufer', description: 'Bearbeitet Leads, Kontakte, Deals und Rechnungen. Nur eigene Datensätze.' },
  { id: 'anrufer', name: 'Anrufer', description: 'Tätigt/empfängt Anrufe über Teams-Integration. Sieht Anrufprotokolle und Kontaktkarten.' },
  { id: 'akquisiteur', name: 'Akquisiteur', description: 'Neukundengewinnung und Kaltakquise. Erstellt und qualifiziert Leads, verwaltet Kampagnen.' },
] as const

function allPermissions(): PermissionEntry[] {
  return SUBJECTS.flatMap(subject =>
    ACTIONS.map(action => ({ action, subject, granted: true })),
  )
}

function permissions(...entries: Array<[Action, Subject]>): PermissionEntry[] {
  return entries.map(([action, subject]) => ({ action, subject, granted: true }))
}

export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionEntry[]> = {
  superadmin: allPermissions(),

  admin: allPermissions().filter(p =>
    !(p.subject === 'Setting' && p.action === 'manage'),
  ),

  geschaeftsfuehrer: permissions(
    ['read', 'Lead'], ['read', 'Contact'], ['read', 'Deal'], ['approve', 'Deal'],
    ['read', 'Invoice'], ['read', 'Ticket'], ['read', 'Task'], ['read', 'CalendarEvent'],
    ['read', 'Campaign'], ['read', 'CallLog'], ['read', 'EmailThread'],
    ['read', 'Report'], ['view', 'Report'], ['read', 'Dashboard'], ['view', 'Dashboard'],
    ['export', 'Report'],
  ),

  abteilungsleiter: permissions(
    ['read', 'Lead'], ['update', 'Lead'], ['assign', 'Lead'],
    ['read', 'Contact'], ['update', 'Contact'],
    ['read', 'Deal'], ['update', 'Deal'], ['approve', 'Deal'],
    ['read', 'Invoice'],
    ['read', 'Ticket'], ['assign', 'Ticket'],
    ['read', 'Task'], ['assign', 'Task'],
    ['read', 'CalendarEvent'],
    ['read', 'Report'], ['view', 'Report'], ['read', 'Dashboard'], ['view', 'Dashboard'],
  ),

  teamleiter: permissions(
    ['read', 'Lead'], ['update', 'Lead'], ['assign', 'Lead'],
    ['read', 'Contact'], ['update', 'Contact'],
    ['read', 'Deal'], ['update', 'Deal'], ['approve', 'Deal'],
    ['read', 'Invoice'],
    ['read', 'Ticket'], ['assign', 'Ticket'],
    ['read', 'Task'], ['create', 'Task'], ['update', 'Task'], ['assign', 'Task'],
    ['read', 'CalendarEvent'], ['create', 'CalendarEvent'],
    ['read', 'Report'], ['view', 'Dashboard'],
  ),

  projektassistent: permissions(
    ['read', 'Lead'],
    ['read', 'Contact'],
    ['read', 'Deal'],
    ['read', 'Ticket'], ['create', 'Ticket'], ['update', 'Ticket'],
    ['read', 'Task'], ['create', 'Task'], ['update', 'Task'], ['assign', 'Task'],
    ['read', 'CalendarEvent'], ['create', 'CalendarEvent'], ['update', 'CalendarEvent'],
    ['view', 'Dashboard'],
  ),

  verkaeufer: permissions(
    ['create', 'Lead'], ['read', 'Lead'], ['update', 'Lead'], ['delete', 'Lead'],
    ['create', 'Contact'], ['read', 'Contact'], ['update', 'Contact'], ['delete', 'Contact'],
    ['create', 'Deal'], ['read', 'Deal'], ['update', 'Deal'], ['delete', 'Deal'],
    ['create', 'Invoice'], ['read', 'Invoice'], ['update', 'Invoice'],
    ['read', 'Task'], ['create', 'Task'], ['update', 'Task'],
    ['read', 'CalendarEvent'], ['create', 'CalendarEvent'],
    ['view', 'Dashboard'],
  ),

  anrufer: permissions(
    ['read', 'Contact'],
    ['call', 'Teams'],
    ['read', 'CallLog'], ['create', 'CallLog'],
    ['view', 'Dashboard'],
  ),

  akquisiteur: permissions(
    ['create', 'Lead'], ['read', 'Lead'], ['update', 'Lead'],
    ['read', 'Contact'],
    ['read', 'Campaign'], ['create', 'Campaign'], ['update', 'Campaign'],
    ['view', 'Dashboard'],
  ),
}
