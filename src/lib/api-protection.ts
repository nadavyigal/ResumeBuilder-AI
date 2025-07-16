import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'

export interface ApiValidationResult {
  success: boolean
  error?: string
  statusCode?: number
}

/**
 * Checks whether all specified environment variables are set for API routes.
 *
 * Returns an object indicating success or failure, including an error message and status code if any required variables are missing or if an error occurs during validation.
 *
 * @param requiredVars - List of environment variable names to validate
 * @returns The result of the validation, including error details if validation fails
 */
export function validateApiEnvironment(requiredVars: string[] = []): ApiValidationResult {
  try {
    const missingVars = requiredVars.filter(varName => !process.env[varName])

    if (missingVars.length > 0) {
      return {
        success: false,
        error: `Missing required environment variables: ${missingVars.join(', ')}`,
        statusCode: 500
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
      statusCode: 500
    }
  }
}

/**
 * Middleware wrapper for API routes that require environment validation
 */
export function withEnvironmentValidation(
  handler: (req: NextRequest) => Promise<NextResponse>,
  requiredVars: string[] = []
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const validation = validateApiEnvironment(requiredVars)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Configuration Error',
          message: validation.error,
          timestamp: new Date().toISOString()
        },
        { status: validation.statusCode || 500 }
      )
    }

    return handler(req)
  }
}

/**
 * Checks whether the OpenAI API key is properly configured in the environment.
 *
 * Returns a failure result if the key is missing or set to a known placeholder value; otherwise, returns success.
 *
 * @returns The result of the OpenAI API key validation, including error details if invalid.
 */
export function validateOpenAIConfig(): ApiValidationResult {
  if (!env.OPENAI_API_KEY) {
    return {
      success: false,
      error: 'OpenAI API key not configured',
      statusCode: 500
    }
  }

  if (env.OPENAI_API_KEY === 'test-key' || env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    return {
      success: false,
      error: 'OpenAI API key is using placeholder value',
      statusCode: 500
    }
  }

  return { success: true }
}

/**
 * Checks if the Supabase environment configuration is valid and not using placeholder values.
 *
 * Returns an object indicating success or failure, with an error message and status code if configuration is missing or contains placeholder values.
 *
 * @returns The result of the Supabase configuration validation.
 */
export function validateSupabaseConfig(): ApiValidationResult {
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return {
      success: false,
      error: 'Supabase configuration incomplete',
      statusCode: 500
    }
  }

  if (url.includes('your-project') || url.includes('placeholder')) {
    return {
      success: false,
      error: 'Supabase URL is using placeholder value',
      statusCode: 500
    }
  }

  if (anonKey.includes('your_') || anonKey.includes('placeholder')) {
    return {
      success: false,
      error: 'Supabase anonymous key is using placeholder value',
      statusCode: 500
    }
  }

  return { success: true }
}

/**
 * Standard error response for environment configuration issues
 */
export function createEnvironmentErrorResponse(error: string, statusCode: number = 500): NextResponse {
  return NextResponse.json(
    {
      error: 'Environment Configuration Error',
      message: error,
      timestamp: new Date().toISOString(),
      documentation: 'Please check your .env.local file and refer to .env.example for proper configuration'
    },
    { status: statusCode }
  )
} 