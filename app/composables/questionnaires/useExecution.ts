import type { QuestionnaireQuestion, TemplateWithQuestions } from './useTemplates'

export interface AnswerEntry {
  questionId: string
  answerValue: string | null
  answerOptions: string[] | null
}

export interface SubmissionData {
  id: string
  templateId: string
  companyId: number
  status: string
  answers: Array<{
    id: string
    questionId: string
    answerValue: string | null
    answerOptions: string | null
  }>
  template: TemplateWithQuestions
  company: {
    id: number
    name: string
    industry: string | null
    city: string | null
  }
}

export function useQuestionnaireExecution(templateId: string) {
  const template = ref<TemplateWithQuestions | null>(null)
  const submissionId = ref<string | null>(null)
  const answers = ref<Map<string, AnswerEntry>>(new Map())
  const currentIndex = ref(0)
  const isLoading = ref(true)
  const isSaving = ref(false)
  const isCompleted = ref(false)

  // Load template
  const loadTemplate = async () => {
    isLoading.value = true
    try {
      template.value = await $fetch<TemplateWithQuestions>(
        `/api/questionnaires/templates/${templateId}`,
      )
    } finally {
      isLoading.value = false
    }
  }

  // Start a submission
  const startSubmission = async (companyId: number) => {
    const result = await $fetch<{ id: string }>('/api/questionnaires/submissions', {
      method: 'POST',
      body: { templateId, companyId },
    })
    submissionId.value = result.id
    return result.id
  }

  // Get visible questions based on conditional logic
  const visibleQuestions = computed((): QuestionnaireQuestion[] => {
    if (!template.value) return []

    return template.value.questions.filter((q) => {
      // No parent = always visible
      if (!q.parentQuestionId) return true

      // Has parent — check if parent was answered with matching conditionValue
      const parentAnswer = answers.value.get(q.parentQuestionId)
      if (!parentAnswer) return false

      // If no conditionValue set, show when parent has any answer
      if (!q.conditionValue) return !!parentAnswer.answerValue

      // Match condition value (case-insensitive)
      return parentAnswer.answerValue?.toLowerCase() === q.conditionValue.toLowerCase()
    })
  })

  // Current question
  const currentQuestion = computed(() => {
    return visibleQuestions.value[currentIndex.value] || null
  })

  // Progress
  const progress = computed(() => {
    const total = visibleQuestions.value.length
    if (total === 0) return 0
    const answered = visibleQuestions.value.filter((q) => answers.value.has(q.id)).length
    return Math.round((answered / total) * 100)
  })

  const canGoNext = computed(() => {
    return currentIndex.value < visibleQuestions.value.length - 1
  })

  const canGoPrev = computed(() => {
    return currentIndex.value > 0
  })

  const isLastQuestion = computed(() => {
    return currentIndex.value === visibleQuestions.value.length - 1
  })

  // Navigation
  const goNext = () => {
    if (canGoNext.value) {
      currentIndex.value++
    }
  }

  const goPrev = () => {
    if (canGoPrev.value) {
      currentIndex.value--
    }
  }

  // Set answer
  const setAnswer = (questionId: string, value: string | null, options?: string[] | null) => {
    answers.value.set(questionId, {
      questionId,
      answerValue: value,
      answerOptions: options || null,
    })
  }

  // Get answer for a question
  const getAnswer = (questionId: string): AnswerEntry | undefined => {
    return answers.value.get(questionId)
  }

  // Save current answers to server
  const saveAnswers = async (status: 'in_progress' | 'completed' = 'in_progress') => {
    if (!submissionId.value) return
    isSaving.value = true
    try {
      const answerArray = Array.from(answers.value.values())
      await $fetch(`/api/questionnaires/submissions/${submissionId.value}`, {
        method: 'PUT',
        body: {
          answers: answerArray,
          status,
        },
      })
      if (status === 'completed') {
        isCompleted.value = true
      }
    } finally {
      isSaving.value = false
    }
  }

  // Complete the submission
  const completeSubmission = async () => {
    await saveAnswers('completed')
  }

  // Check if all required questions are answered
  const allRequiredAnswered = computed(() => {
    return visibleQuestions.value
      .filter((q) => q.isRequired)
      .every((q) => {
        const answer = answers.value.get(q.id)
        return (
          answer &&
          (answer.answerValue || (answer.answerOptions && answer.answerOptions.length > 0))
        )
      })
  })

  return {
    template,
    submissionId,
    answers,
    currentIndex,
    isLoading,
    isSaving,
    isCompleted,
    visibleQuestions,
    currentQuestion,
    progress,
    canGoNext,
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
  }
}
