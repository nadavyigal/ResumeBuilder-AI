import 'dotenv/config'
import posthog from 'posthog-js'
import { env } from '@/lib/env'

export function initPostHog() {
  if (typeof window !== 'undefined') {
    const key = env.POSTHOG_PUBLIC_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
    
    if (key) {
      posthog.init(key, {
        api_host: host,
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') posthog.debug()
        }
      })
    } else {
      console.warn('PostHog key not found. Analytics will not be tracked.')
    }
  }
}

export { posthog } 