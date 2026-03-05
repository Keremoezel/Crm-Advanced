export interface Permission {
  key: string
  action: string
  subject: string
  label: string
  icon: string
}

export const PERMISSIONS: Permission[] = [
  {
    key: 'manage:Rights',
    action: 'manage',
    subject: 'Rights',
    label: 'Rechte vergeben',
    icon: 'i-lucide-shield-check',
  },
  {
    key: 'manage:SystemConfig',
    action: 'manage',
    subject: 'SystemConfig',
    label: 'Systemkonfigurationen',
    icon: 'i-lucide-settings',
  },
  {
    key: 'manage:KnowledgeBase',
    action: 'manage',
    subject: 'KnowledgeBase',
    label: 'Wissensdatenbank erweitern',
    icon: 'i-lucide-book-open',
  },
  {
    key: 'delegate:CustomersAndTasks',
    action: 'delegate',
    subject: 'CustomersAndTasks',
    label: 'Kunden & Aufgaben delegieren',
    icon: 'i-lucide-send',
  },
  {
    key: 'editOthers:CustomersAndTasks',
    action: 'editOthers',
    subject: 'CustomersAndTasks',
    label: 'Kunden & Aufgaben von anderen bearbeiten',
    icon: 'i-lucide-pencil',
  },
  {
    key: 'viewOthers:CustomersAndTasks',
    action: 'viewOthers',
    subject: 'CustomersAndTasks',
    label: 'Kunden & Aufgaben von anderen einsehen',
    icon: 'i-lucide-eye',
  },
  {
    key: 'import:Customer',
    action: 'import',
    subject: 'Customer',
    label: 'Kunden importieren',
    icon: 'i-lucide-upload',
  },
  {
    key: 'edit:Dashboard',
    action: 'edit',
    subject: 'Dashboard',
    label: 'Dashboard bearbeiten',
    icon: 'i-lucide-layout-dashboard',
  },
  {
    key: 'create:Appointment',
    action: 'create',
    subject: 'Appointment',
    label: 'Termine legen',
    icon: 'i-lucide-calendar-plus',
  },
  {
    key: 'send:Email',
    action: 'send',
    subject: 'Email',
    label: 'Mails versenden',
    icon: 'i-lucide-mail',
  },
  {
    key: 'call:Customer',
    action: 'call',
    subject: 'Customer',
    label: 'Kunden anrufen',
    icon: 'i-lucide-phone-call',
  },
  {
    key: 'manage:Contact',
    action: 'manage',
    subject: 'Contact',
    label: 'Kontakte erstellen & bearbeiten',
    icon: 'i-lucide-user-plus',
  },
  {
    key: 'delete:Customer',
    action: 'delete',
    subject: 'Customer',
    label: 'Kunden löschen',
    icon: 'i-lucide-user-x',
  },
  {
    key: 'manage:Task',
    action: 'manage',
    subject: 'Task',
    label: 'Aufgaben erstellen & bearbeiten',
    icon: 'i-lucide-list-checks',
  },
  {
    key: 'delete:Task',
    action: 'delete',
    subject: 'Task',
    label: 'Aufgaben löschen',
    icon: 'i-lucide-list-x',
  },
]

/** Map from role ID to lucide icon name */
export const ROLE_ICONS: Record<string, string> = {
  admin: 'i-lucide-shield',
  geschaeftsfuehrer: 'i-lucide-briefcase',
  projektassistent: 'i-lucide-clipboard-list',
  teamleiter: 'i-lucide-users',
  abteilungsleiter: 'i-lucide-user-check',
  verkaeufer: 'i-lucide-wallet',
  anrufer: 'i-lucide-phone',
  akquisitor: 'i-lucide-target',
}
