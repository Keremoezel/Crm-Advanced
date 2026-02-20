// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxthub/core',
    '@nuxt/eslint',
    '@nuxt/ui'
  ],
  devtools: { enabled: true },
  compatibilityDate: '2025-12-11',
  css: ['~/assets/css/main.css'],

  hub: {
    db: 'sqlite',
    kv: true,
    blob: true,
    cache: true,
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },
})
