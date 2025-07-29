import 'dotenv/config'
import mixpanel from 'mixpanel-browser'
import { env } from '@/lib/env'

export function initMixpanel() {
  if (typeof window !== 'undefined') {
    const token = env.NEXT_PUBLIC_MIXPANEL_TOKEN
    
    if (token) {
      mixpanel.init(token, {
        debug: env.NODE_ENV === 'development',
        track_pageview: false, // We'll handle manually
        loaded: (mixpanel) => {
          if (env.NODE_ENV === 'development') {
            console.log('Mixpanel loaded successfully')
          }
        }
      })
    } else {
      console.warn('Mixpanel token not found. Analytics will not be tracked.')
    }
  }
}

export { mixpanel } 