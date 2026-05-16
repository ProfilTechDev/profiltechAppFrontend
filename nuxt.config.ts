// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    'nuxt-auth-sanctum'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: false }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  sanctum: {
    baseUrl: 'http://localhost:8000',
    mode: 'cookie',
    endpoints: {
      csrf: '/sanctum/csrf-cookie',
      login: '/login',
      logout: '/logout',
      user: '/user'
    },
    redirect: {
      keepRequestedRoute: true,
      onLogin: '/dashboard',
      onLogout: '/login',
      onAuthOnly: '/login',
      onGuestOnly: '/dashboard'
    },
    globalMiddleware: {
      enabled: true,
      allow404WithoutAuth: true
    }
  }
})
