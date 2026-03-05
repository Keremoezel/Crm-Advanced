<script setup lang="ts">
import type { Contact } from '~/composables/customers/useCustomers'

defineProps<{
  contact: Contact
}>()
</script>

<template>
  <div
    :class="[
      'border rounded-lg p-4',
      contact.isPrimary ? 'bg-[#720923]/5 border-[#720923]/20' : 'bg-white border-gray-200',
    ]"
  >
    <!-- Header -->
    <div class="flex justify-between items-center mb-3">
      <div class="flex items-center gap-2">
        <span
          :class="[
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
            contact.isPrimary
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-gray-50 text-gray-600 border-gray-200',
          ]"
        >
          {{ contact.isPrimary ? 'Primär' : 'Sekundär' }}
        </span>
        <h4 class="font-semibold text-gray-800">{{ contact.firstName }} {{ contact.lastName }}</h4>
        <span v-if="contact.position" class="text-xs text-gray-500 italic">
          ({{ contact.position }})
        </span>
      </div>
    </div>

    <!-- Info grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div>
        <label class="text-xs text-gray-500">E-Mail</label>
        <p class="text-sm text-gray-800 break-words">{{ contact.email || '-' }}</p>
      </div>
      <div>
        <label class="text-xs text-gray-500">Telefon</label>
        <p class="text-sm text-gray-800">{{ contact.phone || '-' }}</p>
      </div>
      <div>
        <label class="text-xs text-gray-500">Geburtsdatum</label>
        <p class="text-sm text-gray-800">{{ contact.birthDate || '-' }}</p>
      </div>
      <div>
        <label class="text-xs text-gray-500">Position</label>
        <p class="text-sm text-gray-800">{{ contact.position || '-' }}</p>
      </div>
    </div>

    <!-- Social + Notes -->
    <div
      v-if="contact.linkedin || contact.xing || contact.facebook || contact.notes"
      class="mt-3 pt-3 border-t border-gray-200"
    >
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div v-if="contact.linkedin">
          <label class="text-xs text-gray-500">LinkedIn</label>
          <a
            :href="contact.linkedin"
            target="_blank"
            class="text-xs text-blue-600 hover:underline block truncate"
          >
            {{ contact.linkedin }}
          </a>
        </div>
        <div v-if="contact.xing">
          <label class="text-xs text-gray-500">Xing</label>
          <a
            :href="contact.xing"
            target="_blank"
            class="text-xs text-blue-600 hover:underline block truncate"
          >
            {{ contact.xing }}
          </a>
        </div>
        <div v-if="contact.facebook">
          <label class="text-xs text-gray-500">Facebook</label>
          <a
            :href="contact.facebook"
            target="_blank"
            class="text-xs text-blue-600 hover:underline block truncate"
          >
            {{ contact.facebook }}
          </a>
        </div>
      </div>
      <div v-if="contact.notes" class="mt-2">
        <label class="text-xs text-gray-500">Notizen</label>
        <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ contact.notes }}</p>
      </div>
    </div>
  </div>
</template>
