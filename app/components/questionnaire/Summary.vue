<script setup lang="ts">
import type { QuestionnaireQuestion } from '~/composables/questionnaires/useTemplates'
import type { AnswerEntry } from '~/composables/questionnaires/useExecution'

const props = defineProps<{
  questions: QuestionnaireQuestion[]
  answers: Map<string, AnswerEntry>
  templateName: string
  companyName: string
  allRequiredAnswered: boolean
}>()

const emit = defineEmits<{
  complete: []
  back: []
}>()

const TYPE_LABELS: Record<string, string> = {
  yes_no: 'Ja / Nein',
  single_choice: 'Einzelauswahl',
  multiple_choice: 'Mehrfachauswahl',
  text: 'Freitext',
  number: 'Zahl',
  rating: 'Bewertung',
}

const formatAnswer = (question: QuestionnaireQuestion): string => {
  const answer = props.answers.get(question.id)
  if (!answer) return 'Nicht beantwortet'

  if (question.type === 'yes_no') {
    return answer.answerValue === 'yes' ? 'Ja' : answer.answerValue === 'no' ? 'Nein' : '-'
  }

  if (question.type === 'multiple_choice' && answer.answerOptions) {
    return answer.answerOptions.join(', ')
  }

  if (question.type === 'rating' && answer.answerValue) {
    return `${answer.answerValue} / 5`
  }

  return answer.answerValue || '-'
}

const isAnswered = (questionId: string): boolean => {
  const answer = props.answers.get(questionId)
  if (!answer) return false
  return !!(answer.answerValue || (answer.answerOptions && answer.answerOptions.length > 0))
}

const unansweredRequired = computed(() => {
  return props.questions.filter((q) => q.isRequired && !isAnswered(q.id))
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <UCard class="shadow-md border-l-4 border-l-[#720923]">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-lg bg-[#720923]/10">
          <UIcon name="i-lucide-list-checks" class="w-6 h-6 text-[#720923]" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">Zusammenfassung</h2>
          <p class="text-sm text-gray-500">{{ templateName }} &middot; {{ companyName }}</p>
        </div>
      </div>
    </UCard>

    <!-- Warning if required questions unanswered -->
    <div
      v-if="unansweredRequired.length > 0"
      class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
    >
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-alert-triangle" class="w-4 h-4 text-yellow-600" />
        <span class="text-sm font-medium text-yellow-800 dark:text-yellow-300">
          {{ unansweredRequired.length }} Pflichtfrage(n) nicht beantwortet
        </span>
      </div>
    </div>

    <!-- Answers list -->
    <UCard class="shadow-md">
      <div class="divide-y divide-gray-100 dark:divide-gray-800">
        <div
          v-for="(question, index) in questions"
          :key="question.id"
          class="py-3 first:pt-0 last:pb-0"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <span class="text-xs font-mono text-gray-400">{{ index + 1 }}.</span>
                <span class="text-xs text-gray-400">{{
                  TYPE_LABELS[question.type] || question.type
                }}</span>
                <span v-if="question.isRequired" class="text-xs font-medium text-red-500"
                  >Pflicht</span
                >
              </div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ question.questionText }}
              </p>
            </div>
            <div class="text-right flex-shrink-0">
              <p
                class="text-sm font-semibold"
                :class="isAnswered(question.id) ? 'text-gray-900 dark:text-white' : 'text-gray-400'"
              >
                {{ formatAnswer(question) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Actions -->
    <div class="flex items-center justify-between">
      <UButton
        size="sm"
        color="neutral"
        variant="outline"
        icon="i-lucide-arrow-left"
        label="Zurueck zu Fragen"
        @click="emit('back')"
      />
      <UButton
        size="sm"
        class="bg-[#720923] hover:bg-[#5a071c] text-white"
        icon="i-lucide-check-circle"
        label="Abschliessen"
        :disabled="!allRequiredAnswered"
        @click="emit('complete')"
      />
    </div>
  </div>
</template>
