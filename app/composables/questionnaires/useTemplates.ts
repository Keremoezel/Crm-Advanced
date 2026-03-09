export interface QuestionnaireTemplate {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  questionCount: number
}

export interface QuestionnaireQuestion {
  id: string
  templateId: string
  parentQuestionId: string | null
  conditionValue: string | null
  sortOrder: number
  type: string
  questionText: string
  options: string | null
  isRequired: boolean
  offerText: string | null
}

export interface TemplateWithQuestions extends Omit<QuestionnaireTemplate, 'questionCount'> {
  questions: QuestionnaireQuestion[]
}

export function useQuestionnaireTemplates() {
  const {
    data: templatesRaw,
    status,
    refresh,
  } = useFetch<QuestionnaireTemplate[]>('/api/questionnaires/templates', {
    default: () => [],
  })

  const templates = computed(() => templatesRaw.value || [])

  const createTemplate = async (name: string, description?: string) => {
    const result = await $fetch('/api/questionnaires/templates', {
      method: 'POST',
      body: { name, description },
    })
    await refresh()
    return result
  }

  const updateTemplate = async (
    id: string,
    data: { name?: string; description?: string; isActive?: boolean },
  ) => {
    const result = await $fetch(`/api/questionnaires/templates/${id}`, {
      method: 'PUT',
      body: data,
    })
    await refresh()
    return result
  }

  const deleteTemplate = async (id: string) => {
    await $fetch(`/api/questionnaires/templates/${id}`, {
      method: 'DELETE',
    })
    await refresh()
  }

  const fetchTemplate = async (id: string): Promise<TemplateWithQuestions> => {
    return await $fetch<TemplateWithQuestions>(`/api/questionnaires/templates/${id}`)
  }

  const addQuestion = async (
    templateId: string,
    question: {
      type: string
      questionText: string
      options?: string[]
      isRequired?: boolean
      offerText?: string
      parentQuestionId?: string
      conditionValue?: string
    },
  ) => {
    return await $fetch(`/api/questionnaires/templates/${templateId}/questions`, {
      method: 'POST',
      body: question,
    })
  }

  const updateQuestion = async (
    questionId: string,
    data: Partial<QuestionnaireQuestion> & { options?: string[] },
  ) => {
    return await $fetch(`/api/questionnaires/questions/${questionId}`, {
      method: 'PUT',
      body: data,
    })
  }

  const deleteQuestion = async (questionId: string) => {
    await $fetch(`/api/questionnaires/questions/${questionId}`, {
      method: 'DELETE',
    })
  }

  const reorderQuestions = async (templateId: string, order: string[]) => {
    await $fetch(`/api/questionnaires/templates/${templateId}/questions`, {
      method: 'PUT',
      body: { order },
    })
  }

  return {
    templates,
    status,
    refresh,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    fetchTemplate,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
  }
}
