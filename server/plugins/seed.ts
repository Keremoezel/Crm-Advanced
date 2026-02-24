import { seedRoles } from '../db/seed'

export default defineNitroPlugin((nitroApp) => {
  // NuxtHub applies migrations after plugins load,
  // so we hook into the first request to seed after tables exist.
  let seeded = false
  nitroApp.hooks.hook('request', async () => {
    if (seeded) return
    seeded = true
    try {
      await seedRoles()
    }
    catch (error) {
      console.error('[seed] Failed to seed database:', error)
      seeded = false
    }
  })
})
