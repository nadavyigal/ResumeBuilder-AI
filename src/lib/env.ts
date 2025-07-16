/* eslint-disable no-process-env */
import { cleanEnv, str } from 'envalid'

export const env = cleanEnv(process.env, {
  NEXT_PUBLIC_SUPABASE_URL: str(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: str(),
  OPENAI_API_KEY: str(),
  POSTHOG_PUBLIC_KEY: str({ default: '' }), // optional
  SUPABASE_SERVICE_ROLE_KEY: str({ default: '' }),
  OPENAI_MODEL: str({ default: 'gpt-3.5-turbo' }),
  NEXT_PUBLIC_POSTHOG_HOST: str({ default: 'https://us.i.posthog.com' }),
  NODE_ENV: str({ default: 'development' }),
  ANALYZE: str({ default: '' }),
  BASE_URL: str({ default: 'http://localhost:3000' })
})
