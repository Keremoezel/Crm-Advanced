<script setup lang="ts">
const { isCollapsed, isMobileOpen, toggle, closeMobile } = useSidebar()
const { can } = useAbility()
</script>

<template>
  <!-- Mobile backdrop -->
  <Transition
    enter-active-class="transition-opacity duration-300"
    leave-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isMobileOpen"
      class="fixed inset-0 z-40 bg-black/50 md:hidden"
      @click="closeMobile()"
    />
  </Transition>

  <!-- Sidebar -->
  <aside
    class="fixed top-16 bottom-0 z-40 flex flex-col bg-wine-900 transition-all duration-300 overflow-y-auto overflow-x-hidden"
    :class="[
      isMobileOpen ? 'left-0 w-64' : '-left-64 md:left-0',
      isCollapsed ? 'md:w-16' : 'md:w-64',
    ]"
  >
    <nav class="flex-1 p-2">
      <LayoutAppSidebarItem icon="i-lucide-layout-dashboard" label="Übersicht" to="/" />

      <!-- VERWALTUNG -->
      <LayoutAppSidebarGroup label="Verwaltung">
        <LayoutAppSidebarItem
          icon="i-lucide-user-cog"
          label="Benutzer"
          to="/admin/benutzer"
          :disabled="!can('read', 'User')"
        />
        <LayoutAppSidebarItem
          icon="i-lucide-shield"
          label="Rollen & Rechte"
          to="/admin/rollen"
          :disabled="!can('read', 'Role')"
        />
        <LayoutAppSidebarItem
          icon="i-lucide-settings"
          label="Einstellungen"
          to="/admin/einstellungen"
          :disabled="!can('read', 'Setting')"
        />
        <LayoutAppSidebarItem
          icon="i-lucide-dessert"
          label="Kunden"
          to="/admin/kunden"
          :disabled="!can('read', 'Setting')"
        />
      </LayoutAppSidebarGroup>
    </nav>

    <!-- Collapse toggle (desktop only) -->
    <div class="hidden md:flex items-center justify-center p-2 border-t border-wine-800">
      <UButton
        :icon="isCollapsed ? 'i-lucide-chevron-right' : 'i-lucide-chevron-left'"
        variant="ghost"
        color="neutral"
        size="sm"
        class="text-wine-200 hover:text-white hover:bg-wine-800"
        @click="toggle()"
      />
    </div>
  </aside>
</template>
