/* eslint-disable no-process-env */
import { cleanEnv, str } from 'envalid'

// Environment variables loaded successfully
// Different validation for client-side vs server-side
const isServer = typeof window === 'undefined'

const clientEnvSchema = {
  NEXT_PUBLIC_SUPABASE_URL: str(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: str(),
  NEXT_PUBLIC_MIXPANEL_TOKEN: str({ default: '' }), // optional
  NODE_ENV: str({ default: 'development' }),
  ANALYZE: str({ default: '' }),
  BASE_URL: str({ default: 'http://localhost:3000' })
}

const serverEnvSchema = {
  ...clientEnvSchema,
  OPENAI_API_KEY: str(),
  SUPABASE_SERVICE_ROLE_KEY: str(),
  OPENAI_MODEL: str({ default: 'gpt-3.5-turbo' }),
  PRODUCTION_DOMAIN: str({ default: '' }),
  ALLOWED_ORIGINS: str({ default: '' }),
  PREVIEW_ORIGIN_PATTERN: str({ default: '' }),
  CORS_SECURITY_LEVEL: str({ default: '' }),
  ENABLE_CORS_MONITORING: str({ default: 'false' }),
  LOG_LEVEL: str({ default: 'info' }),
  ENABLE_ERROR_REPORTING: str({ default: 'false' })
}

// Load environment variables with fallback for scripts
let processEnv: Record<string, string | undefined> = {}

if (isServer) {
  // Server-side: use process.env with optional dotenv loading
  processEnv = process.env
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // For scripts and server-side operations that need manual env loading
    try {
      const dotenv = require('dotenv')
      const path = require('path')
      const envPath = path.resolve(process.cwd(), '.env.local')
      const result = dotenv.config({ path: envPath })
      if (result.parsed) {
        processEnv = { ...process.env, ...result.parsed }
      }
    } catch (error) {
      // Fallback to process.env if dotenv loading fails
      console.warn('Could not load .env.local file:', error)
    }
  }
} else {
  // Client-side: only use NEXT_PUBLIC_ variables that are automatically injected
  processEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_MIXPANEL_TOKEN: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
    ANALYZE: process.env.ANALYZE,
    BASE_URL: process.env.BASE_URL
  }
}

export const env = cleanEnv(processEnv, isServer ? serverEnvSchema : clientEnvSchema)
