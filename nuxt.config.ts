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

  ui: {
    colorMode: false
  },

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

  // Runtime config — baseUrl is split into private and public because Nitro
  // (server-side SSR) reads `runtimeConfig.sanctum` while the browser reads
  // `runtimeConfig.public.sanctum`. In production this lets the SSR layer talk
  // to the API over the internal Docker network while the browser uses the
  // public domain.
  //
  // Override at runtime via:
  //   NUXT_SANCTUM_BASE_URL          (server-side / internal, e.g. http://profiltech-api)
  //   NUXT_PUBLIC_SANCTUM_BASE_URL   (browser / public, e.g. https://api.profiltech.dk)
  runtimeConfig: {
    sanctum: {
      baseUrl: 'http://localhost:8000'
    },
    public: {
      sanctum: {
        baseUrl: 'http://localhost:8000'
      }
    }
  },

  sanctum: {
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
