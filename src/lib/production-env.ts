/**
 * Production environment validation for edge runtime compatibility
 * This avoids the use of envalid which is not edge runtime compatible
 */

export interface ProductionEnv {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  OPENAI_API_KEY?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  NODE_ENV?: string
  PRODUCTION_DOMAIN?: string
  ALLOWED_ORIGINS?: string
}

/**
 * Get production environment variables with validation
 * Edge runtime compatible
 */
export function getProductionEnv(): ProductionEnv {
  const env: ProductionEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NODE_ENV: process.env.NODE_ENV,
    PRODUCTION_DOMAIN: process.env.PRODUCTION_DOMAIN,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
  }

  // Validate required variables
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  }

  if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }

  // Validate URL format
  try {
    new URL(env.NEXT_PUBLIC_SUPABASE_URL)
  } catch {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
  }

  return env
}

/**
 * Check if we're in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Check if we're in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}