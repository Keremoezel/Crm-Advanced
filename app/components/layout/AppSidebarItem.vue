<script setup lang="ts">
const props = defineProps<{
  icon: string
  label: string
  to?: string
  disabled?: boolean
}>()

const { isCollapsed } = useSidebar()
const route = useRoute()

const isActive = computed(() => {
  if (!props.to) return false
  return route.path === props.to || route.path.startsWith(props.to + '/')
})
</script>

<template>
  <!-- Disabled state -->
  <UTooltip
    v-if="disabled"
    :text="'Sie haben keine Berechtigung, auf dieses Modul zuzugreifen.'"
    :delay-duration="200"
  >
    <div
      class="flex items-center gap-3 px-3 py-2 rounded-lg opacity-30 cursor-not-allowed select-none text-wine-200"
      :class="isCollapsed ? 'justify-center' : ''"
    >
      <UIcon :name="icon" class="size-5 shrink-0" />
      <span v-if="!isCollapsed" class="text-sm truncate">{{ label }}</span>
    </div>
  </UTooltip>

  <!-- Collapsed state (with tooltip) -->
  <UTooltip
    v-else-if="isCollapsed"
    :text="label"
    :delay-duration="200"
  >
    <NuxtLink
      :to="to"
      class="flex items-center justify-center px-3 py-2 rounded-lg transition-colors"
      :class="
        isActive
          ? 'bg-white/20 text-white'
          : 'text-wine-200 hover:bg-wine-800 hover:text-white'
      "
    >
      <UIcon :name="icon" class="size-5 shrink-0" />
    </NuxtLink>
  </UTooltip>

  <!-- Expanded state -->
  <NuxtLink
    v-else
    :to="to"
    class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
    :class="
      isActive
        ? 'bg-white/20 text-white font-medium'
        : 'text-wine-200 hover:bg-wine-800 hover:text-white'
    "
  >
    <UIcon :name="icon" class="size-5 shrink-0" />
    <span class="text-sm truncate">{{ label }}</span>
  </NuxtLink>
</template>
