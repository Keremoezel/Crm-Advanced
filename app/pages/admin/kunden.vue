<script setup lang="ts">
import { useCustomers, type Customer, type Contact } from '~/composables/customers/useCustomers'

definePageMeta({ layout: 'default' })

const toast = useToast()

const {
  // List
  customers,
  pagination,
  page,
  listStatus,
  // Filters
  search,
  filterIndustry,
  filterCity,
  filterRevenueSize,
  filterEmployeeCountMin,
  filterEmployeeCountMax,
  filterOptions,
  resetFilters,
  hasActiveFilters,
  // Detail
  selectedCustomer,
  detailStatus,
  selectCustomer,
  clearSelection,
  refreshDetail,
} = useCustomers()

// --- Refresh detail and keep data in sync ---
const handleRefresh = async () => {
  await refreshDetail()
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

// Back to list
const goBack = () => {
  clearSelection()
  isEditingCompany.value = false
  isEditingContacts.value = false
}

// Table columns
const columns = [
  { key: 'name', label: 'NAME' },
  { key: 'industry', label: 'BRANCHE' },
  { key: 'city', label: 'ORT' },
  { key: 'employeeCount', label: 'MITARBEITER' },
  { key: 'revenueSize', label: 'UMSATZ' },
  { key: 'primaryContact', label: 'PRIMÄRKONTAKT' },
  { key: 'phone', label: 'TELEFON' },
]
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- ===== DETAIL VIEW ===== -->
    <template v-if="selectedCustomer || detailStatus === 'pending'">
      <!-- Back button -->
      <UButton
        icon="i-lucide-arrow-left"
        label="Zurück zur Liste"
        color="neutral"
        variant="ghost"
        @click="goBack"
      />

      <!-- Loading state -->
      <div v-if="detailStatus === 'pending'" class="text-center py-16">
        <UIcon name="i-lucide-loader-2" class="w-10 h-10 text-[#720923] animate-spin mx-auto" />
        <p class="mt-4 text-sm text-gray-500">Lade Kundendaten...</p>
      </div>

      <!-- Error state -->
      <UCard v-else-if="detailStatus === 'error'" class="shadow-sm">
        <div class="text-center py-12">
          <UIcon name="i-lucide-alert-circle" class="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p class="text-sm font-medium text-gray-600">Fehler beim Laden der Kundendaten</p>
          <UButton
            class="mt-4"
            size="sm"
            color="neutral"
            variant="outline"
            label="Erneut versuchen"
            @click="handleRefresh"
          />
        </div>
      </UCard>

      <!-- Customer detail -->
      <template v-if="selectedCustomer && detailStatus === 'idle'">
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

        <!-- Notes Section -->
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
            <div
              v-if="selectedCustomer.contacts.length === 0"
              class="text-center py-8 text-gray-400"
            >
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
    </template>

    <!-- ===== LIST VIEW ===== -->
    <template v-else>
      <!-- Header + Filters -->
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
              </p>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mt-5">
          <div class="lg:col-span-2">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              placeholder="Nach Name, Branche, Ort..."
              size="sm"
            />
          </div>
          <USelectMenu
            v-model="filterIndustry"
            :items="filterOptions.industries"
            placeholder="Branche"
            size="sm"
          />
          <USelectMenu
            v-model="filterCity"
            :items="filterOptions.cities"
            placeholder="Ort"
            size="sm"
          />
          <USelectMenu
            v-model="filterRevenueSize"
            :items="filterOptions.revenueSizes"
            placeholder="Umsatz"
            size="sm"
          />
          <div class="flex gap-2">
            <UInput
              :model-value="filterEmployeeCountMin ?? ''"
              type="number"
              placeholder="MA Min"
              size="sm"
              @update:model-value="filterEmployeeCountMin = $event ? Number($event) : undefined"
            />
            <UInput
              :model-value="filterEmployeeCountMax ?? ''"
              type="number"
              placeholder="MA Max"
              size="sm"
              @update:model-value="filterEmployeeCountMax = $event ? Number($event) : undefined"
            />
          </div>
        </div>

        <!-- Active filters indicator -->
        <div v-if="hasActiveFilters" class="flex items-center gap-3 mt-3">
          <UButton
            size="xs"
            color="neutral"
            variant="outline"
            icon="i-lucide-x"
            label="Filter zurücksetzen"
            @click="resetFilters"
          />
        </div>
      </UCard>

      <!-- Customer Table -->
      <UCard
        class="shadow-md"
        :ui="{
          body: 'p-0',
          footer: 'bg-gray-50/50 dark:bg-gray-900/20 px-6 py-4',
        }"
      >
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
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <!-- Loading -->
              <tr v-if="listStatus === 'pending'">
                <td :colspan="columns.length" class="text-center py-12">
                  <UIcon
                    name="i-lucide-loader-2"
                    class="w-8 h-8 text-[#720923] animate-spin mx-auto"
                  />
                  <p class="mt-3 text-sm text-gray-500">Lade Kunden...</p>
                </td>
              </tr>

              <!-- Empty -->
              <tr v-else-if="customers.length === 0">
                <td :colspan="columns.length" class="text-center py-12">
                  <UIcon name="i-lucide-search-x" class="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p class="text-sm font-medium text-gray-500">Keine Kunden gefunden</p>
                  <p v-if="hasActiveFilters" class="text-xs text-gray-400 mt-1">
                    Versuchen Sie andere Filterkriterien
                  </p>
                </td>
              </tr>

              <!-- Rows -->
              <tr
                v-for="customer in customers"
                v-else
                :key="customer.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                @click="selectCustomer(customer.id)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div
                      class="h-9 w-9 flex-shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br from-[#720923] to-[#5a071c] shadow-sm"
                    >
                      {{ customer.name.substring(0, 2).toUpperCase() }}
                    </div>
                    <div class="ml-3">
                      <p
                        class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#720923] transition-colors"
                      >
                        {{ customer.name }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    v-if="customer.industry"
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {{ customer.industry }}
                  </span>
                  <span v-else class="text-sm text-gray-400">-</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ customer.city || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ customer.employeeCount || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    v-if="customer.revenueSize"
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"
                  >
                    {{ customer.revenueSize }}
                  </span>
                  <span v-else class="text-sm text-gray-400">-</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ customer.primaryContact || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ customer.primaryContactPhone || customer.phone || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination footer -->
        <template #footer>
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Zeige
              <span class="font-medium">{{
                Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)
              }}</span>
              bis
              <span class="font-medium">{{
                Math.min(pagination.page * pagination.limit, pagination.total)
              }}</span>
              von <span class="font-medium">{{ pagination.total }}</span> Ergebnissen
            </p>
            <UPagination
              v-if="pagination.pages > 1"
              v-model="page"
              :total="pagination.total"
              :items-per-page="pagination.limit"
            />
          </div>
        </template>
      </UCard>
    </template>
  </div>
</template>
