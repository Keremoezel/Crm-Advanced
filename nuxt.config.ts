// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxthub/core', '@nuxt/eslint', '@nuxt/ui', 'nuxt-security'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'light',
    fallback: 'light',
  },
  compatibilityDate: '2025-12-11',

  hub: {
    db: false,
    kv: true,
    blob: true,
    cache: true,
  },
  vite: {
    server: {
      cors: false,
    },
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  security: {
    corsHandler: false,
    headers: {
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'base-uri': ["'self'"],
        'font-src': ["'self'", 'https:', 'data:'],
        'form-action': ["'self'"],
        'frame-ancestors': ["'self'"],
        'img-src': ["'self'", 'data:', 'blob:'],
        'object-src': ["'none'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'blob:'],
        'script-src-attr': ["'none'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'connect-src': ["'self'", 'ws:', 'wss:'],
      },
    },
  },
})
