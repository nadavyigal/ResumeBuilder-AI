import { z } from 'zod'

// Define environment schema for validation
const serverEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),
  OPENAI_MODEL: z.string().default('gpt-3.5-turbo'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Supabase URL must be a valid URL').refine(
    (url) => url.includes('.supabase.co'),
    'Supabase URL must be a valid Supabase project URL'
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anonymous key is required'),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
})

export interface EnvValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  missingVars: string[]
}

// Custom error class for environment configuration issues
export class EnvironmentConfigError extends Error {
  constructor(
    message: string,
    public missingVars: string[] = [],
    public validationErrors: string[] = []
  ) {
    super(message)
    this.name = 'EnvironmentConfigError'
  }
}

// Type-safe environment access
export const env = {
  // Server-side only environment variables
  server: (function() {
    if (typeof window !== 'undefined') {
      throw new Error('Server environment variables accessed on client side')
    }
    
    try {
      return serverEnvSchema.parse(process.env)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const missingVars = error.issues.map(issue => issue.path.join('.'))
        throw new EnvironmentConfigError(
          'Invalid server environment configuration',
          missingVars,
          error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
        )
      }
      throw error
    }
  })(),

  // Client-side environment variables
  client: (function() {
    try {
      return clientEnvSchema.parse(process.env)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const missingVars = error.issues.map(issue => issue.path.join('.'))
        throw new EnvironmentConfigError(
          'Invalid client environment configuration',
          missingVars,
          error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
        )
      }
      throw error
    }
  })()
}

/**
 * Validates all environment variables synchronously
 */
export function validateEnvironmentSync(): EnvValidationResult {
  const result: EnvValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    missingVars: []
  }

  try {
    // Validate client environment
    clientEnvSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      result.isValid = false
      result.errors.push(...error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`))
      result.missingVars.push(...error.issues.map(issue => issue.path.join('.')))
    }
  }

  // Validate server environment (only on server)
  if (typeof window === 'undefined') {
    try {
      serverEnvSchema.parse(process.env)
    } catch (error) {
      if (error instanceof z.ZodError) {
        result.isValid = false
        result.errors.push(...error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`))
        result.missingVars.push(...error.issues.map(issue => issue.path.join('.')))
      }
    }
  }

  // Add warnings for optional variables
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    result.warnings.push('PostHog analytics is not configured (optional)')
  }

  return result
}

/**
 * Validates environment and throws descriptive error if invalid
 */
export function validateEnvironment(): void {
  const validation = validateEnvironmentSync()
  
  if (!validation.isValid) {
    const errorMessage = [
      'Environment configuration is invalid:',
      ...validation.errors,
      '',
      'Please check your .env.local file and ensure all required variables are set.',
      'Refer to .env.example for the correct format.'
    ].join('\n')

    throw new EnvironmentConfigError(
      errorMessage,
      validation.missingVars,
      validation.errors
    )
  }
}

/**
 * Gets environment status for debugging (safe for logging)
 */
export function getEnvironmentStatus() {
  const isClient = typeof window !== 'undefined'
  
  return {
    environment: process.env.NODE_ENV || 'development',
    isClient,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...' || 'NOT_SET',
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasSupabaseServiceKey: !isClient && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasOpenAIKey: !isClient && !!process.env.OPENAI_API_KEY,
    hasPostHogKey: !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  }
}

/**
 * Runtime check for critical environment variables on startup
 */
export function checkCriticalEnvVars(): void {
  const critical = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]

  const missing = critical.filter(name => {
    const value = process.env[name]
    return !value || value.includes('YOUR_') || value.includes('_HERE')
  })
  
  if (missing.length > 0) {
    const placeholderKeys = missing.filter(name => {
      const value = process.env[name]
      return value && (value.includes('YOUR_') || value.includes('_HERE'))
    })
    
    if (placeholderKeys.length > 0) {
      throw new EnvironmentConfigError(
        `Environment variables contain placeholder values: ${placeholderKeys.join(', ')}\n\n` +
        'Please update your .env.local file with actual credentials:\n' +
        '1. Get Supabase Anon Key from: https://supabase.com/dashboard → Your Project → Settings → API\n' +
        '2. Get OpenAI API Key from: https://platform.openai.com/api-keys\n\n' +
        'Run: ./fix-env-config.ps1 to reset your environment file',
        missing
      )
    } else {
      throw new EnvironmentConfigError(
        `Critical environment variables are missing: ${missing.join(', ')}\n\n` +
        'Run: ./fix-env-config.ps1 to create a proper .env.local file template',
        missing
      )
    }
  }
} 