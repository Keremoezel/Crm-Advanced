<script setup lang="ts">
import type { QuestionnaireQuestion } from '~/composables/questionnaires/useTemplates'

const props = defineProps<{
  question?: QuestionnaireQuestion | null
  parentQuestions?: QuestionnaireQuestion[]
}>()

const emit = defineEmits<{
  save: [
    data: {
      type: string
      questionText: string
      options?: string[]
      isRequired: boolean
      offerText?: string
      parentQuestionId?: string
      conditionValue?: string
    },
  ]
  cancel: []
}>()

const QUESTION_TYPES = [
  { value: 'yes_no', label: 'Ja / Nein', icon: 'i-lucide-toggle-left' },
  { value: 'single_choice', label: 'Einzelauswahl', icon: 'i-lucide-circle-dot' },
  { value: 'multiple_choice', label: 'Mehrfachauswahl', icon: 'i-lucide-check-square' },
  { value: 'text', label: 'Freitext', icon: 'i-lucide-text' },
  { value: 'number', label: 'Zahl', icon: 'i-lucide-hash' },
  { value: 'rating', label: 'Bewertung (1-5)', icon: 'i-lucide-star' },
]

const form = ref({
  type: props.question?.type || 'yes_no',
  questionText: props.question?.questionText || '',
  isRequired: props.question?.isRequired || false,
  offerText: props.question?.offerText || '',
  parentQuestionId: props.question?.parentQuestionId || '',
  conditionValue: props.question?.conditionValue || '',
})

const optionsList = ref<string[]>(
  props.question?.options ? JSON.parse(props.question.options) : [''],
)

const isConditional = ref(!!props.question?.parentQuestionId)

const needsOptions = computed(() => ['single_choice', 'multiple_choice'].includes(form.value.type))

const addOption = () => {
  optionsList.value.push('')
}

const removeOption = (index: number) => {
  if (optionsList.value.length > 1) {
    optionsList.value.splice(index, 1)
  }
}

interface QuestionSaveData {
  type: string
  questionText: string
  options?: string[]
  isRequired: boolean
  offerText?: string
  parentQuestionId?: string
  conditionValue?: string
}

const handleSave = () => {
  if (!form.value.questionText.trim()) return

  const data: QuestionSaveData = {
    type: form.value.type,
    questionText: form.value.questionText.trim(),
    isRequired: form.value.isRequired,
    offerText: form.value.offerText?.trim() || undefined,
  }

  if (needsOptions.value) {
    data.options = optionsList.value.filter((o) => o.trim())
  }

  if (isConditional.value && form.value.parentQuestionId) {
    data.parentQuestionId = form.value.parentQuestionId
    data.conditionValue = form.value.conditionValue || undefined
  }

  emit('save', data)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Row 1: Type + Required -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="sm:col-span-2">
        <UFormField label="Fragetyp" size="sm">
          <USelectMenu
            v-model="form.type"
            :items="QUESTION_TYPES.map((t) => ({ label: t.label, value: t.value }))"
            value-key="value"
            size="sm"
            class="w-full"
          />
        </UFormField>
      </div>
      <div class="flex items-end pb-1">
        <USwitch v-model="form.isRequired" label="Pflichtfrage" size="sm" color="error" />
      </div>
    </div>

    <!-- Row 2: Question Text -->
    <UFormField label="Fragetext" size="sm" required>
      <UTextarea
        v-model="form.questionText"
        placeholder="z.B. Haben Sie Interesse an unserem Angebot?"
        :rows="2"
        autofocus
      />
    </UFormField>

    <!-- Row 3: Options (for choice types) -->
    <div v-if="needsOptions">
      <UFormField label="Antwortmöglichkeiten" size="sm">
        <div class="space-y-2">
          <div v-for="(_, index) in optionsList" :key="index" class="flex gap-2 items-center">
            <span class="text-xs text-gray-400 w-5 text-right flex-shrink-0">{{ index + 1 }}.</span>
            <UInput
              v-model="optionsList[index]"
              :placeholder="`Option ${index + 1}`"
              size="sm"
              class="flex-1"
            />
            <UButton
              v-if="optionsList.length > 1"
              icon="i-lucide-x"
              color="error"
              variant="ghost"
              size="xs"
              @click="removeOption(index)"
            />
          </div>
          <UButton
            size="xs"
            variant="soft"
            color="neutral"
            icon="i-lucide-plus"
            label="Option hinzufügen"
            @click="addOption"
          />
        </div>
      </UFormField>
    </div>

    <USeparator />

    <!-- Row 4: Offer Text -->
    <UFormField
      label="Angebotstext (für PDF)"
      size="sm"
      help="Wird in die PDF-Offerte übernommen, wenn die Frage positiv beantwortet wird."
    >
      <UTextarea
        v-model="form.offerText"
        placeholder="Text, der im Angebot erscheint, wenn positiv beantwortet..."
        :rows="2"
      />
    </UFormField>

    <USeparator />

    <!-- Row 5: Conditional Logic -->
    <div>
      <USwitch
        v-model="isConditional"
        label="Bedingte Frage"
        description="Nur anzeigen, wenn eine andere Frage bestimmte Antwort hat"
        size="sm"
      />
      <div
        v-if="isConditional && parentQuestions?.length"
        class="mt-3 ml-12 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <UFormField label="Elternfrage" size="sm">
          <USelectMenu
            v-model="form.parentQuestionId"
            :items="
              (parentQuestions || []).map((q) => ({
                label: q.questionText.substring(0, 50),
                value: q.id,
              }))
            "
            value-key="value"
            placeholder="Frage wählen..."
            size="sm"
          />
        </UFormField>
        <UFormField label="Bedingungswert" size="sm" help="z.B. 'yes' oder 'nein'">
          <UInput v-model="form.conditionValue" placeholder="z.B. yes" size="sm" />
        </UFormField>
      </div>
      <div
        v-else-if="isConditional && !parentQuestions?.length"
        class="mt-2 ml-12 text-xs text-gray-400"
      >
        Keine anderen Fragen vorhanden, die als Bedingung dienen können.
      </div>
    </div>

    <USeparator />

    <!-- Actions -->
    <div class="flex justify-end gap-2">
      <UButton
        size="sm"
        color="neutral"
        variant="outline"
        label="Abbrechen"
        icon="i-lucide-x"
        @click="emit('cancel')"
      />
      <UButton
        size="sm"
        class="bg-[#720923] hover:bg-[#5a071c] text-white"
        label="Speichern"
        icon="i-lucide-check"
        :disabled="!form.questionText.trim()"
        @click="handleSave"
      />
    </div>
  </div>
</template>
