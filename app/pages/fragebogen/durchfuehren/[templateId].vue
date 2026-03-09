<script setup lang="ts">
import { useQuestionnaireExecution } from '~/composables/questionnaires/useExecution'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const toast = useToast()

const templateId = route.params.templateId as string

const {
  template,
  submissionId,
  isLoading,
  isSaving,
  isCompleted,
  visibleQuestions,
  answers,
  currentQuestion,
  currentIndex,
  progress,
  canGoPrev,
  isLastQuestion,
  allRequiredAnswered,
  loadTemplate,
  startSubmission,
  goNext,
  goPrev,
  setAnswer,
  getAnswer,
  saveAnswers,
  completeSubmission,
} = useQuestionnaireExecution(templateId)

// Customer selection
const selectedCompanyId = ref<number | null>(null)
const companySearch = ref('')
const companies = ref<
  Array<{ id: number; name: string; industry: string | null; city: string | null }>
>([])
const isLoadingCompanies = ref(false)
const hasStarted = ref(false)
const showSummary = ref(false)

// Load companies for selector
const searchCompanies = async () => {
  isLoadingCompanies.value = true
  try {
    const result = await $fetch<{
      data: Array<{
        id: number
        name: string
        industry: string | null
        city: string | null
      }>
    }>('/api/customers', {
      query: { search: companySearch.value, limit: 20 },
    })
    companies.value = result.data || []
  } catch {
    companies.value = []
  } finally {
    isLoadingCompanies.value = false
  }
}

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(companySearch, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(searchCompanies, 300)
})

// Load template on mount
await loadTemplate()
await searchCompanies()

// Start the questionnaire
const handleStart = async () => {
  if (!selectedCompanyId.value) {
    toast.add({ title: 'Bitte Kunden auswaehlen', color: 'warning' })
    return
  }
  try {
    await startSubmission(selectedCompanyId.value)
    hasStarted.value = true
  } catch {
    toast.add({ title: 'Fehler beim Starten', color: 'error' })
  }
}

// Handle answer from renderer
const handleAnswer = (value: string | null, options?: string[] | null) => {
  if (!currentQuestion.value) return
  setAnswer(currentQuestion.value.id, value, options)
}

// Auto-save on navigation
const handleNext = async () => {
  await saveAnswers()
  goNext()
}

const handlePrev = () => {
  goPrev()
}

// Show summary
const handleShowSummary = async () => {
  await saveAnswers()
  showSummary.value = true
}

// Complete
const handleComplete = async () => {
  try {
    await completeSubmission()
    toast.add({ title: 'Fragebogen abgeschlossen', color: 'success' })
  } catch {
    toast.add({ title: 'Fehler beim Abschliessen', color: 'error' })
  }
}

// Get selected company name
const selectedCompanyName = computed(() => {
  const company = companies.value.find((c) => c.id === selectedCompanyId.value)
  return company?.name || ''
})

// Current answer for the renderer
const currentAnswerValue = computed(() => {
  if (!currentQuestion.value) return null
  const answer = getAnswer(currentQuestion.value.id)
  return answer?.answerValue ?? null
})

const currentAnswerOptions = computed(() => {
  if (!currentQuestion.value) return null
  const answer = getAnswer(currentQuestion.value.id)
  return answer?.answerOptions ?? null
})
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <!-- Back -->
    <UButton
      icon="i-lucide-arrow-left"
      label="Zurueck"
      color="neutral"
      variant="ghost"
      @click="router.push('/fragebogen')"
    />

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-16">
      <UIcon name="i-lucide-loader-2" class="w-10 h-10 text-[#720923] animate-spin mx-auto" />
      <p class="mt-4 text-sm text-gray-500">Lade Fragebogen...</p>
    </div>

    <template v-else-if="template">
      <!-- STEP 1: Company Selection (before start) -->
      <template v-if="!hasStarted">
        <UCard class="shadow-md border-l-4 border-l-[#720923]">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2.5 rounded-lg bg-[#720923]/10">
              <UIcon name="i-lucide-clipboard-list" class="w-6 h-6 text-[#720923]" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ template.name }}</h2>
              <p v-if="template.description" class="text-sm text-gray-500">
                {{ template.description }}
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="text-xs font-medium text-gray-500 mb-1.5 block">
                Kunde auswaehlen
              </label>
              <UInput
                v-model="companySearch"
                icon="i-lucide-search"
                placeholder="Kunde suchen..."
                size="sm"
                class="mb-2"
              />
              <div
                class="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div v-if="isLoadingCompanies" class="text-center py-4">
                  <UIcon
                    name="i-lucide-loader-2"
                    class="w-5 h-5 text-gray-400 animate-spin mx-auto"
                  />
                </div>
                <div
                  v-else-if="companies.length === 0"
                  class="text-center py-4 text-sm text-gray-400"
                >
                  Keine Kunden gefunden
                </div>
                <button
                  v-for="company in companies"
                  v-else
                  :key="company.id"
                  class="w-full py-2.5 px-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
                  :class="
                    selectedCompanyId === company.id
                      ? 'bg-[#720923]/5 border-l-2 border-l-[#720923]'
                      : ''
                  "
                  @click="selectedCompanyId = company.id"
                >
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ company.name }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{
                        [company.industry, company.city].filter(Boolean).join(' · ') ||
                        'Keine Details'
                      }}
                    </p>
                  </div>
                  <UIcon
                    v-if="selectedCompanyId === company.id"
                    name="i-lucide-check"
                    class="w-4 h-4 text-[#720923]"
                  />
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-gray-100">
              <p class="text-xs text-gray-400">
                {{ template.questions.length }} Fragen in dieser Vorlage
              </p>
              <UButton
                class="bg-[#720923] hover:bg-[#5a071c] text-white"
                size="sm"
                icon="i-lucide-play"
                label="Fragebogen starten"
                :disabled="!selectedCompanyId"
                @click="handleStart"
              />
            </div>
          </div>
        </UCard>
      </template>

      <!-- STEP 2: Questionnaire execution -->
      <template v-else-if="!showSummary && !isCompleted">
        <!-- Progress bar -->
        <UCard class="shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm font-medium text-gray-600">
              Frage {{ currentIndex + 1 }} von {{ visibleQuestions.length }}
            </p>
            <p class="text-sm font-medium text-[#720923]">{{ progress }}%</p>
          </div>
          <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-[#720923] to-[#9e1e3e] rounded-full transition-all duration-300"
              :style="{ width: `${progress}%` }"
            />
          </div>
          <p class="text-xs text-gray-400 mt-2">
            Kunde: <span class="font-medium text-gray-600">{{ selectedCompanyName }}</span>
          </p>
        </UCard>

        <!-- Question -->
        <UCard v-if="currentQuestion" class="shadow-md">
          <QuestionnaireQuestionRenderer
            :question="currentQuestion"
            :answer-value="currentAnswerValue"
            :answer-options="currentAnswerOptions"
            @answer="handleAnswer"
          />

          <!-- Navigation -->
          <div class="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
            <UButton
              size="sm"
              color="neutral"
              variant="outline"
              icon="i-lucide-chevron-left"
              label="Zurueck"
              :disabled="!canGoPrev"
              @click="handlePrev"
            />
            <div class="flex gap-2">
              <UButton
                v-if="!isLastQuestion"
                size="sm"
                class="bg-[#720923] hover:bg-[#5a071c] text-white"
                label="Weiter"
                icon="i-lucide-chevron-right"
                trailing
                :loading="isSaving"
                @click="handleNext"
              />
              <UButton
                v-else
                size="sm"
                class="bg-[#720923] hover:bg-[#5a071c] text-white"
                label="Zusammenfassung"
                icon="i-lucide-list-checks"
                :loading="isSaving"
                @click="handleShowSummary"
              />
            </div>
          </div>
        </UCard>
      </template>

      <!-- STEP 3: Summary -->
      <template v-else-if="showSummary && !isCompleted">
        <QuestionnaireSummary
          :questions="visibleQuestions"
          :answers="answers"
          :template-name="template.name"
          :company-name="selectedCompanyName"
          :all-required-answered="allRequiredAnswered"
          @complete="handleComplete"
          @back="showSummary = false"
        />
      </template>

      <!-- STEP 4: Completed -->
      <template v-else-if="isCompleted">
        <UCard class="shadow-md">
          <div class="text-center py-8">
            <div
              class="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4"
            >
              <UIcon name="i-lucide-check-circle-2" class="w-10 h-10 text-green-600" />
            </div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Fragebogen abgeschlossen
            </h2>
            <p class="text-sm text-gray-500 mb-6">
              {{ template.name }} fuer {{ selectedCompanyName }}
            </p>
          </div>

          <USeparator class="my-4" />

          <!-- PDF Actions inline -->
          <div v-if="submissionId" class="max-w-md mx-auto">
            <QuestionnairePdfActions :submission-id="submissionId" />
          </div>

          <USeparator class="my-4" />

          <div class="flex justify-center">
            <UButton
              size="sm"
              color="neutral"
              variant="outline"
              icon="i-lucide-arrow-left"
              label="Zurueck zu Vorlagen"
              @click="router.push('/fragebogen')"
            />
          </div>
        </UCard>
      </template>
    </template>
  </div>
</template>
