<script setup lang="ts">
import { PERMISSION_GROUPS } from '~/utils/permissionGroups'

const toast = useToast()

const { data: roles, status, refresh } = await useFetch('/api/roles')

const selectedRoleId = ref<string | null>(null)
const saving = ref(false)

// Local editable copy of permissions for the selected role
const editedPermissions = ref<Map<string, boolean>>(new Map())
const hasChanges = ref(false)

const selectedRole = computed(() => {
  if (!selectedRoleId.value || !roles.value) return null
  return roles.value.find((r: any) => r.id === selectedRoleId.value)
})

function selectRole(id: string) {
  if (selectedRoleId.value === id) {
    selectedRoleId.value = null
    return
  }
  selectedRoleId.value = id
  loadPermissionsForRole(id)
}

function loadPermissionsForRole(roleId: string) {
  const role = roles.value?.find((r: any) => r.id === roleId)
  if (!role) return

  const map = new Map<string, boolean>()
  for (const p of role.defaultPermissions || []) {
    map.set(`${p.action}:${p.subject}`, p.granted)
  }
  editedPermissions.value = map
  hasChanges.value = false
}

function hasPermission(action: string, subject: string): boolean {
  return editedPermissions.value.get(`${action}:${subject}`) ?? false
}

function togglePermission(action: string, subject: string) {
  const key = `${action}:${subject}`
  const current = editedPermissions.value.get(key) ?? false
  editedPermissions.value.set(key, !current)
  hasChanges.value = true
}

function countGranted(group: typeof PERMISSION_GROUPS[number]): number {
  let count = 0
  for (const item of group.items) {
    for (const action of item.actions) {
      if (hasPermission(action.key, item.subject)) count++
    }
  }
  return count
}

function countTotal(group: typeof PERMISSION_GROUPS[number]): number {
  return group.items.reduce((sum, item) => sum + item.actions.length, 0)
}

async function savePermissions() {
  if (!selectedRoleId.value) return

  saving.value = true
  try {
    const permissions: Array<{ action: string, subject: string, granted: boolean }> = []
    for (const [key, granted] of editedPermissions.value) {
      const [action, subject] = key.split(':') as [string, string]
      permissions.push({ action, subject, granted })
    }

    await $fetch(`/api/roles/${selectedRoleId.value}`, {
      method: 'PUT' as any,
      body: { permissions },
    })

    await refresh()
    hasChanges.value = false
    toast.add({ title: 'Berechtigungen gespeichert', color: 'success' })
  }
  catch {
    toast.add({ title: 'Fehler beim Speichern', color: 'error' })
  }
  finally {
    saving.value = false
  }
}

function resetPermissions() {
  if (selectedRoleId.value) {
    loadPermissionsForRole(selectedRoleId.value)
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-900 mb-1">
      Rollen & Rechte
    </h1>
    <p class="text-slate-500 mb-6">
      Systemrollen verwalten und Berechtigungen anpassen.
    </p>

    <div v-if="status === 'pending'" class="text-slate-400">
      Laden...
    </div>

    <div v-else-if="roles" class="space-y-3">
      <div
        v-for="role in roles"
        :key="role.id"
        class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden"
      >
        <!-- Role header -->
        <button
          class="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
          @click="selectRole(role.id)"
        >
          <div>
            <h3 class="text-sm font-semibold text-slate-900">
              {{ role.name }}
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ role.description }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <UBadge v-if="role.isSystem" color="neutral" variant="subtle" size="xs">
              System
            </UBadge>
            <UIcon
              name="i-lucide-chevron-down"
              class="size-4 text-slate-400 transition-transform duration-200"
              :class="selectedRoleId === role.id ? 'rotate-180' : ''"
            />
          </div>
        </button>

        <!-- Permissions (expanded, editable) -->
        <div v-if="selectedRoleId === role.id && selectedRole" class="border-t border-slate-100">
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-slate-100">
            <div
              v-for="group in PERMISSION_GROUPS"
              :key="group.label"
              class="bg-white p-4"
            >
              <!-- Group header -->
              <div class="flex items-center gap-2 mb-3">
                <UIcon :name="group.icon" class="size-4 text-wine-700" />
                <h4 class="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  {{ group.label }}
                </h4>
                <span class="ml-auto text-[10px] text-slate-400">
                  {{ countGranted(group) }}/{{ countTotal(group) }}
                </span>
              </div>

              <!-- Module rows -->
              <div class="space-y-2.5">
                <div v-for="item in group.items" :key="item.subject">
                  <p class="text-xs font-medium text-slate-700 mb-1">
                    {{ item.label }}
                  </p>
                  <div class="flex flex-wrap gap-1.5">
                    <button
                      v-for="action in item.actions"
                      :key="action.key"
                      type="button"
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer"
                      :class="
                        hasPermission(action.key, item.subject)
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                      "
                      @click="togglePermission(action.key, item.subject)"
                    >
                      <UIcon
                        :name="hasPermission(action.key, item.subject) ? 'i-lucide-check' : 'i-lucide-x'"
                        class="size-3"
                      />
                      {{ action.label }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Save / Reset bar -->
          <div
            v-if="hasChanges"
            class="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-200"
          >
            <UButton
              variant="ghost"
              color="neutral"
              size="sm"
              label="Verwerfen"
              @click="resetPermissions"
            />
            <UButton
              color="primary"
              size="sm"
              label="Speichern"
              :loading="saving"
              @click="savePermissions"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
