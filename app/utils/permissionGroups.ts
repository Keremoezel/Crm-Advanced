export interface PermissionItem {
  subject: string
  label: string
  actions: Array<{ key: string, label: string }>
}

export interface PermissionGroup {
  label: string
  icon: string
  items: PermissionItem[]
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    label: 'Vertrieb',
    icon: 'i-lucide-briefcase',
    items: [
      {
        subject: 'Lead',
        label: 'Leads',
        actions: [
          { key: 'create', label: 'Erstellen' },
          { key: 'read', label: 'Ansehen' },
          { key: 'update', label: 'Bearbeiten' },
          { key: 'delete', label: 'Löschen' },
          { key: 'assign', label: 'Zuweisen' },
          { key: 'export', label: 'Exportieren' },
        ],
      },
      {
        subject: 'Contact',
        label: 'Kontakte',
        actions: [
          { key: 'create', label: 'Erstellen' },
          { key: 'read', label: 'Ansehen' },
          { key: 'update', label: 'Bearbeiten' },
          { key: 'delete', label: 'Löschen' },
          { key: 'export', label: 'Exportieren' },
        ],
      },
      {
        subject: 'Deal',
        label: 'Deals',
        actions: [
          { key: 'create', label: 'Erstellen' },
          { key: 'read', label: 'Ansehen' },
          { key: 'update', label: 'Bearbeiten' },
          { key: 'delete', label: 'Löschen' },
          { key: 'approve', label: 'Genehmigen' },
        ],
      },
      {
        subject: 'Invoice',
        label: 'Rechnungen',
        actions: [
          { key: 'create', label: 'Erstellen' },
          { key: 'read', label: 'Ansehen' },
          { key: 'update', label: 'Bearbeiten' },
          { key: 'delete', label: 'Löschen' },
          { key: 'export', label: 'Exportieren' },
        ],
      },
    ],
  },
  {
    label: 'Support & Aufgaben',
    icon: 'i-lucide-life-buoy',
    items: [
      {
        subject: 'Ticket',
        label: 'Tickets',
        actions: [
          { key: 'create', label: 'Erstellen' },
          { key: 'read', label: 'Ansehen' },
          { key: 'update', label: 'Bearbeiten' },
          { key: 'assign', label: 'Zuweisen' },
        ],
      },
      {
        subject: 'Task',
        label: 'Aufgaben',
        actions: [
          { key: 'create', label: 'Erstellen' },
          { key: 'read', label: 'Ansehen' },
          { key: 'update', label: 'Bearbeiten' },
          { key: 'assign', label: 'Zuweisen' },
        ],
      },
      {
        subject: 'CalendarEvent',
        label: 'Kalender',
        actions: [
          { key: 'create', label: 'Erstellen' },
          { key: 'read', label: 'Ansehen' },
          { key: 'update', label: 'Bearbeiten' },
        ],
      },
    ],
  },
  {
    label: 'Kommunikation',
    icon: 'i-lucide-phone',
    items: [
      {
        subject: 'Teams',
        label: 'Telefonie / Teams',
        actions: [
          { key: 'call', label: 'Anrufen' },
        ],
      },
      {
        subject: 'CallLog',
        label: 'Anrufprotokoll',
        actions: [
          { key: 'create', label: 'Erstellen' },
          { key: 'read', label: 'Ansehen' },
        ],
      },
      {
        subject: 'EmailThread',
        label: 'E-Mail',
        actions: [
          { key: 'read', label: 'Ansehen' },
        ],
      },
      {
        subject: 'Campaign',
        label: 'Kampagnen',
        actions: [
          { key: 'create', label: 'Erstellen' },
          { key: 'read', label: 'Ansehen' },
          { key: 'update', label: 'Bearbeiten' },
        ],
      },
    ],
  },
  {
    label: 'Auswertungen',
    icon: 'i-lucide-bar-chart-3',
    items: [
      {
        subject: 'Report',
        label: 'Berichte',
        actions: [
          { key: 'read', label: 'Ansehen' },
          { key: 'view', label: 'Anzeigen' },
          { key: 'export', label: 'Exportieren' },
        ],
      },
      {
        subject: 'Dashboard',
        label: 'Dashboard',
        actions: [
          { key: 'read', label: 'Ansehen' },
          { key: 'view', label: 'Anzeigen' },
        ],
      },
    ],
  },
  {
    label: 'Verwaltung',
    icon: 'i-lucide-shield',
    items: [
      {
        subject: 'AdminPanel',
        label: 'Admin-Bereich',
        actions: [
          { key: 'view', label: 'Zugriff' },
        ],
      },
      {
        subject: 'User',
        label: 'Benutzer',
        actions: [
          { key: 'create', label: 'Erstellen' },
          { key: 'read', label: 'Ansehen' },
          { key: 'update', label: 'Bearbeiten' },
          { key: 'delete', label: 'Löschen' },
        ],
      },
      {
        subject: 'Role',
        label: 'Rollen',
        actions: [
          { key: 'read', label: 'Ansehen' },
          { key: 'manage', label: 'Verwalten' },
        ],
      },
      {
        subject: 'Setting',
        label: 'Einstellungen',
        actions: [
          { key: 'read', label: 'Ansehen' },
          { key: 'manage', label: 'Verwalten' },
        ],
      },
    ],
  },
]
