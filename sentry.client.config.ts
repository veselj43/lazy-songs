import * as Sentry from '@sentry/nuxt'

Sentry.init({
  // If set up, you can use the Nuxt runtime config here
  // dsn: useRuntimeConfig().public.sentry.dsn
  // modify depending on your custom runtime config
  dsn: 'https://40e81668231a492d9139bc234d9a911f@o339977.ingest.us.sentry.io/5792310',

  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/nuxt/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
})
