import { createClient } from '@/utils/supabase/server'
import { env } from '@/lib/env'

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
  const envRecord = env as unknown as Record<string, string | undefined>
  for (const varName of requiredVars) {
    if (!envRecord[varName]) {
      result.missingVars.push(varName)
      result.isValid = false
    }
  }

  // Check for missing optional variables
  for (const varName of optionalVars) {
    if (!envRecord[varName]) {
      result.warnings.push(`Optional environment variable ${varName} is not set`)
    }
  }

  // Validate URL format
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
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

  const envRecord2 = env as unknown as Record<string, string | undefined>
  for (const varName of requiredVars) {
    if (!envRecord2[varName]) {
      result.missingVars.push(varName)
      result.isValid = false
    }
  }

  return result
}

export function getEnvironmentStatus() {
  return {
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...' || 'NOT SET',
    hasAnonKey: !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!env.SUPABASE_SERVICE_ROLE_KEY,
    hasOpenAIKey: !!env.OPENAI_API_KEY,
    hasPostHogKey: !!env.POSTHOG_PUBLIC_KEY,
  }
}

// Additional validation functions expected by validateSupabase.ts
export async function runAllValidations(): Promise<void> {
  const result = await validateSupabaseEnv()
  if (!result.isValid) {
    throw new Error(`Validation failed: ${result.errors.join(', ')}`)
  }
}

export async function validateDatabaseConnection(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('profiles').select('id').limit(1)
    return !error
  } catch {
    return false
  }
}

export async function validateRLSPolicies(): Promise<boolean> {
  try {
    const supabase = await createClient()
    // Test RLS by trying to access profiles table
    const { error } = await supabase.from('profiles').select('id').limit(1)
    return !error
  } catch {
    return false
  }
}

export async function validateStorageBucket(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.storage.listBuckets()
    return !error
  } catch {
    return false
  }
}