import { abilitiesPlugin } from '@casl/vue'
import { defineAbilityFor, type CaslUser } from '~/access-control/ability'

export default defineNuxtPlugin((nuxtApp) => {
  // TODO: Replace with real user session from auth (Azure AD)
  // For now, grant full SuperAdmin access so the app is usable during development.
  // Once auth is implemented, fetch the user's permissions and pass them here.
  const devUser: CaslUser = {
    id: 'dev',
    roleId: 'superadmin',
    permissions: [
      { action: 'manage', subject: 'all', granted: true },
      { action: 'create', subject: 'Lead', granted: true },
      { action: 'read', subject: 'Lead', granted: true },
      { action: 'update', subject: 'Lead', granted: true },
      { action: 'delete', subject: 'Lead', granted: true },
      { action: 'read', subject: 'User', granted: true },
      { action: 'create', subject: 'User', granted: true },
      { action: 'update', subject: 'User', granted: true },
      { action: 'delete', subject: 'User', granted: true },
      { action: 'read', subject: 'Role', granted: true },
      { action: 'manage', subject: 'Role', granted: true },
      { action: 'read', subject: 'Setting', granted: true },
      { action: 'manage', subject: 'Setting', granted: true },
      { action: 'view', subject: 'AdminPanel', granted: true },
      { action: 'read', subject: 'Dashboard', granted: true },
      { action: 'view', subject: 'Dashboard', granted: true },
    ],
  }

  const ability = defineAbilityFor(devUser)

  nuxtApp.vueApp.use(abilitiesPlugin, ability, {
    useGlobalProperties: true,
  })

  return {
    provide: {
      ability,
    },
  }
})
