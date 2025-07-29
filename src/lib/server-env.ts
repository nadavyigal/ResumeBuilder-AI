/* eslint-disable no-process-env */
import { cleanEnv, str } from 'envalid'

// Server-side only environment validation
// This file should only be used in API routes and server-side functions

const serverEnvSchema = {
  NEXT_PUBLIC_SUPABASE_URL: str(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: str(),
  NEXT_PUBLIC_MIXPANEL_TOKEN: str({ default: '' }),
  NODE_ENV: str({ default: 'development' }),
  ANALYZE: str({ default: '' }),
  BASE_URL: str({ default: 'http://localhost:3000' }),
  OPENAI_API_KEY: str(),
  SUPABASE_SERVICE_ROLE_KEY: str({ default: '' }),
  OPENAI_MODEL: str({ default: 'gpt-3.5-turbo' })
}

// Load environment variables with fallback for scripts
let processEnv = process.env
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

export const serverEnv = cleanEnv(processEnv, serverEnvSchema)