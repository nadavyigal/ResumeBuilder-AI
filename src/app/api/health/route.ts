import { NextRequest, NextResponse } from 'next/server'
import { validateEnvironmentSync, getEnvironmentStatus } from '@/lib/env'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  environment: {
    valid: boolean
    errors: string[]
    warnings: string[]
    details: ReturnType<typeof getEnvironmentStatus>
  }
  services: {
    supabase: {
      status: 'connected' | 'error' | 'not_configured'
      message: string
      timing?: number
    }
    openai: {
      status: 'connected' | 'error' | 'not_configured'
      message: string
      timing?: number
    }
    database: {
      status: 'connected' | 'error' | 'not_configured'
      message: string
      timing?: number
    }
  }
  overall: {
    healthy: boolean
    criticalIssues: string[]
    warnings: string[]
  }
}

export async function GET() {
  console.log('🔍 Health check starting...')
  
  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: {
      valid: false,
      errors: [],
      warnings: [],
      details: getEnvironmentStatus()
    },
    services: {
      supabase: { status: 'not_configured', message: 'Not tested' },
      openai: { status: 'not_configured', message: 'Not tested' },
      database: { status: 'not_configured', message: 'Not tested' }
    },
    overall: {
      healthy: true,
      criticalIssues: [],
      warnings: []
    }
  }

  // 1. Validate Environment Configuration
  try {
    console.log('🔍 Validating environment...')
    const envValidation = validateEnvironmentSync()
    result.environment.valid = envValidation.isValid
    result.environment.errors = envValidation.errors
    result.environment.warnings = envValidation.warnings
    console.log('✅ Environment validation completed:', { valid: envValidation.isValid, errors: envValidation.errors.length })

    if (!envValidation.isValid) {
      result.overall.healthy = false
      result.overall.criticalIssues.push('Environment configuration invalid')
      result.status = 'unhealthy'
    }
  } catch (error) {
    console.error('❌ Environment validation failed:', error)
    result.environment.valid = false
    result.environment.errors.push(error instanceof Error ? error.message : 'Unknown environment error')
    result.overall.healthy = false
    result.overall.criticalIssues.push('Environment validation failed')
    result.status = 'unhealthy'
  }

  // 2. Test Supabase Connection
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabaseStart = Date.now()
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
      
      // Test basic connection
      const { error } = await supabase.auth.getSession()
      const timing = Date.now() - supabaseStart
      
      if (error && !error.message.includes('session_not_found')) {
        result.services.supabase = {
          status: 'error',
          message: `Auth error: ${error.message}`,
          timing
        }
        result.overall.criticalIssues.push('Supabase auth connection failed')
        result.status = 'unhealthy'
      } else {
        result.services.supabase = {
          status: 'connected',
          message: 'Successfully connected to Supabase auth',
          timing
        }
      }
    } catch (error) {
      result.services.supabase = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown Supabase error',
        timing: Date.now() - supabaseStart
      }
      result.overall.criticalIssues.push('Supabase connection failed')
      result.status = 'unhealthy'
    }
  } else {
    result.services.supabase = {
      status: 'not_configured',
      message: 'Supabase credentials not configured'
    }
    result.overall.warnings.push('Supabase not configured')
  }

  // 3. Test Database Connection (if service key available)
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const dbStart = Date.now()
    try {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
      
      // Test database query
      const { error } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .limit(1)
      
      const timing = Date.now() - dbStart
      
      if (error) {
        result.services.database = {
          status: 'error',
          message: `Database query failed: ${error.message}`,
          timing
        }
        result.overall.criticalIssues.push('Database connection failed')
        result.status = 'unhealthy'
      } else {
        result.services.database = {
          status: 'connected',
          message: 'Database queries working',
          timing
        }
      }
    } catch (error) {
      result.services.database = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown database error',
        timing: Date.now() - dbStart
      }
      result.overall.criticalIssues.push('Database connection failed')
      result.status = 'unhealthy'
    }
  } else {
    result.services.database = {
      status: 'not_configured',
      message: 'Database service key not configured'
    }
    result.overall.warnings.push('Database service key not configured')
  }

  // 4. Test OpenAI Connection
  if (process.env.OPENAI_API_KEY) {
    const openaiStart = Date.now()
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
      
      // Test with a minimal request
      await openai.models.list()
      const timing = Date.now() - openaiStart
      
      result.services.openai = {
        status: 'connected',
        message: 'OpenAI API accessible',
        timing
      }
    } catch (error) {
      const timing = Date.now() - openaiStart
      result.services.openai = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown OpenAI error',
        timing
      }
      
      // OpenAI errors might not be critical for basic app functionality
      if (result.status === 'healthy') {
        result.status = 'degraded'
      }
      result.overall.warnings.push('OpenAI service unavailable')
    }
  } else {
    result.services.openai = {
      status: 'not_configured',
      message: 'OpenAI API key not configured'
    }
    result.overall.warnings.push('OpenAI not configured')
  }

  // Determine final status
  if (result.overall.criticalIssues.length > 0) {
    result.status = 'unhealthy'
    result.overall.healthy = false
  } else if (result.overall.warnings.length > 0) {
    result.status = 'degraded'
  }

  // Set appropriate HTTP status code
  const statusCode = result.status === 'healthy' ? 200 : 
                    result.status === 'degraded' ? 200 : 503

  return NextResponse.json(result, { status: statusCode })
} 