<template>
  <div class="max-w-7xl mx-auto space-y-8">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard
        v-for="stat in stats"
        :key="stat.label"
        class="hover:border-[#720923]/30 transition-colors shadow-sm"
        :ui="{ body: 'p-6' }"
      >
        <div class="flex items-center">
          <div :class="['p-3 rounded-full mr-4', stat.bgColor]">
            <UIcon :name="stat.icon" :class="['w-6 h-6', stat.iconColor]" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stat.value }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <!-- New User Form -->
      <div class="xl:col-span-1">
        <UCard
          class="h-full shadow-md"
          :ui="{
            header: 'bg-gray-50/50 dark:bg-gray-800 px-6 py-5',
            body: 'p-6',
          }"
        >
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-bold text-[#720923] dark:text-white">
                Neuen Benutzer anlegen
              </h3>
              <UIcon
                name="i-heroicons-user-plus"
                class="w-5 h-5 text-[#720923] dark:text-white/80"
              />
            </div>
          </template>

          <form class="space-y-5" @submit.prevent="handleCreateUser">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >Vollständiger Name</label
              >
              <UInput
                v-model="newUser.name"
                icon="i-heroicons-user"
                placeholder="Max Mustermann"
                size="lg"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >E-Mail-Adresse</label
              >
              <UInput
                v-model="newUser.email"
                type="email"
                icon="i-heroicons-envelope"
                placeholder="max@unternehmen.de"
                size="lg"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >Rolle zuweisen</label
              >
              <USelectMenu
                v-model="newUser.role"
                :items="roleNames"
                placeholder="Rolle wählen..."
                leading-icon="i-heroicons-shield-check"
                size="lg"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >Abteilung (Optional)</label
              >
              <UInput
                v-model="newUser.department"
                icon="i-heroicons-building-office-2"
                placeholder="z.B. Vertrieb"
                size="lg"
              />
            </div>

            <div class="pt-4">
              <UButton
                type="submit"
                block
                size="lg"
                class="font-medium shadow-md hover:shadow-lg transition-all transform active:scale-95 bg-[#720923] hover:bg-[#5a071c]"
                color="error"
                :loading="isSubmitting"
              >
                Benutzer erstellen
              </UButton>
            </div>
          </form>
        </UCard>
      </div>

      <!-- Users Table -->
      <div class="xl:col-span-2">
        <UCard
          class="shadow-md flex flex-col h-full"
          :ui="{
            header: 'bg-gray-50/50 dark:bg-gray-800 px-6 py-5',
            body: 'p-0',
            footer: 'bg-gray-50/50 dark:bg-gray-900/20 px-6 py-4',
          }"
        >
          <template #header>
            <div
              class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div>
                <h3 class="text-lg font-bold text-[#720923] dark:text-white">Aktuelle Benutzer</h3>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Verwalten Sie hier alle registrierten Benutzer und deren Rollen.
                </p>
              </div>
              <div class="flex gap-2">
                <UButton
                  icon="i-heroicons-funnel"
                  color="neutral"
                  variant="outline"
                  label="Filter"
                />
                <UButton
                  icon="i-heroicons-arrow-down-tray"
                  color="neutral"
                  variant="outline"
                  label="Export"
                />
              </div>
            </div>
          </template>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-[#720923]/5 dark:bg-gray-800">
                <tr>
                  <th
                    v-for="column in columns"
                    :key="column.key"
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-semibold text-[#720923] dark:text-[#9e1e3e] uppercase tracking-wider"
                  >
                    {{ column.label }}
                  </th>
                  <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody
                class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700"
              >
                <tr
                  v-for="user in paginatedUsers"
                  :key="user.email"
                  class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                >
                  <!-- User Info -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div
                        class="h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
                        :style="{ backgroundColor: getRoleColor(user.role).bg }"
                      >
                        {{ user.initials }}
                      </div>
                      <div class="ml-4">
                        <div
                          class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#720923] dark:group-hover:text-white transition-colors"
                        >
                          {{ user.name }}
                        </div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">
                          {{ user.email }}
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Role -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                      :style="{
                        backgroundColor: getRoleColor(user.role).light,
                        color: getRoleColor(user.role).text,
                        borderColor: getRoleColor(user.role).border,
                      }"
                    >
                      {{ user.role }}
                    </span>
                  </td>

                  <!-- Status -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                      :style="{
                        backgroundColor: getStatusColor(user.status).light,
                        color: getStatusColor(user.status).text,
                        borderColor: getStatusColor(user.status).border,
                      }"
                    >
                      {{ user.status }}
                    </span>
                  </td>

                  <!-- Last Active -->
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {{ user.lastActive }}
                  </td>

                  <!-- Actions -->
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      class="text-[#720923] hover:text-[#5a071c] font-semibold transition-colors"
                      @click="editUser(user)"
                    >
                      Bearbeiten
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <template #footer>
            <div class="flex items-center justify-between">
              <div class="flex-1 flex justify-between sm:hidden">
                <UButton color="neutral" variant="outline" label="Zurück" />
                <UButton color="neutral" variant="outline" label="Weiter" class="ml-3" />
              </div>

              <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Zeige <span class="font-medium">{{ (currentPage - 1) * 6 + 1 }}</span> bis
                    <span class="font-medium">{{ Math.min(currentPage * 6, users.length) }}</span>
                    von <span class="font-medium">{{ users.length }}</span> Ergebnissen
                  </p>
                </div>

                <div>
                  <UPagination v-model="currentPage" :total="users.length" :page-count="6" />
                </div>
              </div>
            </div>
          </template>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const { data: usersData, refresh: refreshUsers } = await useFetch('/api/users')

const rolesRaw = ref<Array<{ id: string; name: string }>>([])

const roleNames = computed(() => rolesRaw.value.map((r) => r.name))

const getRoleIdByName = (name: string) => {
  const role = rolesRaw.value.find((r) => r.name === name)
  return role?.id || ''
}

onMounted(async () => {
  try {
    const data = await $fetch<Array<{ id: string; name: string }>>('/api/roles')
    rolesRaw.value = data || []
  } catch (e) {
    console.error('Failed to fetch roles:', e)
  }
})

// Distinct color palette per role
const ROLE_COLORS: Record<string, { bg: string; light: string; text: string; border: string }> = {
  Superadmin: { bg: '#7c3aed', light: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
  Admin: { bg: '#dc2626', light: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
  Geschäftsführer: { bg: '#be123c', light: '#fff1f2', text: '#9f1239', border: '#fecdd3' },
  Abteilungsleiter: { bg: '#0d9488', light: '#f0fdfa', text: '#0f766e', border: '#99f6e4' },
  Teamleiter: { bg: '#0891b2', light: '#ecfeff', text: '#0e7490', border: '#a5f3fc' },
  Projektassistent: { bg: '#6b7280', light: '#f9fafb', text: '#4b5563', border: '#d1d5db' },
  Verkäufer: { bg: '#2563eb', light: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  Anrufer: { bg: '#d97706', light: '#fffbeb', text: '#b45309', border: '#fde68a' },
  Akquisiteur: { bg: '#854d0e', light: '#fefce8', text: '#713f12', border: '#fef08a' },
}

const DEFAULT_ROLE_COLOR = { bg: '#6b7280', light: '#f3f4f6', text: '#374151', border: '#d1d5db' }

const getRoleColor = (role: string) => ROLE_COLORS[role] || DEFAULT_ROLE_COLOR

const STATUS_COLORS: Record<string, { light: string; text: string; border: string }> = {
  Aktiv: { light: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  Inaktiv: { light: '#f9fafb', text: '#6b7280', border: '#d1d5db' },
  Abwesend: { light: '#fffbeb', text: '#b45309', border: '#fde68a' },
}

const DEFAULT_STATUS_COLOR = { light: '#f3f4f6', text: '#374151', border: '#d1d5db' }

const getStatusColor = (status: string) => STATUS_COLORS[status] || DEFAULT_STATUS_COLOR

const users = computed(() => {
  if (!usersData.value) return []
  return (
    usersData.value as Array<{
      id: string
      name?: string
      email: string
      roleName?: string
      roleId: string
      isActive: boolean
      createdAt?: string
    }>
  ).map((user) => ({
    id: user.id,
    name: user.name || 'Unbekannt',
    email: user.email,
    initials: user.name
      ? user.name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      : '?',
    role: user.roleName || 'Keine Rolle',
    roleId: user.roleId,
    status: user.isActive ? 'Aktiv' : 'Inaktiv',
    lastActive: user.createdAt ? new Date(user.createdAt).toLocaleDateString('de-DE') : 'Unbekannt',
  }))
})

const stats = computed(() => {
  const total = users.value.length
  const admins = users.value.filter(
    (u: { role: string }) => u.role === 'Admin' || u.role === 'Supadmin',
  ).length
  const active = users.value.filter((u: { status: string }) => u.status === 'Aktiv').length
  const pending = total - active

  return [
    {
      label: 'Gesamtbenutzer',
      value: total.toString(),
      icon: 'i-heroicons-user-group',
      bgColor: 'bg-[#720923]/10',
      iconColor: 'text-[#720923]',
    },
    {
      label: 'Administratoren',
      value: admins.toString(),
      icon: 'i-heroicons-shield-check',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-800 dark:text-blue-400',
    },
    {
      label: 'Aktive Lizenzen',
      value: active.toString(),
      icon: 'i-heroicons-check-badge',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-800 dark:text-green-400',
    },
    {
      label: 'Ausstehend',
      value: pending.toString(),
      icon: 'i-heroicons-clock',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-800 dark:text-yellow-400',
    },
  ]
})

const newUser = ref({
  name: '',
  email: '',
  role: '',
  department: '',
})

const currentPage = ref(1)

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * 6
  const end = start + 6
  return users.value.slice(start, end)
})

const columns = [
  { key: 'benutzer', label: 'BENUTZER' },
  { key: 'rolle', label: 'ROLLE' },
  { key: 'status', label: 'STATUS' },
  { key: 'zuletzt_aktiv', label: 'ZULETZT AKTIV' },
]

const isSubmitting = ref(false)
const toast = useToast()

const handleCreateUser = async () => {
  try {
    isSubmitting.value = true
    await $fetch('/api/users', {
      method: 'POST',
      body: {
        name: newUser.value.name,
        email: newUser.value.email,
        roleId: getRoleIdByName(newUser.value.role),
      },
    })

    toast.add({
      title: 'Erfolg',
      description: 'Benutzer wurde erfolgreich erstellt.',
      color: 'success',
    })

    newUser.value = { name: '', email: '', role: '', department: '' }
    await refreshUsers()
  } catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    toast.add({
      title: 'Fehler',
      description: err.data?.message || 'Fehler beim Erstellen des Benutzers.',
      color: 'error',
    })
  } finally {
    isSubmitting.value = false
  }
}

const editUser = (_user: unknown) => {
  // add editing there
}
</script>
