<script setup lang="ts">
const { openMobile } = useSidebar()
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 flex items-center h-16 px-4 bg-wine-950 text-white">
    <!-- Left: Hamburger (mobile) + Brand -->
    <div class="flex items-center gap-3">
      <UButton
        icon="i-lucide-menu"
        variant="ghost"
        color="neutral"
        size="sm"
        class="md:hidden text-white hover:bg-wine-800"
        @click="openMobile()"
      />
      <NuxtLink to="/" class="flex items-center gap-2">
        <UIcon name="i-lucide-briefcase" class="size-6 text-wine-300" />
        <span class="text-lg font-bold text-white hidden sm:block">CRM</span>
      </NuxtLink>
    </div>

    <!-- Center: Search -->
    <div class="flex-1 max-w-md mx-4 hidden sm:block">
      <div class="flex items-center gap-2 px-3 py-1.5 bg-wine-900/80 rounded-lg text-wine-300 text-sm cursor-pointer hover:bg-wine-900 transition-colors">
        <UIcon name="i-lucide-search" class="size-4" />
        <span>Suchen... (Cmd+K)</span>
      </div>
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center gap-2 ml-auto">
      <!-- Mobile search -->
      <UButton
        icon="i-lucide-search"
        variant="ghost"
        color="neutral"
        size="sm"
        class="sm:hidden text-white hover:bg-wine-800"
      />

      <!-- Notifications -->
      <div class="relative">
        <UButton
          icon="i-lucide-bell"
          variant="ghost"
          color="neutral"
          size="sm"
          class="text-white hover:bg-wine-800"
        />
        <span class="absolute -top-0.5 -right-0.5 flex items-center justify-center size-4 text-[10px] font-bold text-wine-900 bg-white rounded-full">
          3
        </span>
      </div>

      <!-- User Menu -->
      <LayoutAppUserMenu />
    </div>
  </header>
</template>
