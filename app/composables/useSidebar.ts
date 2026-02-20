const isCollapsed = ref(false)
const isMobileOpen = ref(false)

export function useSidebar() {
  if (import.meta.client) {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      isCollapsed.value = saved === 'true'
    }
  }

  function toggle() {
    isCollapsed.value = !isCollapsed.value
    if (import.meta.client) {
      localStorage.setItem('sidebar-collapsed', String(isCollapsed.value))
    }
  }

  function openMobile() {
    isMobileOpen.value = true
  }

  function closeMobile() {
    isMobileOpen.value = false
  }

  return {
    isCollapsed: readonly(isCollapsed),
    isMobileOpen: readonly(isMobileOpen),
    toggle,
    openMobile,
    closeMobile,
  }
}
