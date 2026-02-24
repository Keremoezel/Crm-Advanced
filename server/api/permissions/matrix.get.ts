export default defineEventHandler(() => {
  return {
    actions: ACTIONS,
    subjects: SUBJECTS,
    roleDefaults: DEFAULT_ROLE_PERMISSIONS,
  }
})
