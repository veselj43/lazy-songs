import type { NuxtPage } from 'nuxt/schema'

const isDev = process.env.NODE_ENV === 'development'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  ssr: false,

  modules: [
    //
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@sentry/nuxt/module',
  ],

  css: ['~/assets/css/main.css'],

  srcDir: 'src/',

  components: {
    dirs: ['components'],
    generateMetadata: true,
  },

  experimental: {
    typedPages: true,
  },

  hooks: {
    'pages:extend'(pages) {
      function removePartialPages(pages: NuxtPage[]) {
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i]

          if (page.path.includes('/_partial/')) {
            pages.splice(i, 1)
            i--
          } else if (page.children) {
            removePartialPages(page.children)
          }
        }
      }

      removePartialPages(pages)
    },
  },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', href: '/favicon-64.png' },
      ],
    },
  },

  devtools: {
    enabled: true,
  },

  runtimeConfig: {
    public: {
      hrefGit: 'https://github.com/veselj43/lazy-songs',
      showFileExplorer: false,

      posthog: {
        disabled: isDev,
        publicKey: 'phc_T2gBIk4PxumJKJcUWmCHCXFhXkq6OLmJFJ1bZcWCffs',
        host: 'https://eu.i.posthog.com',
      },

      sentry: {
        dsn: isDev
          ? undefined
          : (process.env.SENTRY_DSN_PUBLIC ??
            'https://4a0cd8e8e183acab3127a248ea717e7c@o339977.ingest.us.sentry.io/4509247668944896'),
        environment: isDev ? 'local' : 'production',
      },
    },
  },
})
