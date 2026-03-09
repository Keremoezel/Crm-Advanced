<script setup lang="ts">
import type {
  TemplateWithQuestions,
  QuestionnaireQuestion,
} from '~/composables/questionnaires/useTemplates'
import { useQuestionnaireTemplates } from '~/composables/questionnaires/useTemplates'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const toast = useToast()

const templateId = route.params.id as string
const {
  fetchTemplate,
  updateTemplate,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
} = useQuestionnaireTemplates()

// Template data
const template = ref<TemplateWithQuestions | null>(null)
const isLoading = ref(true)
const loadError = ref(false)

const loadTemplate = async () => {
  isLoading.value = true
  loadError.value = false
  try {
    template.value = await fetchTemplate(templateId)
  } catch {
    loadError.value = true
  } finally {
    isLoading.value = false
  }
}

await loadTemplate()

// Template metadata editing
const isEditingMeta = ref(false)
const editedName = ref('')
const editedDescription = ref('')

const startEditMeta = () => {
  if (!template.value) return
  editedName.value = template.value.name
  editedDescription.value = template.value.description || ''
  isEditingMeta.value = true
}

const saveMeta = async () => {
  if (!template.value || !editedName.value.trim()) return
  try {
    await updateTemplate(template.value.id, {
      name: editedName.value,
      description: editedDescription.value || undefined,
    })
    template.value.name = editedName.value.trim()
    template.value.description = editedDescription.value.trim() || null
    isEditingMeta.value = false
    toast.add({ title: 'Vorlage aktualisiert', color: 'success' })
  } catch {
    toast.add({ title: 'Fehler beim Speichern', color: 'error' })
  }
}

// Question management
const showQuestionForm = ref(false)
const editingQuestion = ref<QuestionnaireQuestion | null>(null)

const openAddQuestion = () => {
  editingQuestion.value = null
  showQuestionForm.value = true
}

const openEditQuestion = (question: QuestionnaireQuestion) => {
  editingQuestion.value = question
  showQuestionForm.value = true
}

const closeQuestionForm = () => {
  showQuestionForm.value = false
  editingQuestion.value = null
}

const handleSaveQuestion = async (data: {
  type: string
  questionText: string
  options?: string[]
  isRequired: boolean
  offerText?: string
  parentQuestionId?: string
  conditionValue?: string
}) => {
  try {
    if (editingQuestion.value) {
      // Update existing
      await updateQuestion(editingQuestion.value.id, data)
      toast.add({ title: 'Frage aktualisiert', color: 'success' })
    } else {
      // Add new
      await addQuestion(templateId, data)
      toast.add({ title: 'Frage hinzugefuegt', color: 'success' })
    }
    closeQuestionForm()
    await loadTemplate()
  } catch {
    toast.add({ title: 'Fehler beim Speichern der Frage', color: 'error' })
  }
}

const handleDeleteQuestion = async (questionId: string) => {
  try {
    await deleteQuestion(questionId)
    toast.add({ title: 'Frage geloescht', color: 'success' })
    await loadTemplate()
  } catch {
    toast.add({ title: 'Fehler beim Loeschen', color: 'error' })
  }
}

// Move question up/down
const moveQuestion = async (index: number, direction: 'up' | 'down') => {
  if (!template.value) return
  const questions = [...template.value.questions]
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= questions.length) return

  // Swap
  const temp = questions[index]!
  questions[index] = questions[targetIndex]!
  questions[targetIndex] = temp

  const order = questions.map((q) => q.id)
  try {
    await reorderQuestions(templateId, order)
    await loadTemplate()
  } catch {
    toast.add({ title: 'Fehler beim Sortieren', color: 'error' })
  }
}

// Question type labels
const TYPE_LABELS: Record<string, string> = {
  yes_no: 'Ja / Nein',
  single_choice: 'Einzelauswahl',
  multiple_choice: 'Mehrfachauswahl',
  text: 'Freitext',
  number: 'Zahl',
  rating: 'Bewertung',
}

const TYPE_COLORS: Record<string, string> = {
  yes_no: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  single_choice: 'bg-blue-50 text-blue-700 border-blue-200',
  multiple_choice: 'bg-violet-50 text-violet-700 border-violet-200',
  text: 'bg-amber-50 text-amber-700 border-amber-200',
  number: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  rating: 'bg-rose-50 text-rose-700 border-rose-200',
}

// Get parent question text for conditional display
const getParentQuestionText = (parentId: string | null) => {
  if (!parentId || !template.value) return ''
  const parent = template.value.questions.find((q) => q.id === parentId)
  return parent?.questionText.substring(0, 40) || ''
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Back button -->
    <UButton
      icon="i-lucide-arrow-left"
      label="Zurueck zu Vorlagen"
      color="neutral"
      variant="ghost"
      @click="router.push('/fragebogen')"
    />

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-16">
      <UIcon name="i-lucide-loader-2" class="w-10 h-10 text-[#720923] animate-spin mx-auto" />
      <p class="mt-4 text-sm text-gray-500">Lade Vorlage...</p>
    </div>

    <!-- Error -->
    <UCard v-else-if="loadError" class="shadow-sm">
      <div class="text-center py-12">
        <UIcon name="i-lucide-alert-circle" class="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p class="text-sm font-medium text-gray-600">Vorlage nicht gefunden</p>
        <UButton
          class="mt-4"
          size="sm"
          color="neutral"
          variant="outline"
          label="Erneut versuchen"
          @click="loadTemplate"
        />
      </div>
    </UCard>

    <!-- Template loaded -->
    <template v-else-if="template">
      <!-- Template Header -->
      <UCard class="shadow-md border-l-4 border-l-[#720923]">
        <!-- View mode -->
        <div v-if="!isEditingMeta" class="flex items-start justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ template.name }}
            </h2>
            <p v-if="template.description" class="text-sm text-gray-500 mt-1">
              {{ template.description }}
            </p>
            <div class="flex items-center gap-3 mt-3">
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
              >
                <UIcon name="i-lucide-help-circle" class="w-3 h-3" />
                {{ template.questions.length }} Fragen
              </span>
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
            </div>
          </div>
          <UButton
            size="sm"
            color="neutral"
            variant="ghost"
            icon="i-lucide-pencil"
            label="Bearbeiten"
            @click="startEditMeta"
          />
        </div>

        <!-- Edit mode -->
        <div v-else class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Vorlagenname" required size="sm">
              <UInput v-model="editedName" size="sm" icon="i-lucide-file-text" />
            </UFormField>
            <UFormField label="Beschreibung" size="sm" hint="Optional">
              <UInput
                v-model="editedDescription"
                size="sm"
                placeholder="Optionale Beschreibung..."
                icon="i-lucide-align-left"
              />
            </UFormField>
          </div>
          <div class="flex justify-end gap-2">
            <UButton
              size="sm"
              color="neutral"
              variant="outline"
              label="Abbrechen"
              icon="i-lucide-x"
              @click="isEditingMeta = false"
            />
            <UButton
              size="sm"
              class="bg-[#720923] hover:bg-[#5a071c] text-white"
              label="Speichern"
              icon="i-lucide-check"
              :disabled="!editedName.trim()"
              @click="saveMeta"
            />
          </div>
        </div>
      </UCard>

      <!-- Questions List -->
      <UCard class="shadow-md">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-[#720923] dark:text-white">Fragen</h3>
            <UButton
              v-if="!showQuestionForm"
              size="sm"
              class="bg-[#720923] hover:bg-[#5a071c] text-white"
              icon="i-lucide-plus"
              label="Frage hinzufuegen"
              @click="openAddQuestion"
            />
          </div>
        </template>

        <!-- Question list -->
        <div v-if="template.questions.length > 0" class="space-y-3">
          <div
            v-for="(question, index) in template.questions"
            :key="question.id"
            class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#720923]/30 transition-colors"
            :class="{ 'ml-8 border-l-4 border-l-amber-300': question.parentQuestionId }"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <!-- Type badge + order number -->
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="text-xs font-mono text-gray-400">{{ index + 1 }}.</span>
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
                    :class="
                      TYPE_COLORS[question.type] || 'bg-gray-100 text-gray-600 border-gray-200'
                    "
                  >
                    {{ TYPE_LABELS[question.type] || question.type }}
                  </span>
                  <span
                    v-if="question.isRequired"
                    class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600"
                  >
                    Pflicht
                  </span>
                </div>

                <!-- Question text -->
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ question.questionText }}
                </p>

                <!-- Options preview (for choice types) -->
                <div v-if="question.options" class="flex flex-wrap gap-1.5 mt-2">
                  <span
                    v-for="(option, optIndex) in JSON.parse(question.options)"
                    :key="optIndex"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                  >
                    {{ option }}
                  </span>
                </div>

                <!-- Conditional indicator -->
                <div
                  v-if="question.parentQuestionId"
                  class="flex items-center gap-1.5 mt-2 text-xs text-amber-600"
                >
                  <UIcon name="i-lucide-git-branch" class="w-3.5 h-3.5" />
                  <span>
                    Bedingt: wenn "{{ getParentQuestionText(question.parentQuestionId) }}..." =
                    {{ question.conditionValue || '?' }}
                  </span>
                </div>

                <!-- Offer text indicator -->
                <div
                  v-if="question.offerText"
                  class="flex items-center gap-1.5 mt-1.5 text-xs text-blue-500"
                >
                  <UIcon name="i-lucide-file-text" class="w-3.5 h-3.5" />
                  <span class="truncate max-w-xs">PDF: {{ question.offerText }}</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-1 flex-shrink-0">
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-chevron-up"
                  :disabled="index === 0"
                  @click="moveQuestion(index, 'up')"
                />
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-chevron-down"
                  :disabled="index === template!.questions.length - 1"
                  @click="moveQuestion(index, 'down')"
                />
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-pencil"
                  @click="openEditQuestion(question)"
                />
                <UButton
                  size="xs"
                  color="error"
                  variant="ghost"
                  icon="i-lucide-trash-2"
                  @click="handleDeleteQuestion(question.id)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="!showQuestionForm" class="text-center py-12">
          <UIcon name="i-lucide-help-circle" class="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p class="text-sm font-medium text-gray-500">Noch keine Fragen</p>
          <p class="text-xs text-gray-400 mt-1">
            Fuegen Sie Fragen hinzu, um den Fragebogen zu gestalten
          </p>
          <UButton
            class="mt-4 bg-[#720923] hover:bg-[#5a071c] text-white"
            size="sm"
            icon="i-lucide-plus"
            label="Erste Frage hinzufuegen"
            @click="openAddQuestion"
          />
        </div>

        <!-- Question Editor Form -->
        <div
          v-if="showQuestionForm"
          class="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/50"
        >
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            {{ editingQuestion ? 'Frage bearbeiten' : 'Neue Frage' }}
          </h4>
          <QuestionnaireQuestionEditor
            :question="editingQuestion"
            :parent-questions="template.questions.filter((q) => q.id !== editingQuestion?.id)"
            @save="handleSaveQuestion"
            @cancel="closeQuestionForm"
          />
        </div>
      </UCard>
    </template>
  </div>
</template>
