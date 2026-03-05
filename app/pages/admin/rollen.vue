<script setup lang="ts">
import { PERMISSIONS, ROLE_ICONS } from '~/utils/permissionGroups'

const toast = useToast()

const { data: roles, status, refresh } = await useFetch('/api/roles')

const selectedRoleId = ref<string | null>(null)
const saving = ref(false)
const editedPermissions = ref<Map<string, boolean>>(new Map())
const hasChanges = ref(false)

// --- Neue Rolle modal ---
const showNewRoleModal = ref(false)
const creatingRole = ref(false)
const newRole = ref({ name: '', description: '' })

// --- Rolle löschen ---
const showDeleteConfirm = ref(false)
const deleting = ref(false)

const canDeleteSelected = computed(() => {
  if (!selectedRole.value) return false
  return !(selectedRole.value as { isSystem?: boolean }).isSystem
})

async function deleteRole() {
  if (!selectedRoleId.value) return
  deleting.value = true
  try {
    await $fetch(`/api/roles/${selectedRoleId.value}`, { method: 'DELETE' })
    showDeleteConfirm.value = false
    selectedRoleId.value = null
    await refresh()
    if (roles.value?.length) {
      selectRole(roles.value[0].id)
    }
    toast.add({ title: 'Rolle gelöscht', color: 'success' })
  } catch (err: unknown) {
    const error = err as { data?: { message?: string } }
    toast.add({
      title: 'Fehler',
      description: error.data?.message || 'Rolle konnte nicht gelöscht werden.',
      color: 'error',
    })
  } finally {
    deleting.value = false
  }
}

async function createRole() {
  if (!newRole.value.name.trim()) return
  creatingRole.value = true
  try {
    const created = await $fetch<{ id: string }>('/api/roles', {
      method: 'POST',
      body: {
        name: newRole.value.name.trim(),
        description: newRole.value.description.trim(),
      },
    })
    await refresh()
    showNewRoleModal.value = false
    newRole.value = { name: '', description: '' }
    selectRole(created.id)
    toast.add({ title: 'Rolle erstellt', color: 'success' })
  } catch (err: unknown) {
    const error = err as { data?: { message?: string } }
    toast.add({
      title: 'Fehler',
      description: error.data?.message || 'Rolle konnte nicht erstellt werden.',
      color: 'error',
    })
  } finally {
    creatingRole.value = false
  }
}

// --- Role selection & permissions ---
watch(
  roles,
  (newRoles) => {
    if (newRoles?.length && !selectedRoleId.value) {
      selectRole(newRoles[0].id)
    }
  },
  { immediate: true },
)

const selectedRole = computed(() => {
  if (!selectedRoleId.value || !roles.value) return null
  return (roles.value as Array<{ id: string; name: string }>).find(
    (r) => r.id === selectedRoleId.value,
  )
})

function selectRole(id: string) {
  selectedRoleId.value = id
  loadPermissionsForRole(id)
}

function loadPermissionsForRole(roleId: string) {
  const role = (
    roles.value as Array<{
      id: string
      defaultPermissions?: Array<{ action: string; subject: string; granted: boolean }>
    }> | null
  )?.find((r) => r.id === roleId)
  if (!role) return

  const map = new Map<string, boolean>()
  for (const p of role.defaultPermissions || []) {
    map.set(`${p.action}:${p.subject}`, p.granted)
  }
  editedPermissions.value = map
  hasChanges.value = false
}

function hasPermission(key: string): boolean {
  return editedPermissions.value.get(key) ?? false
}

function togglePermission(key: string) {
  const current = editedPermissions.value.get(key) ?? false
  editedPermissions.value.set(key, !current)
  hasChanges.value = true
}

const allSelected = computed(() => PERMISSIONS.every((p) => hasPermission(p.key)))

function toggleAll() {
  const newVal = !allSelected.value
  for (const p of PERMISSIONS) {
    editedPermissions.value.set(p.key, newVal)
  }
  hasChanges.value = true
}

const grantedCount = computed(() => PERMISSIONS.filter((p) => hasPermission(p.key)).length)

async function savePermissions() {
  if (!selectedRoleId.value) return

  saving.value = true
  try {
    const permissions: Array<{ action: string; subject: string; granted: boolean }> = []
    for (const [key, granted] of editedPermissions.value) {
      const [action, subject] = key.split(':') as [string, string]
      permissions.push({ action, subject, granted })
    }

    await $fetch(`/api/roles/${selectedRoleId.value}`, {
      method: 'PUT',
      body: { permissions },
    })

    await refresh()
    hasChanges.value = false
    toast.add({ title: 'Berechtigungen gespeichert', color: 'success' })
  } catch {
    toast.add({ title: 'Fehler beim Speichern', color: 'error' })
  } finally {
    saving.value = false
  }
}

function resetPermissions() {
  if (selectedRoleId.value) {
    loadPermissionsForRole(selectedRoleId.value)
  }
}

function getRoleIcon(roleId: string): string {
  return ROLE_ICONS[roleId] || 'i-lucide-user'
}
</script>

<template>
  <div>
    <h1 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">
      Berechtigungsverwaltung für Rollen
    </h1>

    <!-- Loading -->
    <div v-if="status === 'pending'" class="text-gray-400 py-20 text-center">Laden...</div>

    <!-- Main two-panel layout -->
    <div
      v-else-if="roles"
      class="flex bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
      style="min-height: calc(100vh - 10rem)"
    >
      <!-- Left: Role selection sidebar -->
      <div class="w-72 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0">
        <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 class="text-sm font-semibold text-gray-600 dark:text-gray-300">Rollen auswählen</h3>
        </div>

        <div class="flex-1 overflow-y-auto py-1">
          <button
            v-for="role in roles"
            :key="role.id"
            class="w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors"
            :class="[
              selectedRoleId === role.id
                ? 'bg-[#720923]/10 text-[#720923] dark:text-[#e8a0b0] font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
            ]"
            @click="selectRole(role.id)"
          >
            <div
              class="size-8 rounded-full flex items-center justify-center shrink-0"
              :class="[
                selectedRoleId === role.id
                  ? 'bg-[#720923] text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
              ]"
            >
              <UIcon :name="getRoleIcon(role.id)" class="size-4" />
            </div>
            <span>{{ role.name }}</span>
          </button>
        </div>

        <div class="p-3 border-t border-gray-100 dark:border-gray-800">
          <UButton
            block
            variant="soft"
            color="warning"
            icon="i-lucide-plus"
            label="Neue Rolle"
            size="sm"
            @click="showNewRoleModal = true"
          />
        </div>
      </div>

      <!-- Right: Permissions panel -->
      <div class="flex-1 flex flex-col min-w-0">
        <template v-if="selectedRole">
          <!-- Header -->
          <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Berechtigungen für:
                    <span class="text-[#720923] dark:text-[#e8a0b0]">{{ selectedRole.name }}</span>
                  </h2>
                  <button
                    v-if="canDeleteSelected"
                    type="button"
                    class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                    title="Rolle löschen"
                    @click="showDeleteConfirm = true"
                  >
                    <UIcon name="i-lucide-trash-2" class="size-4" />
                  </button>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Konfigurieren Sie detailliert die Zugriffsrechte für diese Rolle.
                </p>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                <span class="text-sm text-gray-500 dark:text-gray-400">Alles auswählen</span>
                <button
                  type="button"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer"
                  :class="allSelected ? 'bg-[#720923]' : 'bg-gray-200 dark:bg-gray-700'"
                  @click="toggleAll"
                >
                  <span
                    class="inline-block size-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                    :class="allSelected ? 'translate-x-6' : 'translate-x-1'"
                  />
                </button>
              </div>
            </div>
          </div>

          <!-- Permission grid — 2 columns side by side -->
          <div class="flex-1 overflow-y-auto px-6 py-4">
            <div class="grid grid-cols-2 gap-x-8">
              <!-- Left column -->
              <div>
                <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                  Funktion / Modul
                </div>
                <div
                  v-for="perm in PERMISSIONS.slice(0, Math.ceil(PERMISSIONS.length / 2))"
                  :key="perm.key"
                  class="flex items-center justify-between gap-3 py-3 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors rounded-lg px-2"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <div
                      class="size-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0"
                    >
                      <UIcon
                        :name="perm.icon"
                        class="size-[18px] text-gray-500 dark:text-gray-400"
                      />
                    </div>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{{
                      perm.label
                    }}</span>
                  </div>
                  <button
                    type="button"
                    class="size-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer"
                    :class="[
                      hasPermission(perm.key)
                        ? 'bg-[#720923] border-[#720923] shadow-sm'
                        : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
                    ]"
                    @click="togglePermission(perm.key)"
                  >
                    <UIcon
                      v-if="hasPermission(perm.key)"
                      name="i-lucide-check"
                      class="size-3.5 text-white"
                    />
                  </button>
                </div>
              </div>

              <!-- Right column -->
              <div>
                <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                  Funktion / Modul
                </div>
                <div
                  v-for="perm in PERMISSIONS.slice(Math.ceil(PERMISSIONS.length / 2))"
                  :key="perm.key"
                  class="flex items-center justify-between gap-3 py-3 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors rounded-lg px-2"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <div
                      class="size-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0"
                    >
                      <UIcon
                        :name="perm.icon"
                        class="size-[18px] text-gray-500 dark:text-gray-400"
                      />
                    </div>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{{
                      perm.label
                    }}</span>
                  </div>
                  <button
                    type="button"
                    class="size-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer"
                    :class="[
                      hasPermission(perm.key)
                        ? 'bg-[#720923] border-[#720923] shadow-sm'
                        : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
                    ]"
                    @click="togglePermission(perm.key)"
                  >
                    <UIcon
                      v-if="hasPermission(perm.key)"
                      name="i-lucide-check"
                      class="size-3.5 text-white"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between"
          >
            <span class="text-xs text-gray-400">
              {{ grantedCount }} / {{ PERMISSIONS.length }} Berechtigungen aktiv
            </span>
            <div class="flex items-center gap-3">
              <UButton
                variant="outline"
                color="neutral"
                label="Abbrechen"
                :disabled="!hasChanges"
                @click="resetPermissions"
              />
              <UButton
                label="Änderungen speichern"
                class="bg-[#720923] hover:bg-[#5a071c] text-white"
                :loading="saving"
                :disabled="!hasChanges"
                @click="savePermissions"
              />
            </div>
          </div>
        </template>

        <!-- No role selected fallback -->
        <div v-else class="flex-1 flex items-center justify-center text-gray-400">
          <div class="text-center">
            <UIcon name="i-lucide-shield" class="size-12 mx-auto mb-3 text-gray-300" />
            <p>Wählen Sie eine Rolle aus, um Berechtigungen zu bearbeiten.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Rolle löschen Bestätigung -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showDeleteConfirm"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div class="absolute inset-0 bg-black/40" @click="showDeleteConfirm = false" />
          <div
            class="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-sm"
          >
            <div class="px-6 py-5">
              <div class="flex items-center gap-3 mb-3">
                <div
                  class="size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0"
                >
                  <UIcon
                    name="i-lucide-triangle-alert"
                    class="size-5 text-red-600 dark:text-red-400"
                  />
                </div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Rolle löschen?</h3>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Möchten Sie die Rolle
                <strong class="text-gray-700 dark:text-gray-200">{{ selectedRole?.name }}</strong>
                wirklich löschen? Alle zugehörigen Berechtigungen werden entfernt. Dieser Vorgang
                kann nicht rückgängig gemacht werden.
              </p>
            </div>
            <div
              class="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3"
            >
              <UButton
                variant="outline"
                color="neutral"
                label="Abbrechen"
                @click="showDeleteConfirm = false"
              />
              <UButton
                color="error"
                label="Rolle löschen"
                icon="i-lucide-trash-2"
                :loading="deleting"
                @click="deleteRole"
              />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Neue Rolle Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showNewRoleModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/40" @click="showNewRoleModal = false" />

          <!-- Dialog -->
          <div
            class="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md"
          >
            <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Neue Rolle erstellen
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Geben Sie einen Namen und eine Beschreibung für die neue Rolle ein.
              </p>
            </div>

            <form class="px-6 py-5 space-y-4" @submit.prevent="createRole">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Rollenname
                </label>
                <UInput
                  v-model="newRole.name"
                  placeholder="z.B. Praktikant"
                  icon="i-lucide-tag"
                  size="lg"
                  autofocus
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Beschreibung (optional)
                </label>
                <UInput
                  v-model="newRole.description"
                  placeholder="Kurze Beschreibung der Rolle..."
                  icon="i-lucide-align-left"
                  size="lg"
                />
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <UButton
                  variant="outline"
                  color="neutral"
                  label="Abbrechen"
                  @click="showNewRoleModal = false"
                />
                <UButton
                  type="submit"
                  label="Rolle erstellen"
                  class="bg-[#720923] hover:bg-[#5a071c] text-white"
                  :loading="creatingRole"
                  :disabled="!newRole.name.trim()"
                />
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
