<script setup lang="ts">
import type { QuestionnaireQuestion } from '~/composables/questionnaires/useTemplates'

const props = defineProps<{
  question: QuestionnaireQuestion
  answerValue: string | null
  answerOptions: string[] | null
}>()

const emit = defineEmits<{
  answer: [value: string | null, options?: string[] | null]
}>()

// Parse options from JSON
const options = computed(() => {
  if (!props.question.options) return []
  try {
    return JSON.parse(props.question.options) as string[]
  } catch {
    return []
  }
})

// Yes/No handler
const handleYesNo = (value: string) => {
  emit('answer', value)
}

// Single choice handler
const handleSingleChoice = (value: string) => {
  emit('answer', value)
}

// Multiple choice handler
const selectedOptions = computed(() => {
  return props.answerOptions || []
})

const toggleOption = (option: string) => {
  const current = [...selectedOptions.value]
  const index = current.indexOf(option)
  if (index >= 0) {
    current.splice(index, 1)
  } else {
    current.push(option)
  }
  emit('answer', null, current)
}

// Text handler
const textValue = computed({
  get: () => props.answerValue || '',
  set: (val: string) => emit('answer', val || null),
})

// Number handler
const numberValue = computed({
  get: () => props.answerValue || '',
  set: (val: string) => emit('answer', val || null),
})

// Rating handler
const handleRating = (value: number) => {
  emit('answer', String(value))
}

const currentRating = computed(() => {
  return props.answerValue ? Number(props.answerValue) : 0
})
</script>

<template>
  <div class="space-y-4">
    <!-- Question text -->
    <div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ question.questionText }}
        <span v-if="question.isRequired" class="text-red-500 ml-1">*</span>
      </h3>
    </div>

    <!-- Yes / No -->
    <div v-if="question.type === 'yes_no'" class="flex gap-3">
      <button
        class="flex-1 py-4 px-6 rounded-lg border-2 text-center font-medium transition-all"
        :class="
          answerValue === 'yes'
            ? 'border-green-500 bg-green-50 text-green-700'
            : 'border-gray-200 hover:border-green-300 text-gray-600 hover:bg-green-50/50'
        "
        @click="handleYesNo('yes')"
      >
        <UIcon name="i-lucide-check" class="w-6 h-6 mx-auto mb-1" />
        <span class="block">Ja</span>
      </button>
      <button
        class="flex-1 py-4 px-6 rounded-lg border-2 text-center font-medium transition-all"
        :class="
          answerValue === 'no'
            ? 'border-red-500 bg-red-50 text-red-700'
            : 'border-gray-200 hover:border-red-300 text-gray-600 hover:bg-red-50/50'
        "
        @click="handleYesNo('no')"
      >
        <UIcon name="i-lucide-x" class="w-6 h-6 mx-auto mb-1" />
        <span class="block">Nein</span>
      </button>
    </div>

    <!-- Single Choice -->
    <div v-else-if="question.type === 'single_choice'" class="space-y-2">
      <button
        v-for="option in options"
        :key="option"
        class="w-full py-3 px-4 rounded-lg border-2 text-left font-medium transition-all flex items-center gap-3"
        :class="
          answerValue === option
            ? 'border-[#720923] bg-[#720923]/5 text-[#720923]'
            : 'border-gray-200 hover:border-[#720923]/30 text-gray-600'
        "
        @click="handleSingleChoice(option)"
      >
        <div
          class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
          :class="answerValue === option ? 'border-[#720923]' : 'border-gray-300'"
        >
          <div v-if="answerValue === option" class="w-2.5 h-2.5 rounded-full bg-[#720923]" />
        </div>
        {{ option }}
      </button>
    </div>

    <!-- Multiple Choice -->
    <div v-else-if="question.type === 'multiple_choice'" class="space-y-2">
      <button
        v-for="option in options"
        :key="option"
        class="w-full py-3 px-4 rounded-lg border-2 text-left font-medium transition-all flex items-center gap-3"
        :class="
          selectedOptions.includes(option)
            ? 'border-[#720923] bg-[#720923]/5 text-[#720923]'
            : 'border-gray-200 hover:border-[#720923]/30 text-gray-600'
        "
        @click="toggleOption(option)"
      >
        <div
          class="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0"
          :class="
            selectedOptions.includes(option) ? 'border-[#720923] bg-[#720923]' : 'border-gray-300'
          "
        >
          <UIcon
            v-if="selectedOptions.includes(option)"
            name="i-lucide-check"
            class="w-3.5 h-3.5 text-white"
          />
        </div>
        {{ option }}
      </button>
    </div>

    <!-- Text -->
    <div v-else-if="question.type === 'text'">
      <UTextarea v-model="textValue" placeholder="Ihre Antwort eingeben..." :rows="4" />
    </div>

    <!-- Number -->
    <div v-else-if="question.type === 'number'" class="max-w-xs">
      <UInput v-model="numberValue" type="number" placeholder="Zahl eingeben..." size="lg" />
    </div>

    <!-- Rating (1-5) -->
    <div v-else-if="question.type === 'rating'" class="flex gap-2">
      <button
        v-for="n in 5"
        :key="n"
        class="w-14 h-14 rounded-lg border-2 text-center text-lg font-bold transition-all"
        :class="
          currentRating >= n
            ? 'border-amber-400 bg-amber-50 text-amber-600'
            : 'border-gray-200 hover:border-amber-300 text-gray-400 hover:bg-amber-50/50'
        "
        @click="handleRating(n)"
      >
        {{ n }}
      </button>
    </div>
  </div>
</template>
