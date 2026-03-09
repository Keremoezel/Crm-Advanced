<script setup lang="ts">
const props = defineProps<{
  submissionId: string
}>()

const toast = useToast()
const isGenerating = ref(false)
const isSending = ref(false)
const pdfGenerated = ref(false)

// Generate PDF
const generatePdf = async () => {
  isGenerating.value = true
  try {
    await $fetch(`/api/questionnaires/submissions/${props.submissionId}/pdf`, {
      method: 'POST',
    })
    pdfGenerated.value = true
    toast.add({ title: 'PDF erstellt', color: 'success' })
  } catch {
    toast.add({ title: 'Fehler beim Erstellen des PDFs', color: 'error' })
  } finally {
    isGenerating.value = false
  }
}

// Download PDF
const downloadPdf = () => {
  window.open(`/api/questionnaires/submissions/${props.submissionId}/pdf`, '_blank')
}

// Send via email (placeholder)
const sendViaEmail = async () => {
  isSending.value = true
  try {
    const result = await $fetch<{ message: string }>(
      `/api/questionnaires/submissions/${props.submissionId}/send`,
      {
        method: 'POST',
        body: { method: 'email' },
      },
    )
    toast.add({ title: 'E-Mail', description: result.message, color: 'info' })
  } catch {
    toast.add({ title: 'Fehler beim Senden', color: 'error' })
  } finally {
    isSending.value = false
  }
}

// Send via Teams (placeholder)
const sendViaTeams = async () => {
  isSending.value = true
  try {
    const result = await $fetch<{ message: string }>(
      `/api/questionnaires/submissions/${props.submissionId}/send`,
      {
        method: 'POST',
        body: { method: 'teams' },
      },
    )
    toast.add({ title: 'Teams', description: result.message, color: 'info' })
  } catch {
    toast.add({ title: 'Fehler beim Senden', color: 'error' })
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Generate -->
    <div v-if="!pdfGenerated">
      <UButton
        block
        size="lg"
        class="bg-[#720923] hover:bg-[#5a071c] text-white"
        icon="i-lucide-file-text"
        label="PDF erstellen"
        :loading="isGenerating"
        @click="generatePdf"
      />
    </div>

    <!-- Actions after generation -->
    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <!-- Download -->
        <UButton
          block
          size="sm"
          class="bg-[#720923] hover:bg-[#5a071c] text-white"
          icon="i-lucide-download"
          label="Herunterladen"
          @click="downloadPdf"
        />

        <!-- Email -->
        <UButton
          block
          size="sm"
          color="neutral"
          variant="outline"
          icon="i-lucide-mail"
          label="Per E-Mail"
          :loading="isSending"
          @click="sendViaEmail"
        />

        <!-- Teams -->
        <UButton
          block
          size="sm"
          color="neutral"
          variant="outline"
          icon="i-lucide-message-square"
          label="Per Teams"
          :loading="isSending"
          @click="sendViaTeams"
        />
      </div>

      <p class="text-xs text-gray-400 text-center">
        E-Mail- und Teams-Versand sind als Platzhalter konfiguriert.
      </p>
    </template>
  </div>
</template>
