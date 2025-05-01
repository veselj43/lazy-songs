import { defineNuxtPlugin } from '#app'
import posthog from 'posthog-js'

export default defineNuxtPlugin((nuxtApp) => {
  const configPosthog = nuxtApp.$config.public.posthog
  const posthogClient = posthog.init(configPosthog.publicKey, {
    api_host: configPosthog.host,
    person_profiles: 'never',
    capture_pageview: false,
    loaded: (posthog) => {
      if (import.meta.env.MODE === 'development') {
        posthog.opt_out_capturing()
        // posthog.debug()
      }
    },
  })

  // Make sure that pageviews are captured with each route change
  const router = useRouter()
  router.afterEach((to) => {
    nextTick(() => {
      posthog.capture('$pageview', {
        current_url: to.fullPath,
      })
    })
  })

  return {
    provide: {
      posthog: () => posthogClient,
    },
  }
})
