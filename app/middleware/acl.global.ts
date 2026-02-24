/**
 * Global middleware that checks CASL permissions before navigating to a route.
 * If the user lacks permission, they are redirected to the home page.
 *
 * Since auth (Azure AD / JWT) is not yet implemented, this middleware is
 * currently a no-op — it will be activated once the user session is available.
 */
export default defineNuxtRouteMiddleware((to) => {
  // Route-to-permission mapping
  const routePermissions: Record<string, { action: string, subject: string }> = {
    '/admin/benutzer': { action: 'read', subject: 'User' },
    '/admin/rollen': { action: 'read', subject: 'Role' },
    '/admin/einstellungen': { action: 'read', subject: 'Setting' },
  }

  // TODO: Activate once auth session provides user permissions
  // For now, skip permission checks (no user session yet)
  // Once activated, uncomment the block below:

  // const { can } = useAbility()
  //
  // for (const [path, perm] of Object.entries(routePermissions)) {
  //   if (to.path === path || to.path.startsWith(path + '/')) {
  //     if (!can(perm.action as any, perm.subject as any)) {
  //       return navigateTo('/')
  //     }
  //     break
  //   }
  // }
})
