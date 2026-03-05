<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Contact } from '~/composables/customers/useCustomers'

const props = defineProps<{
  contact: Contact
  index: number
  canDelete: boolean
}>()

const emit = defineEmits<{
  (e: 'setPrimary' | 'remove', index: number): void
  (e: 'update:contact', contact: Contact): void
}>()

const localContact = ref<Contact>({ ...props.contact })

watch(
  localContact,
  (newVal) => {
    emit('update:contact', newVal)
  },
  { deep: true },
)

watch(
  () => props.contact,
  (newVal) => {
    localContact.value = { ...newVal }
  },
  { deep: true },
)
</script>

<template>
  <div
    :class="[
      'border rounded-lg p-4',
      localContact.isPrimary ? 'bg-[#720923]/5 border-[#720923]/20' : 'bg-white border-gray-200',
    ]"
  >
    <!-- Header -->
    <div class="flex justify-between items-center mb-3">
      <div class="flex items-center gap-2">
        <span
          :class="[
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
            localContact.isPrimary
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-gray-50 text-gray-600 border-gray-200',
          ]"
        >
          {{ localContact.isPrimary ? 'Primär' : 'Sekundär' }}
        </span>
        <UButton
          v-if="!localContact.isPrimary"
          size="xs"
          variant="soft"
          color="primary"
          label="Als Primär markieren"
          @click="$emit('setPrimary', index)"
        />
        <h4 class="font-semibold text-gray-800">
          {{ localContact.firstName || 'Neuer Kontakt' }}
        </h4>
      </div>
      <UButton
        v-if="!localContact.isPrimary && canDelete"
        size="xs"
        color="error"
        variant="ghost"
        icon="i-lucide-trash-2"
        label="Löschen"
        @click="$emit('remove', index)"
      />
    </div>

    <!-- Fields -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div>
        <label class="text-xs text-gray-500">Vorname</label>
        <UInput v-model="localContact.firstName" size="sm" placeholder="Vorname" />
      </div>
      <div>
        <label class="text-xs text-gray-500">Nachname</label>
        <UInput v-model="localContact.lastName" size="sm" placeholder="Nachname" />
      </div>
      <div>
        <label class="text-xs text-gray-500">E-Mail</label>
        <UInput v-model="localContact.email" size="sm" placeholder="E-Mail" />
      </div>
      <div>
        <label class="text-xs text-gray-500">Telefon</label>
        <UInput v-model="localContact.phone" size="sm" placeholder="Telefon" />
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
      <div>
        <label class="text-xs text-gray-500">Position</label>
        <UInput v-model="localContact.position" size="sm" placeholder="Position" />
      </div>
      <div>
        <label class="text-xs text-gray-500">Geburtsdatum</label>
        <UInput v-model="localContact.birthDate" size="sm" type="date" />
      </div>
      <div>
        <label class="text-xs text-gray-500">LinkedIn</label>
        <UInput v-model="localContact.linkedin" size="sm" placeholder="LinkedIn URL" />
      </div>
      <div>
        <label class="text-xs text-gray-500">Xing</label>
        <UInput v-model="localContact.xing" size="sm" placeholder="Xing URL" />
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
      <div>
        <label class="text-xs text-gray-500">Facebook</label>
        <UInput v-model="localContact.facebook" size="sm" placeholder="Facebook URL" />
      </div>
      <div class="col-span-2 md:col-span-3">
        <label class="text-xs text-gray-500">Notizen</label>
        <UTextarea v-model="localContact.notes" :rows="2" placeholder="Notizen zum Kontakt..." />
      </div>
    </div>
  </div>
</template>
