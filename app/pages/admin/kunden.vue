<script setup lang="ts">
import { useCustomers, type Customer, type Contact } from '~/composables/customers/useCustomers'

definePageMeta({ layout: 'default' })

const toast = useToast()

const { customers, pagination, selectedCustomer, selectCustomer, search, status, refresh } =
  useCustomers()

// Search dropdown
const isSearchFocused = ref(false)
const searchDropdownPosition = ref({ top: 0, left: 0, width: 0 })

const showResults = computed(
  () => isSearchFocused.value && search.value.length > 0 && customers.value.length > 0,
)

// Calculate dropdown position when showing
watch(showResults, (show) => {
  if (show) {
    nextTick(() => {
      const input = document.querySelector('input[placeholder*="Nach Name"]') as HTMLElement
      if (input) {
        const rect = input.getBoundingClientRect()
        searchDropdownPosition.value = {
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
          width: rect.width,
        }
      }
    })
  }
})

const handleSelect = (customer: Customer) => {
  selectCustomer(customer)
  isSearchFocused.value = false
}

const handleBlur = () => {
  setTimeout(() => {
    isSearchFocused.value = false
  }, 200)
}

// Refresh and keep selection in sync
const handleRefresh = async () => {
  await refresh()
  if (selectedCustomer.value && customers.value) {
    const updated = customers.value.find((c) => c.id === selectedCustomer.value!.id)
    if (updated) selectedCustomer.value = updated
  }
}

// --- Notes editing ---
const conversationHook = ref('')
const researchResult = ref('')
const hasUnsavedNotes = ref(false)
const isSavingNotes = ref(false)

watch(selectedCustomer, (c) => {
  if (c) {
    conversationHook.value = c.conversationHook || ''
    researchResult.value = c.researchResult || ''
    hasUnsavedNotes.value = false
  }
})

const trackNoteChanges = () => {
  if (!selectedCustomer.value) return
  hasUnsavedNotes.value =
    conversationHook.value !== (selectedCustomer.value.conversationHook || '') ||
    researchResult.value !== (selectedCustomer.value.researchResult || '')
}

const saveNotes = async () => {
  if (!selectedCustomer.value) return
  isSavingNotes.value = true
  try {
    await $fetch(`/api/customers/${selectedCustomer.value.id}/notes`, {
      method: 'PUT',
      body: {
        conversationHook: conversationHook.value,
        researchResult: researchResult.value,
      },
    })
    hasUnsavedNotes.value = false
    toast.add({ title: 'Notizen gespeichert', color: 'success' })
    await handleRefresh()
  } catch {
    toast.add({ title: 'Fehler beim Speichern', color: 'error' })
  } finally {
    isSavingNotes.value = false
  }
}

const resetNotes = () => {
  if (!selectedCustomer.value) return
  conversationHook.value = selectedCustomer.value.conversationHook || ''
  researchResult.value = selectedCustomer.value.researchResult || ''
  hasUnsavedNotes.value = false
}

// --- Company info editing ---
const isEditingCompany = ref(false)
const editedCompany = ref<Partial<Customer>>({})

const startEditingCompany = () => {
  if (!selectedCustomer.value) return
  editedCompany.value = { ...selectedCustomer.value }
  isEditingCompany.value = true
}

const cancelEditingCompany = () => {
  isEditingCompany.value = false
}

const saveCompany = async () => {
  if (!selectedCustomer.value) return
  try {
    await $fetch(`/api/customers/${selectedCustomer.value.id}`, {
      method: 'PUT',
      body: editedCompany.value,
    })
    isEditingCompany.value = false
    toast.add({ title: 'Unternehmensdaten gespeichert', color: 'success' })
    await handleRefresh()
  } catch {
    toast.add({ title: 'Fehler beim Speichern', color: 'error' })
  }
}

// --- Contacts editing ---
const isEditingContacts = ref(false)
const editedContacts = ref<Contact[]>([])

watch(selectedCustomer, () => {
  isEditingContacts.value = false
})

const startEditingContacts = () => {
  if (!selectedCustomer.value?.contacts) return
  editedContacts.value = selectedCustomer.value.contacts.map((c) => ({ ...c }))
  isEditingContacts.value = true
}

const cancelEditingContacts = () => {
  isEditingContacts.value = false
}

const setPrimaryContact = (index: number) => {
  editedContacts.value.forEach((c) => (c.isPrimary = false))
  editedContacts.value[index]!.isPrimary = true
}

const removeContact = (index: number) => {
  if (editedContacts.value.length <= 1) return
  if (editedContacts.value[index]!.isPrimary) return
  editedContacts.value.splice(index, 1)
}

const addContact = () => {
  editedContacts.value.push({
    isPrimary: false,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    birthDate: '',
    linkedin: '',
    xing: '',
    facebook: '',
    notes: '',
  })
}

const saveContacts = async () => {
  if (!selectedCustomer.value) return
  const hasPrimary = editedContacts.value.some((c) => c.isPrimary)
  if (!hasPrimary) {
    toast.add({ title: 'Mindestens ein Primärkontakt erforderlich', color: 'warning' })
    return
  }
  try {
    await $fetch(`/api/customers/${selectedCustomer.value.id}/contacts`, {
      method: 'PUT',
      body: editedContacts.value,
    })
    isEditingContacts.value = false
    toast.add({ title: 'Kontakte gespeichert', color: 'success' })
    await handleRefresh()
  } catch {
    toast.add({ title: 'Fehler beim Speichern der Kontakte', color: 'error' })
  }
}

// Deselect customer
const clearSelection = () => {
  selectedCustomer.value = null
  isEditingCompany.value = false
  isEditingContacts.value = false
}
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Search Section -->
    <UCard class="shadow-md">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-lg bg-[#720923]/10">
            <UIcon name="i-lucide-building-2" class="w-6 h-6 text-[#720923]" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">Kundenverwaltung</h2>
            <p class="text-sm text-gray-500">
              <span class="font-semibold">{{ pagination.total }}</span> Unternehmen
              <span v-if="search.length > 0" class="ml-2">
                · <span class="font-semibold">{{ customers.length }}</span> gefunden
              </span>
            </p>
          </div>
        </div>
        <div class="flex-1 w-full sm:max-w-xl ml-auto">
          <div class="relative">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              placeholder="Nach Name, Branche, Ort suchen..."
              size="lg"
              @focus="isSearchFocused = true"
              @blur="handleBlur"
            />

            <!-- Loading indicator -->
            <div
              v-if="status === 'pending' && search.length > 0"
              class="absolute right-3 top-1/2 -translate-y-1/2 z-10"
            >
              <UIcon name="i-lucide-loader-2" class="w-5 h-5 text-[#720923] animate-spin" />
            </div>

            <!-- Search status badge -->
            <div
              v-else-if="search.length > 0"
              class="absolute right-3 top-1/2 -translate-y-1/2 z-10"
            >
              <div
                class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#720923]/10 text-[#720923] text-xs font-medium"
              >
                <UIcon name="i-lucide-check-circle-2" class="w-3.5 h-3.5" />
                {{ customers.length }}
              </div>
            </div>
          </div>

          <!-- Search Results Dropdown - FIXED POSITIONING -->
          <Teleport to="body">
            <div
              v-if="showResults"
              class="fixed z-[9999] bg-white dark:bg-gray-900 border-2 border-[#720923]/20 dark:border-gray-700 rounded-lg shadow-2xl max-h-96 overflow-y-auto"
              :style="{
                top: searchDropdownPosition.top + 'px',
                left: searchDropdownPosition.left + 'px',
                width: Math.max(searchDropdownPosition.width, 500) + 'px',
                minWidth: '500px',
              }"
            >
              <!-- Results header -->
              <div
                class="sticky top-0 bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700"
              >
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {{ customers.length }} {{ customers.length === 1 ? 'Ergebnis' : 'Ergebnisse' }}
                </p>
              </div>

              <button
                v-for="customer in customers"
                :key="customer.id"
                class="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#720923]/5 dark:hover:bg-gray-800 transition-all text-left border-b border-gray-100 dark:border-gray-800 last:border-0 group min-w-0"
                @mousedown.prevent="handleSelect(customer)"
              >
                <div
                  class="h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br from-[#720923] to-[#5a071c] shadow-md group-hover:shadow-lg transition-shadow"
                >
                  {{ customer.name.substring(0, 2).toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0 overflow-hidden">
                  <p
                    class="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#720923] transition-colors whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    {{ customer.name }}
                  </p>
                  <div class="flex items-center gap-2 mt-0.5 overflow-hidden">
                    <p
                      v-if="customer.industry"
                      class="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap"
                    >
                      <UIcon name="i-lucide-factory" class="w-3 h-3 flex-shrink-0" />
                      <span class="truncate">{{ customer.industry }}</span>
                    </p>
                    <span
                      v-if="customer.industry && customer.city"
                      class="text-xs text-gray-300 flex-shrink-0"
                      >·</span
                    >
                    <p
                      v-if="customer.city"
                      class="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap"
                    >
                      <UIcon name="i-lucide-map-pin" class="w-3 h-3 flex-shrink-0" />
                      <span class="truncate">{{ customer.city }}</span>
                    </p>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-1">
                  <span
                    v-if="customer.project"
                    class="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium"
                  >
                    {{ customer.project }}
                  </span>
                  <UIcon
                    name="i-lucide-chevron-right"
                    class="w-4 h-4 text-gray-400 group-hover:text-[#720923] group-hover:translate-x-0.5 transition-all"
                  />
                </div>
              </button>

              <!-- No results state -->
              <div
                v-if="customers.length === 0 && search.length > 0 && status !== 'pending'"
                class="px-4 py-8 text-center"
              >
                <UIcon name="i-lucide-search-x" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-sm font-medium text-gray-500">Keine Kunden gefunden</p>
                <p class="text-xs text-gray-400 mt-1">Versuchen Sie andere Suchbegriffe</p>
              </div>
            </div>
          </Teleport>
        </div>
      </div>
    </UCard>

    <!-- No Selection State -->
    <UCard v-if="!selectedCustomer" class="shadow-sm">
      <div class="text-center py-16">
        <div class="p-4 rounded-full bg-gray-100 dark:bg-gray-800 inline-block mb-4">
          <UIcon name="i-lucide-search" class="w-10 h-10 text-gray-400" />
        </div>
        <h3 class="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Kunden suchen</h3>
        <p class="text-gray-400 max-w-sm mx-auto">
          Geben Sie einen Kundennamen in die Suche ein, um Details anzuzeigen.
        </p>
      </div>
    </UCard>

    <!-- Selected Customer Detail -->
    <template v-if="selectedCustomer">
      <!-- Customer Header -->
      <UCard class="shadow-md border-l-4 border-l-[#720923]">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div
            class="h-14 w-14 flex-shrink-0 rounded-full flex items-center justify-center text-white text-lg font-bold bg-gradient-to-br from-[#720923] to-[#5a071c] shadow-lg"
          >
            {{ selectedCustomer.name.substring(0, 2).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ selectedCustomer.name }}
            </h2>
            <div class="flex flex-wrap gap-2 mt-1.5">
              <span
                v-if="selectedCustomer.industry"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
              >
                <UIcon name="i-lucide-factory" class="w-3 h-3" />
                {{ selectedCustomer.industry }}
              </span>
              <span
                v-if="selectedCustomer.city"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"
              >
                <UIcon name="i-lucide-map-pin" class="w-3 h-3" />
                {{ selectedCustomer.city }}
              </span>
              <span
                v-if="selectedCustomer.legalForm"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200"
              >
                {{ selectedCustomer.legalForm }}
              </span>
              <span
                v-if="selectedCustomer.employeeCount"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200"
              >
                <UIcon name="i-lucide-users" class="w-3 h-3" />
                {{ selectedCustomer.employeeCount }} Mitarbeiter
              </span>
              <span
                v-if="selectedCustomer.project"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200"
              >
                <UIcon name="i-lucide-folder" class="w-3 h-3" />
                {{ selectedCustomer.project }}
              </span>
            </div>
          </div>
          <UButton
            size="sm"
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            @click="clearSelection"
          />
        </div>
      </UCard>

      <!-- Company Info Section -->
      <UCard class="shadow-md">
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-bold text-[#720923] dark:text-white">Unternehmensdaten</h3>
            <div v-if="!isEditingCompany">
              <UButton
                size="sm"
                color="neutral"
                variant="ghost"
                icon="i-lucide-pencil"
                label="Bearbeiten"
                @click="startEditingCompany"
              />
            </div>
            <div v-else class="flex gap-2">
              <UButton
                size="sm"
                color="neutral"
                variant="outline"
                label="Abbrechen"
                @click="cancelEditingCompany"
              />
              <UButton
                size="sm"
                class="bg-[#720923] hover:bg-[#5a071c] text-white"
                label="Speichern"
                @click="saveCompany"
              />
            </div>
          </div>
        </template>

        <!-- View mode -->
        <div v-if="!isEditingCompany" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p class="text-xs font-medium text-gray-400 uppercase tracking-wide">Telefon</p>
              <p class="text-sm text-gray-900 dark:text-white mt-0.5">
                {{ selectedCustomer.phone || '-' }}
              </p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-400 uppercase tracking-wide">E-Mail</p>
              <p class="text-sm text-gray-900 dark:text-white mt-0.5">
                {{ selectedCustomer.email || '-' }}
              </p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-400 uppercase tracking-wide">Webseite</p>
              <p class="text-sm text-gray-900 dark:text-white mt-0.5">
                {{ selectedCustomer.website || '-' }}
              </p>
            </div>
          </div>

          <hr class="border-gray-100 dark:border-gray-800" />

          <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div class="sm:col-span-2">
              <p class="text-xs font-medium text-gray-400 uppercase tracking-wide">Straße</p>
              <p class="text-sm text-gray-900 dark:text-white mt-0.5">
                {{ selectedCustomer.street || '-' }}
              </p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-400 uppercase tracking-wide">PLZ</p>
              <p class="text-sm text-gray-900 dark:text-white mt-0.5">
                {{ selectedCustomer.postalCode || '-' }}
              </p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-400 uppercase tracking-wide">Ort</p>
              <p class="text-sm text-gray-900 dark:text-white mt-0.5">
                {{ selectedCustomer.city || '-' }}
              </p>
            </div>
          </div>

          <hr class="border-gray-100 dark:border-gray-800" />

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p class="text-xs font-medium text-gray-400 uppercase tracking-wide">Bundesland</p>
              <p class="text-sm text-gray-900 dark:text-white mt-0.5">
                {{ selectedCustomer.state || '-' }}
              </p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-400 uppercase tracking-wide">Gründung</p>
              <p class="text-sm text-gray-900 dark:text-white mt-0.5">
                {{ selectedCustomer.foundingDate || '-' }}
              </p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-400 uppercase tracking-wide">Umsatz</p>
              <p class="text-sm text-gray-900 dark:text-white mt-0.5">
                {{ selectedCustomer.revenueSize || '-' }}
              </p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Öffnungszeiten
              </p>
              <p class="text-sm text-gray-900 dark:text-white mt-0.5">
                {{ selectedCustomer.openingHours || '-' }}
              </p>
            </div>
          </div>

          <div v-if="selectedCustomer.description">
            <hr class="border-gray-100 dark:border-gray-800 mb-4" />
            <p class="text-xs font-medium text-gray-400 uppercase tracking-wide">Beschreibung</p>
            <p class="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
              {{ selectedCustomer.description }}
            </p>
          </div>
        </div>

        <!-- Edit mode -->
        <div v-else class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="text-xs font-medium text-gray-500 mb-1 block">Kundenname</label>
              <UInput v-model="editedCompany.name" size="sm" />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500 mb-1 block">Rechtsform</label>
              <UInput v-model="editedCompany.legalForm" size="sm" />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500 mb-1 block">Branche</label>
              <UInput v-model="editedCompany.industry" size="sm" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="text-xs font-medium text-gray-500 mb-1 block">Telefon</label>
              <UInput v-model="editedCompany.phone" size="sm" />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500 mb-1 block">E-Mail</label>
              <UInput v-model="editedCompany.email" size="sm" />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500 mb-1 block">Webseite</label>
              <UInput v-model="editedCompany.website" size="sm" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div class="sm:col-span-2">
              <label class="text-xs font-medium text-gray-500 mb-1 block">Straße</label>
              <UInput v-model="editedCompany.street" size="sm" />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500 mb-1 block">PLZ</label>
              <UInput v-model="editedCompany.postalCode" size="sm" />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500 mb-1 block">Ort</label>
              <UInput v-model="editedCompany.city" size="sm" />
            </div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label class="text-xs font-medium text-gray-500 mb-1 block">Bundesland</label>
              <UInput v-model="editedCompany.state" size="sm" />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500 mb-1 block">Mitarbeiter</label>
              <UInput v-model="editedCompany.employeeCount" size="sm" type="number" />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500 mb-1 block">Umsatz</label>
              <UInput v-model="editedCompany.revenueSize" size="sm" />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500 mb-1 block">Gründung</label>
              <UInput v-model="editedCompany.foundingDate" size="sm" type="date" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-medium text-gray-500 mb-1 block">Öffnungszeiten</label>
              <UInput v-model="editedCompany.openingHours" size="sm" />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500 mb-1 block">Projekt</label>
              <UInput v-model="editedCompany.project" size="sm" />
            </div>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 mb-1 block">Beschreibung</label>
            <UTextarea v-model="editedCompany.description" :rows="2" />
          </div>
        </div>
      </UCard>

      <!-- Notes Section - Now between Company Info and Contacts -->
      <UCard class="shadow-md border-l-4 border-l-blue-500">
        <template #header>
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-notebook-pen" class="w-5 h-5 text-blue-600" />
              <h3 class="text-lg font-bold text-blue-900 dark:text-white">Notizen & Recherche</h3>
            </div>
            <UButton
              v-if="hasUnsavedNotes"
              size="sm"
              class="bg-[#720923] hover:bg-[#5a071c] text-white"
              icon="i-lucide-save"
              label="Speichern"
              :loading="isSavingNotes"
              @click="saveNotes"
            />
          </div>
        </template>

        <div class="grid grid-cols-2 gap-6">
          <div>
            <label
              class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5 block"
            >
              <UIcon name="i-lucide-message-circle" class="w-3.5 h-3.5" />
              Gesprächsaufhänger
            </label>
            <UTextarea
              v-model="conversationHook"
              placeholder="Gesprächseinstieg eingeben..."
              :rows="5"
              class="w-full min-w-0"
              @update:model-value="trackNoteChanges"
            />
          </div>
          <div>
            <label
              class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5 block"
            >
              <UIcon name="i-lucide-search-check" class="w-3.5 h-3.5" />
              Rechercheergebnis
            </label>
            <UTextarea
              v-model="researchResult"
              placeholder="Rechercheergebnis eingeben..."
              :rows="5"
              class="w-full min-w-0"
              @update:model-value="trackNoteChanges"
            />
          </div>
        </div>

        <div
          v-if="hasUnsavedNotes"
          class="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-alert-triangle" class="w-4 h-4 text-yellow-600" />
              <span class="text-xs font-medium text-yellow-800 dark:text-yellow-300"
                >Ungespeicherte Änderungen</span
              >
            </div>
            <div class="flex gap-2">
              <UButton
                size="xs"
                color="neutral"
                variant="outline"
                label="Zurücksetzen"
                @click="resetNotes"
              />
              <UButton
                size="xs"
                class="bg-[#720923] hover:bg-[#5a071c] text-white"
                label="Speichern"
                :loading="isSavingNotes"
                @click="saveNotes"
              />
            </div>
          </div>
        </div>
      </UCard>

      <!-- Contacts Section -->
      <UCard class="shadow-md">
        <template #header>
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-3">
              <h3 class="text-lg font-bold text-[#720923] dark:text-white">Kontakte</h3>
              <span
                class="text-sm px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium"
                >{{ selectedCustomer.contacts.length }}</span
              >
            </div>
            <div v-if="!isEditingContacts">
              <UButton
                size="sm"
                color="neutral"
                variant="ghost"
                icon="i-lucide-pencil"
                label="Bearbeiten"
                @click="startEditingContacts"
              />
            </div>
            <div v-else class="flex gap-2">
              <UButton
                size="sm"
                color="neutral"
                variant="outline"
                label="Abbrechen"
                @click="cancelEditingContacts"
              />
              <UButton
                size="sm"
                class="bg-[#720923] hover:bg-[#5a071c] text-white"
                label="Speichern"
                @click="saveContacts"
              />
            </div>
          </div>
        </template>

        <!-- View mode -->
        <div v-if="!isEditingContacts" class="space-y-4">
          <CustomerContactCard
            v-for="(contact, index) in selectedCustomer.contacts"
            :key="contact.id || index"
            :contact="contact"
          />
          <div v-if="selectedCustomer.contacts.length === 0" class="text-center py-8 text-gray-400">
            Keine Kontakte vorhanden.
          </div>
        </div>

        <!-- Edit mode -->
        <div v-else class="space-y-4">
          <CustomerContactEditCard
            v-for="(contact, index) in editedContacts"
            :key="index"
            :contact="contact"
            :index="index"
            :can-delete="editedContacts.length > 1"
            @update:contact="editedContacts[index] = $event"
            @set-primary="setPrimaryContact"
            @remove="removeContact"
          />
          <UButton
            block
            variant="outline"
            color="neutral"
            icon="i-lucide-plus"
            label="Neuen Kontakt hinzufügen"
            @click="addContact"
          />
        </div>
      </UCard>
    </template>
  </div>
</template>
