import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

export interface ServicesHealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  checks: {
    supabase: {
      status: 'pass' | 'fail'
      responseTime?: number
      version?: string
      error?: string
    }
    openai: {
      status: 'pass' | 'fail'
      responseTime?: number
      model?: string
      error?: string
    }
    vercel: {
      status: 'pass' | 'fail'
      region?: string
      deployment?: string
    }
    external: {
      status: 'pass' | 'fail'
      dnsResolution?: boolean
      internetConnectivity?: boolean
    }
  }
  metadata: {
    version: string
    environment: string
    region?: string
    deployment?: string
  }
}

export async function GET(): Promise<NextResponse<ServicesHealthResponse>> {
  const response: ServicesHealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      supabase: { status: 'fail' },
      openai: { status: 'fail' },
      vercel: { status: 'pass' },
      external: { status: 'fail' }
    },
    metadata: {
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'unknown',
      region: process.env.VERCEL_REGION || 'local',
      deployment: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'local'
    }
  }

  try {
    // Check Supabase service
    const supabaseStart = Date.now()
    try {
      const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
      const response_supabase = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })

      const supabaseTime = Date.now() - supabaseStart

      if (response_supabase.ok) {
        response.checks.supabase = {
          status: 'pass',
          responseTime: supabaseTime,
          version: response_supabase.headers.get('x-supabase-version') || 'unknown'
        }
      } else {
        response.checks.supabase = {
          status: 'fail',
          responseTime: supabaseTime,
          error: `HTTP ${response_supabase.status}: ${response_supabase.statusText}`
        }
      }
    } catch (error) {
      response.checks.supabase = {
        status: 'fail',
        responseTime: Date.now() - supabaseStart,
        error: error instanceof Error ? error.message : 'Unknown Supabase error'
      }
    }

    // Check OpenAI service
    const openaiStart = Date.now()
    try {
      // Only test if API key is available
      if (process.env.OPENAI_API_KEY) {
        const openaiResponse = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        })

        const openaiTime = Date.now() - openaiStart

        if (openaiResponse.ok) {
          const data = await openaiResponse.json()
          response.checks.openai = {
            status: 'pass',
            responseTime: openaiTime,
            model: data.data?.find((m: any) => m.id.includes('gpt-3.5'))?.id || 'available'
          }
        } else {
          response.checks.openai = {
            status: 'fail',
            responseTime: openaiTime,
            error: `HTTP ${openaiResponse.status}: ${openaiResponse.statusText}`
          }
        }
      } else {
        response.checks.openai = {
          status: 'fail',
          error: 'OpenAI API key not configured'
        }
      }
    } catch (error) {
      response.checks.openai = {
        status: 'fail',
        responseTime: Date.now() - openaiStart,
        error: error instanceof Error ? error.message : 'Unknown OpenAI error'
      }
    }

    // Check Vercel environment (if applicable)
    try {
      response.checks.vercel = {
        status: 'pass',
        region: process.env.VERCEL_REGION || 'local',
        deployment: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'local'
      }
    } catch (error) {
      response.checks.vercel = {
        status: 'fail'
      }
    }

    // Check external connectivity
    try {
      // Test DNS resolution and basic internet connectivity
      const externalStart = Date.now()
      
      // Test a reliable external service
      const externalResponse = await fetch('https://httpbin.org/status/200', {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })

      if (externalResponse.ok) {
        response.checks.external = {
          status: 'pass',
          dnsResolution: true,
          internetConnectivity: true
        }
      } else {
        response.checks.external = {
          status: 'fail',
          dnsResolution: true,
          internetConnectivity: false
        }
      }
    } catch (error) {
      response.checks.external = {
        status: 'fail',
        dnsResolution: false,
        internetConnectivity: false
      }
    }

    // Determine overall status
    const checks = [
      response.checks.supabase,
      response.checks.openai,
      response.checks.vercel,
      response.checks.external
    ]

    const failedChecks = checks.filter(check => check.status === 'fail').length
    const totalChecks = checks.length

    if (failedChecks === 0) {
      response.status = 'healthy'
    } else if (failedChecks === totalChecks) {
      response.status = 'unhealthy'
    } else {
      // Some services are down but not all
      response.status = 'degraded'
    }

  } catch (error) {
    response.status = 'unhealthy'
    // Don't expose internal error details in production
    console.error('Services health check failed:', error)
  }

  // Return appropriate HTTP status code
  const httpStatus = response.status === 'healthy' ? 200 : 
                    response.status === 'degraded' ? 200 : 503

  return NextResponse.json(response, { 
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}