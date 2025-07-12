import { createClient } from '@/utils/supabase/server'

interface EnvValidationResult {
  isValid: boolean
  missingVars: string[]
  errors: string[]
  warnings: string[]
}

export async function validateSupabaseEnv(): Promise<EnvValidationResult> {
  const result: EnvValidationResult = {
    isValid: true,
    missingVars: [],
    errors: [],
    warnings: [],
  }

  // Required environment variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  // Optional but recommended variables
  const optionalVars = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
    'NEXT_PUBLIC_POSTHOG_KEY',
  ]

  // Check for missing required variables
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      result.missingVars.push(varName)
      result.isValid = false
    }
  }

  // Check for missing optional variables
  for (const varName of optionalVars) {
    if (!process.env[varName]) {
      result.warnings.push(`Optional environment variable ${varName} is not set`)
    }
  }

  // Validate URL format
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl && !supabaseUrl.includes('.supabase.co')) {
    result.errors.push('NEXT_PUBLIC_SUPABASE_URL does not appear to be a valid Supabase URL')
    result.isValid = false
  }

  // Early return if basic validation failed
  if (!result.isValid) {
    return result
  }

  // Test Supabase connection
  try {
    const supabase = await createClient()

    // Test database connection
    const { error: queryError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (queryError) {
      result.errors.push(`Database connection error: ${queryError.message}`)
      result.isValid = false
    }

    // Test auth system
    const { error: authError } = await supabase.auth.getUser()
    if (authError && !authError.message.includes('session_not_found')) {
      result.errors.push(`Auth system error: ${authError.message}`)
      result.isValid = false
    }

  } catch (error) {
    result.errors.push(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
    result.isValid = false
  }

  return result
}

export function validateEnvironmentSync(): Omit<EnvValidationResult, 'errors'> {
  const result = {
    isValid: true,
    missingVars: [] as string[],
    warnings: [] as string[],
  }

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      result.missingVars.push(varName)
      result.isValid = false
    }
  }

  return result
}

export function getEnvironmentStatus() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...' || 'NOT SET',
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasPostHogKey: !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
  }
} 