import * as Sentry from '@sentry/nuxt'

const config = useRuntimeConfig()

Sentry.init({
  // If set up, you can use the Nuxt runtime config here
  // dsn: useRuntimeConfig().public.sentry.dsn
  // modify depending on your custom runtime config
  dsn: config.public.sentry.dsn,
  environment: config.public.sentry.environment,

  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/nuxt/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
})
