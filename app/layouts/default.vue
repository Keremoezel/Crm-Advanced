<script setup lang="ts">
const { isCollapsed } = useSidebar()
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <LayoutAppNavbar />
    <LayoutAppSidebar />

    <!-- Main content area -->
    <main
      class="pt-16 transition-all duration-300"
      :class="[
        // Desktop: offset by sidebar width
        isCollapsed ? 'md:pl-16' : 'md:pl-64',
      ]"
    >
      <div class="p-4 lg:p-6">
        <slot />
      </div>
    </main>
  </div>
</template>
