<script setup lang="ts">
import { PERMISSION_GROUPS } from '~/utils/permissionGroups'

interface Permission {
  action: string
  subject: string
  granted: boolean
}

interface UserForm {
  name: string
  email: string
  roleId: string
  permissions: Permission[]
}

const { data: users, refresh: refreshUsers } = await useFetch<any[]>('/api/users')
const { data: roles } = await useFetch<any[]>('/api/roles')
const { data: matrix } = await useFetch<any>('/api/permissions/matrix')

const showModal = ref(false)
const editingUserId = ref<string | null>(null)
const saving = ref(false)
const deleteConfirmId = ref<string | null>(null)

const form = ref<UserForm>({
  name: '',
  email: '',
  roleId: '',
  permissions: [],
})

const roleOptions = computed(() => {
  if (!roles.value) return []
  return roles.value.map((r: any) => ({ label: r.name, value: r.id }))
})

function buildPermissionMatrix(roleId: string, overrides: Permission[] = []): Permission[] {
  if (!matrix.value) return []
  const defaults: Permission[] = matrix.value.roleDefaults[roleId] || []
  return matrix.value.subjects.flatMap((subject: string) =>
    matrix.value.actions.map((action: string) => {
      const override = overrides.find(o => o.action === action && o.subject === subject)
      if (override) return { action, subject, granted: override.granted }
      const def = defaults.find(d => d.action === action && d.subject === subject)
      return { action, subject, granted: def?.granted ?? false }
    }),
  )
}

function isGranted(subject: string, action: string): boolean {
  return form.value.permissions.some(p => p.action === action && p.subject === subject && p.granted)
}

function togglePermission(subject: string, action: string) {
  const perm = form.value.permissions.find(p => p.action === action && p.subject === subject)
  if (perm) perm.granted = !perm.granted
}

watch(() => form.value.roleId, (newRoleId) => {
  if (newRoleId && !editingUserId.value) {
    form.value.permissions = buildPermissionMatrix(newRoleId)
  }
})

function openCreate() {
  editingUserId.value = null
  form.value = { name: '', email: '', roleId: '', permissions: [] }
  showModal.value = true
}

async function openEdit(userId: string) {
  editingUserId.value = userId
  const { data } = await useFetch<any>(`/api/users/${userId}`)
  if (data.value) {
    form.value = {
      name: data.value.name,
      email: data.value.email,
      roleId: data.value.roleId,
      permissions: buildPermissionMatrix(data.value.roleId, data.value.permissions),
    }
  }
  showModal.value = true
}

async function save() {
  saving.value = true
  try {
    const payload = {
      name: form.value.name,
      email: form.value.email,
      roleId: form.value.roleId,
      permissions: form.value.permissions,
    }

    if (editingUserId.value) {
      await $fetch(`/api/users/${editingUserId.value}`, { method: 'PUT', body: payload })
    }
    else {
      await $fetch('/api/users', { method: 'POST', body: payload })
    }

    showModal.value = false
    await refreshUsers()
  }
  catch (err: any) {
    console.error('Save failed:', err)
  }
  finally {
    saving.value = false
  }
}

async function deleteUser(id: string) {
  await $fetch(`/api/users/${id}`, { method: 'DELETE' })
  deleteConfirmId.value = null
  await refreshUsers()
}

async function toggleActive(user: any) {
  await $fetch(`/api/users/${user.id}`, {
    method: 'PUT',
    body: { isActive: !user.isActive },
  })
  await refreshUsers()
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 mb-1">
          Benutzer
        </h1>
        <p class="text-slate-500">
          Benutzer verwalten, Rollen zuweisen und Berechtigungen anpassen.
        </p>
      </div>
      <UButton
        icon="i-lucide-plus"
        label="Neuer Benutzer"
        @click="openCreate"
      />
    </div>

    <!-- Users table -->
    <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="text-left px-4 py-3 font-medium text-slate-600">Name</th>
            <th class="text-left px-4 py-3 font-medium text-slate-600">E-Mail</th>
            <th class="text-left px-4 py-3 font-medium text-slate-600">Rolle</th>
            <th class="text-left px-4 py-3 font-medium text-slate-600">Status</th>
            <th class="text-right px-4 py-3 font-medium text-slate-600">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!users?.length">
            <td colspan="5" class="px-4 py-8 text-center text-slate-400">
              Keine Benutzer vorhanden. Erstellen Sie den ersten Benutzer.
            </td>
          </tr>
          <tr
            v-for="user in users"
            :key="user.id"
            class="border-b border-slate-100 hover:bg-slate-50"
          >
            <td class="px-4 py-3 font-medium text-slate-900">{{ user.name }}</td>
            <td class="px-4 py-3 text-slate-600">{{ user.email }}</td>
            <td class="px-4 py-3">
              <UBadge color="primary" variant="subtle" size="xs">
                {{ user.roleName }}
              </UBadge>
            </td>
            <td class="px-4 py-3">
              <button
                class="inline-flex items-center gap-1.5 text-xs font-medium"
                :class="user.isActive ? 'text-green-600' : 'text-slate-400'"
                @click="toggleActive(user)"
              >
                <span
                  class="size-2 rounded-full"
                  :class="user.isActive ? 'bg-green-500' : 'bg-slate-300'"
                />
                {{ user.isActive ? 'Aktiv' : 'Inaktiv' }}
              </button>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-1">
                <UButton
                  icon="i-lucide-pencil"
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  @click="openEdit(user.id)"
                />
                <UButton
                  v-if="deleteConfirmId !== user.id"
                  icon="i-lucide-trash-2"
                  variant="ghost"
                  color="error"
                  size="xs"
                  @click="deleteConfirmId = user.id"
                />
                <div v-else class="flex items-center gap-1">
                  <UButton
                    label="Ja"
                    variant="solid"
                    color="error"
                    size="xs"
                    @click="deleteUser(user.id)"
                  />
                  <UButton
                    label="Nein"
                    variant="ghost"
                    color="neutral"
                    size="xs"
                    @click="deleteConfirmId = null"
                  />
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create / Edit Modal -->
    <UModal v-model:open="showModal">
      <template #content>
        <div class="p-6 max-h-[85vh] overflow-y-auto">
          <h2 class="text-lg font-bold text-slate-900 mb-4">
            {{ editingUserId ? 'Benutzer bearbeiten' : 'Neuer Benutzer' }}
          </h2>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <UInput v-model="form.name" placeholder="Vor- und Nachname" class="w-full" />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">E-Mail</label>
              <UInput v-model="form.email" type="email" placeholder="name@firma.de" class="w-full" />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Rolle</label>
              <USelect
                v-model="form.roleId"
                :items="roleOptions"
                placeholder="Rolle auswählen..."
                value-key="value"
                class="w-full"
              />
            </div>

            <!-- Grouped Permission Toggles -->
            <div v-if="form.roleId && form.permissions.length > 0">
              <label class="block text-sm font-medium text-slate-700 mb-1">Berechtigungen</label>
              <p class="text-xs text-slate-400 mb-3">
                Klicken Sie auf ein Recht, um es ein- oder auszuschalten.
              </p>

              <div class="space-y-3">
                <div
                  v-for="group in PERMISSION_GROUPS"
                  :key="group.label"
                  class="border border-slate-200 rounded-lg overflow-hidden"
                >
                  <div class="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200">
                    <UIcon :name="group.icon" class="size-4 text-wine-700" />
                    <span class="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      {{ group.label }}
                    </span>
                  </div>

                  <div class="divide-y divide-slate-100">
                    <div
                      v-for="item in group.items"
                      :key="item.subject"
                      class="px-3 py-2.5"
                    >
                      <p class="text-xs font-medium text-slate-600 mb-1.5">
                        {{ item.label }}
                      </p>
                      <div class="flex flex-wrap gap-1.5">
                        <button
                          v-for="action in item.actions"
                          :key="action.key"
                          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors"
                          :class="
                            isGranted(item.subject, action.key)
                              ? 'bg-green-50 text-green-700 hover:bg-green-100'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                          "
                          @click="togglePermission(item.subject, action.key)"
                        >
                          <UIcon
                            :name="isGranted(item.subject, action.key) ? 'i-lucide-check' : 'i-lucide-x'"
                            class="size-3"
                          />
                          {{ action.label }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-200">
            <UButton
              label="Abbrechen"
              variant="ghost"
              color="neutral"
              @click="showModal = false"
            />
            <UButton
              :label="editingUserId ? 'Speichern' : 'Erstellen'"
              :loading="saving"
              :disabled="!form.name || !form.email || !form.roleId"
              @click="save"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
