<script setup lang="ts">
const items = [
  {
    label: 'Profil',
    icon: 'i-lucide-user',
  },
  {
    label: 'Einstellungen',
    icon: 'i-lucide-settings',
  },
  {
    label: 'Rolle wechseln',
    icon: 'i-lucide-repeat',
  },
  {
    type: 'separator' as const,
  },
  {
    label: 'Abmelden',
    icon: 'i-lucide-log-out',
  },
]
</script>

<template>
  <UDropdownMenu :items="items">
    <UAvatar
      src=""
      alt="Benutzer"
      icon="i-lucide-user"
      size="sm"
      class="cursor-pointer ring-2 ring-transparent hover:ring-wine-200 transition-all"
    />
  </UDropdownMenu>
</template>
