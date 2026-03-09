<script setup lang="ts">
import { useQuestionnaireTemplates } from '~/composables/questionnaires/useTemplates'

definePageMeta({ layout: 'default' })

const toast = useToast()
const router = useRouter()

const { templates, status, createTemplate, updateTemplate } = useQuestionnaireTemplates()

// Tabs
const activeTab = ref<'vorlagen' | 'verlauf'>('vorlagen')

// Create template form
const showCreateForm = ref(false)
const newTemplateName = ref('')
const newTemplateDescription = ref('')
const isCreating = ref(false)

const handleCreate = async () => {
  if (!newTemplateName.value.trim()) return
  isCreating.value = true
  try {
    const result = await createTemplate(
      newTemplateName.value,
      newTemplateDescription.value || undefined,
    )
    toast.add({ title: 'Vorlage erstellt', color: 'success' })
    showCreateForm.value = false
    newTemplateName.value = ''
    newTemplateDescription.value = ''
    if (result && (result as { id: string }).id) {
      router.push(`/fragebogen/vorlage/${(result as { id: string }).id}`)
    }
  } catch {
    toast.add({ title: 'Fehler beim Erstellen', color: 'error' })
  } finally {
    isCreating.value = false
  }
}

const cancelCreate = () => {
  showCreateForm.value = false
  newTemplateName.value = ''
  newTemplateDescription.value = ''
}

// Toggle active/inactive
const toggleActive = async (template: { id: string; isActive: boolean; name: string }) => {
  try {
    await updateTemplate(template.id, { isActive: !template.isActive })
    toast.add({
      title: template.isActive ? 'Vorlage deaktiviert' : 'Vorlage aktiviert',
      color: 'success',
    })
  } catch {
    toast.add({ title: 'Fehler beim Aktualisieren', color: 'error' })
  }
}

// Template columns
const templateColumns = [
  { key: 'name', label: 'NAME' },
  { key: 'description', label: 'BESCHREIBUNG' },
  { key: 'questionCount', label: 'FRAGEN' },
  { key: 'status', label: 'STATUS' },
  { key: 'createdAt', label: 'ERSTELLT' },
  { key: 'actions', label: '' },
]

// History
interface SubmissionRow {
  id: string
  templateName: string | null
  companyName: string | null
  status: string
  pdfPath: string | null
  sentVia: string | null
  createdAt: string
}

const submissions = ref<SubmissionRow[]>([])
const historyStatus = ref<'idle' | 'pending' | 'error'>('idle')

const historyColumns = [
  { key: 'date', label: 'DATUM' },
  { key: 'company', label: 'KUNDE' },
  { key: 'template', label: 'VORLAGE' },
  { key: 'status', label: 'STATUS' },
  { key: 'pdf', label: 'PDF' },
  { key: 'actions', label: '' },
]

const loadHistory = async () => {
  historyStatus.value = 'pending'
  try {
    submissions.value = await $fetch<SubmissionRow[]>('/api/questionnaires/submissions')
    historyStatus.value = 'idle'
  } catch {
    historyStatus.value = 'error'
  }
}

// Load history when switching to tab
watch(activeTab, (tab) => {
  if (tab === 'verlauf' && submissions.value.length === 0) {
    loadHistory()
  }
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <UCard class="shadow-md">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-lg bg-[#720923]/10">
            <UIcon name="i-lucide-clipboard-list" class="w-6 h-6 text-[#720923]" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">Fragebogen</h2>
            <p class="text-sm text-gray-500">Vorlagen verwalten und Verlauf einsehen</p>
          </div>
        </div>
        <UButton
          v-if="activeTab === 'vorlagen' && !showCreateForm"
          size="sm"
          class="bg-[#720923] hover:bg-[#5a071c] text-white"
          icon="i-lucide-plus"
          label="Neue Vorlage"
          @click="showCreateForm = true"
        />
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 mt-4 border-b border-gray-200 dark:border-gray-700">
        <button
          class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px"
          :class="
            activeTab === 'vorlagen'
              ? 'text-[#720923] border-[#720923]'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          "
          @click="activeTab = 'vorlagen'"
        >
          Vorlagen
          <span class="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
            {{ templates.length }}
          </span>
        </button>
        <button
          class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px"
          :class="
            activeTab === 'verlauf'
              ? 'text-[#720923] border-[#720923]'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          "
          @click="activeTab = 'verlauf'"
        >
          Verlauf
          <span
            v-if="submissions.length > 0"
            class="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
          >
            {{ submissions.length }}
          </span>
        </button>
      </div>
    </UCard>

    <!-- Create Template Card (separate, prominent) -->
    <UCard
      v-if="showCreateForm && activeTab === 'vorlagen'"
      class="shadow-md border-l-4 border-l-[#720923]"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-[#720923]/10">
              <UIcon name="i-lucide-file-plus" class="w-5 h-5 text-[#720923]" />
            </div>
            <div>
              <h3 class="text-base font-bold text-gray-900 dark:text-white">
                Neue Fragebogen-Vorlage
              </h3>
              <p class="text-xs text-gray-500 mt-0.5">
                Geben Sie einen Namen ein und fügen Sie anschließend Fragen hinzu
              </p>
            </div>
          </div>
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            @click="cancelCreate"
          />
        </div>
      </template>

      <div class="space-y-5">
        <!-- Step indicators -->
        <div class="flex items-center gap-6 text-xs text-gray-400">
          <div class="flex items-center gap-1.5">
            <span
              class="w-5 h-5 rounded-full bg-[#720923] text-white flex items-center justify-center text-xs font-bold"
              >1</span
            >
            <span class="font-medium text-gray-700">Vorlage benennen</span>
          </div>
          <UIcon name="i-lucide-chevron-right" class="w-3.5 h-3.5" />
          <div class="flex items-center gap-1.5">
            <span
              class="w-5 h-5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold"
              >2</span
            >
            <span>Fragen hinzufügen</span>
          </div>
          <UIcon name="i-lucide-chevron-right" class="w-3.5 h-3.5" />
          <div class="flex items-center gap-1.5">
            <span
              class="w-5 h-5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold"
              >3</span
            >
            <span>Fragebogen starten</span>
          </div>
        </div>

        <USeparator />

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField label="Vorlagenname" required size="sm" hint="Pflichtfeld">
            <UInput
              v-model="newTemplateName"
              placeholder="z.B. Verkauf, Beratung, Energieaudit..."
              size="md"
              icon="i-lucide-file-text"
              autofocus
            />
          </UFormField>
          <UFormField label="Beschreibung" size="sm" hint="Optional">
            <UInput
              v-model="newTemplateDescription"
              placeholder="Worum geht es in diesem Fragebogen?"
              size="md"
              icon="i-lucide-align-left"
            />
          </UFormField>
        </div>

        <div class="flex items-center justify-between pt-2">
          <p class="text-xs text-gray-400">
            Nach dem Erstellen können Sie Fragen zum Fragebogen hinzufügen.
          </p>
          <div class="flex gap-2">
            <UButton
              size="sm"
              color="neutral"
              variant="outline"
              label="Abbrechen"
              @click="cancelCreate"
            />
            <UButton
              size="sm"
              class="bg-[#720923] hover:bg-[#5a071c] text-white"
              icon="i-lucide-arrow-right"
              label="Erstellen & Fragen hinzufügen"
              trailing
              :disabled="!newTemplateName.trim()"
              :loading="isCreating"
              @click="handleCreate"
            />
          </div>
        </div>
      </div>
    </UCard>

    <!-- ===== VORLAGEN TAB ===== -->
    <UCard v-if="activeTab === 'vorlagen'" class="shadow-md" :ui="{ body: 'p-0' }">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-[#720923]/5 dark:bg-gray-800">
            <tr>
              <th
                v-for="column in templateColumns"
                :key="column.key"
                scope="col"
                class="px-6 py-3 text-left text-xs font-semibold text-[#720923] dark:text-[#9e1e3e] uppercase tracking-wider"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="status === 'pending'">
              <td :colspan="templateColumns.length" class="text-center py-12">
                <UIcon
                  name="i-lucide-loader-2"
                  class="w-8 h-8 text-[#720923] animate-spin mx-auto"
                />
                <p class="mt-3 text-sm text-gray-500">Lade Vorlagen...</p>
              </td>
            </tr>

            <tr v-else-if="templates.length === 0">
              <td :colspan="templateColumns.length" class="text-center py-12">
                <UIcon
                  name="i-lucide-clipboard-list"
                  class="w-10 h-10 text-gray-300 mx-auto mb-3"
                />
                <p class="text-sm font-medium text-gray-500">Keine Vorlagen vorhanden</p>
                <p class="text-xs text-gray-400 mt-1">
                  Erstellen Sie Ihre erste Fragebogen-Vorlage
                </p>
              </td>
            </tr>

            <tr
              v-for="template in templates"
              v-else
              :key="template.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="h-9 w-9 flex-shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                    :class="
                      template.isActive
                        ? 'bg-gradient-to-br from-[#720923] to-[#5a071c]'
                        : 'bg-gray-400'
                    "
                  >
                    {{ template.name.substring(0, 2).toUpperCase() }}
                  </div>
                  <div class="ml-3">
                    <p
                      class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#720923] transition-colors cursor-pointer"
                      @click="router.push(`/fragebogen/vorlage/${template.id}`)"
                    >
                      {{ template.name }}
                    </p>
                  </div>
                </div>
              </td>

              <td class="px-6 py-4">
                <p class="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                  {{ template.description || '-' }}
                </p>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                >
                  <UIcon name="i-lucide-help-circle" class="w-3 h-3" />
                  {{ template.questionCount }}
                </span>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                  :class="
                    template.isActive
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  "
                >
                  {{ template.isActive ? 'Aktiv' : 'Inaktiv' }}
                </span>
              </td>

              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {{ formatDate(template.createdAt) }}
              </td>

              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-1">
                  <UButton
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-pencil"
                    @click="router.push(`/fragebogen/vorlage/${template.id}`)"
                  />
                  <UButton
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    :icon="template.isActive ? 'i-lucide-pause' : 'i-lucide-play'"
                    @click="toggleActive(template)"
                  />
                  <UButton
                    v-if="template.isActive"
                    size="xs"
                    class="bg-[#720923] hover:bg-[#5a071c] text-white"
                    icon="i-lucide-play-circle"
                    label="Starten"
                    @click="router.push(`/fragebogen/durchfuehren/${template.id}`)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- ===== VERLAUF TAB ===== -->
    <UCard v-if="activeTab === 'verlauf'" class="shadow-md" :ui="{ body: 'p-0' }">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-[#720923]/5 dark:bg-gray-800">
            <tr>
              <th
                v-for="column in historyColumns"
                :key="column.key"
                scope="col"
                class="px-6 py-3 text-left text-xs font-semibold text-[#720923] dark:text-[#9e1e3e] uppercase tracking-wider"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="historyStatus === 'pending'">
              <td :colspan="historyColumns.length" class="text-center py-12">
                <UIcon
                  name="i-lucide-loader-2"
                  class="w-8 h-8 text-[#720923] animate-spin mx-auto"
                />
                <p class="mt-3 text-sm text-gray-500">Lade Verlauf...</p>
              </td>
            </tr>

            <tr v-else-if="submissions.length === 0">
              <td :colspan="historyColumns.length" class="text-center py-12">
                <UIcon name="i-lucide-history" class="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p class="text-sm font-medium text-gray-500">Keine Eintraege vorhanden</p>
                <p class="text-xs text-gray-400 mt-1">
                  Starten Sie einen Fragebogen, um den Verlauf zu sehen
                </p>
              </td>
            </tr>

            <tr
              v-for="sub in submissions"
              v-else
              :key="sub.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <!-- Date -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {{ formatDateTime(sub.createdAt) }}
              </td>

              <!-- Company -->
              <td class="px-6 py-4 whitespace-nowrap">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ sub.companyName || '-' }}
                </p>
              </td>

              <!-- Template -->
              <td class="px-6 py-4 whitespace-nowrap">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ sub.templateName || '-' }}
                </p>
              </td>

              <!-- Status -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                  :class="
                    sub.status === 'completed'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  "
                >
                  {{ sub.status === 'completed' ? 'Abgeschlossen' : 'In Bearbeitung' }}
                </span>
              </td>

              <!-- PDF -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="sub.pdfPath" class="flex items-center gap-1">
                  <UIcon name="i-lucide-file-check" class="w-4 h-4 text-green-500" />
                  <span v-if="sub.sentVia" class="text-xs text-gray-400">
                    ({{ sub.sentVia }})
                  </span>
                </div>
                <span v-else class="text-xs text-gray-400">-</span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-1">
                  <UButton
                    v-if="sub.pdfPath"
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-download"
                    @click="open(`/api/questionnaires/submissions/${sub.id}/pdf`, '_blank')"
                  />
                  <UButton
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-eye"
                    @click="router.push(`/fragebogen/ergebnis/${sub.id}`)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>
