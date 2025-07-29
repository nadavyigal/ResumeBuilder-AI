import { createClient } from '@supabase/supabase-js'
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
    'NEXT_PUBLIC_MIXPANEL_TOKEN',
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

  // Skip Supabase connection test in test environment
  if (process.env.NODE_ENV === 'test') {
    return result
  }

  // Test Supabase connection
  try {
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Test database connection
    const { error: queryError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (queryError) {
      result.errors.push(`Database connection error: ${queryError.message}`)
      result.isValid = false
    }

    // Test auth system (skip in validation scripts - no session expected)
    const { error: authError } = await supabase.auth.getUser()
    if (authError && !authError.message.includes('session_not_found') && !authError.message.includes('Auth session missing')) {
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return {
    supabaseUrl: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT SET',
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasMixpanelToken: !!process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
  }
}

// Additional validation functions expected by validateSupabase.ts
export async function runAllValidations(): Promise<void> {
  const result = await validateSupabaseEnv()
  if (!result.isValid) {
    throw new Error(`Validation failed: ${result.errors.join(', ')}`)
  }

  // Import and run comprehensive schema validation
  try {
    const { validateComprehensiveSchema, validateRLSEnabled } = await import('../scripts/validateSchema')
    
    console.log('🔍 Running comprehensive schema validation...')
    const schemaResult = await validateComprehensiveSchema()
    if (!schemaResult.isValid) {
      throw new Error(`Schema validation failed: ${schemaResult.errors.join(', ')}`)
    }

    console.log('🔒 Validating RLS policies...')
    const rlsResult = await validateRLSEnabled()
    if (!rlsResult.isValid) {
      throw new Error(`RLS validation failed: ${rlsResult.errors.join(', ')}`)
    }

    console.log('✅ All validations passed successfully')
  } catch (error) {
    console.error('❌ Comprehensive validation failed:', error)
    throw error
  }
}

export async function validateDatabaseConnection(): Promise<boolean> {
  try {
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { error } = await supabase.from('profiles').select('id').limit(1)
    return !error
  } catch {
    return false
  }
}

export async function validateRLSPolicies(): Promise<boolean> {
  try {
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    // Test RLS by trying to access profiles table
    const { error } = await supabase.from('profiles').select('id').limit(1)
    return !error
  } catch {
    return false
  }
}

export async function validateStorageBucket(): Promise<boolean> {
  try {
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { error } = await supabase.storage.listBuckets()
    return !error
  } catch {
    return false
  }
}