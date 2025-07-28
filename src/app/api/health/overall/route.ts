import { NextRequest, NextResponse } from 'next/server'

export interface OverallHealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  summary: {
    database: 'healthy' | 'unhealthy' | 'degraded' | 'unknown'
    services: 'healthy' | 'unhealthy' | 'degraded' | 'unknown'
    application: 'healthy' | 'unhealthy' | 'degraded'
  }
  details: {
    uptime: number
    version: string
    environment: string
    region?: string
    deployment?: string
    lastDeployment?: string
  }
  checks: {
    critical: number
    warnings: number
    passed: number
    total: number
  }
  links: {
    database: string
    services: string
    metrics?: string
    logs?: string
  }
}

const startTime = Date.now()

export async function GET(request: NextRequest): Promise<NextResponse<OverallHealthResponse>> {
  const baseUrl = request.nextUrl.origin
  
  const response: OverallHealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    summary: {
      database: 'unknown',
      services: 'unknown',
      application: 'healthy'
    },
    details: {
      uptime: Math.floor((Date.now() - startTime) / 1000),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'unknown',
      region: process.env.VERCEL_REGION || 'local',
      deployment: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'local',
      lastDeployment: process.env.VERCEL_GIT_COMMIT_SHA ? new Date().toISOString() : undefined
    },
    checks: {
      critical: 0,
      warnings: 0,
      passed: 0,
      total: 0
    },
    links: {
      database: `${baseUrl}/api/health/database`,
      services: `${baseUrl}/api/health/services`,
      metrics: process.env.NODE_ENV === 'production' ? `${baseUrl}/api/metrics` : undefined,
      logs: process.env.NODE_ENV === 'production' ? `${baseUrl}/api/logs` : undefined
    }
  }

  try {
    // Check database health
    try {
      const dbResponse = await fetch(`${baseUrl}/api/health/database`, {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })
      
      if (dbResponse.ok) {
        const dbData = await dbResponse.json()
        response.summary.database = dbData.status
        
        // Count database checks
        if (dbData.checks) {
          Object.values(dbData.checks).forEach((check: any) => {
            response.checks.total++
            if (check.status === 'pass') {
              response.checks.passed++
            } else if (check.status === 'warning') {
              response.checks.warnings++
            } else {
              response.checks.critical++
            }
          })
        }
      } else {
        response.summary.database = 'unhealthy'
        response.checks.total++
        response.checks.critical++
      }
    } catch (error) {
      response.summary.database = 'unhealthy'
      response.checks.total++
      response.checks.critical++
    }

    // Check services health
    try {
      const servicesResponse = await fetch(`${baseUrl}/api/health/services`, {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })
      
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json()
        response.summary.services = servicesData.status
        
        // Count services checks
        if (servicesData.checks) {
          Object.values(servicesData.checks).forEach((check: any) => {
            response.checks.total++
            if (check.status === 'pass') {
              response.checks.passed++
            } else {
              response.checks.critical++
            }
          })
        }
      } else {
        response.summary.services = 'unhealthy'
        response.checks.total++
        response.checks.critical++
      }
    } catch (error) {
      response.summary.services = 'unhealthy'
      response.checks.total++
      response.checks.critical++
    }

    // Application-level checks
    try {
      // Check if we can access environment variables
      const envCheck = process.env.NODE_ENV && process.env.NEXT_PUBLIC_SUPABASE_URL
      
      // Check memory usage (basic)
      const memUsage = process.memoryUsage()
      const memoryHealthy = memUsage.heapUsed < (memUsage.heapTotal * 0.9)
      
      if (envCheck && memoryHealthy) {
        response.summary.application = 'healthy'
        response.checks.passed++
      } else {
        response.summary.application = 'degraded'
        response.checks.warnings++
      }
      response.checks.total++
      
    } catch (error) {
      response.summary.application = 'unhealthy'
      response.checks.total++
      response.checks.critical++
    }

    // Determine overall status based on summary
    const statuses = [
      response.summary.database,
      response.summary.services,
      response.summary.application
    ]

    const unhealthyCount = statuses.filter(s => s === 'unhealthy').length
    const degradedCount = statuses.filter(s => s === 'degraded').length

    if (unhealthyCount > 0) {
      response.status = 'unhealthy'
    } else if (degradedCount > 0) {
      response.status = 'degraded'
    } else {
      response.status = 'healthy'
    }

    // Override if too many critical issues
    if (response.checks.critical > response.checks.total / 2) {
      response.status = 'unhealthy'
    }

  } catch (error) {
    response.status = 'unhealthy'
    response.summary.application = 'unhealthy'
    console.error('Overall health check failed:', error)
  }

  // Return appropriate HTTP status code
  const httpStatus = response.status === 'healthy' ? 200 : 
                    response.status === 'degraded' ? 200 : 503

  return NextResponse.json(response, { 
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Health-Status': response.status,
      'X-Health-Checks': `${response.checks.passed}/${response.checks.total}`
    }
  })
}