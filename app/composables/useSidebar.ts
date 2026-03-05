const isCollapsed = ref(false)
const isMobileOpen = ref(false)
const initialized = ref(false)

export function useSidebar() {
  // Defer localStorage read to onMounted to avoid SSR hydration mismatch.
  // Reading localStorage during setup causes server/client content to differ,
  // which makes sidebar labels flash/disappear on refresh.
  if (import.meta.client && !initialized.value) {
    onMounted(() => {
      if (initialized.value) return
      initialized.value = true
      const saved = localStorage.getItem('sidebar-collapsed')
      if (saved !== null) {
        isCollapsed.value = saved === 'true'
      }
    })
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
