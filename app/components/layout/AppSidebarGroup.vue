<script setup lang="ts">
defineProps<{
  label: string
}>()

const { isCollapsed } = useSidebar()
const isOpen = ref(true)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="mt-3 first:mt-0">
    <!-- Group header — completely hidden when sidebar is collapsed -->
    <button
      v-if="!isCollapsed"
      class="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold tracking-wider text-wine-300 uppercase hover:text-wine-100 transition-colors"
      @click="toggle"
    >
      <span>{{ label }}</span>
      <UIcon
        name="i-lucide-chevron-down"
        class="size-3.5 transition-transform duration-200"
        :class="isOpen ? '' : '-rotate-90'"
      />
    </button>

    <!-- Items slot -->
    <div
      v-show="isCollapsed || isOpen"
      class="flex flex-col gap-0.5"
      :class="isCollapsed ? 'mt-0' : 'mt-0.5'"
    >
      <slot />
    </div>
  </div>
</template>
