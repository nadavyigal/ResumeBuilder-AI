import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { validateComprehensiveSchema, validateRLSEnabled } from '@/scripts/validateSchema'

export interface DatabaseHealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  checks: {
    connection: {
      status: 'pass' | 'fail'
      responseTime?: number
      error?: string
    }
    schema: {
      status: 'pass' | 'fail' | 'warning'
      tablesChecked: number
      errors: string[]
      warnings: string[]
    }
    migrations: {
      status: 'pass' | 'fail'
      appliedCount: number
      pendingCount: number
      lastMigration?: string
    }
    rls: {
      status: 'pass' | 'fail'
      tablesChecked: number
      errors: string[]
    }
    performance: {
      status: 'pass' | 'fail' | 'warning'
      queryTime?: number
      connectionCount?: number
    }
  }
  metadata: {
    version: string
    environment: string
    region?: string
  }
}

export async function GET(): Promise<NextResponse<DatabaseHealthResponse>> {
  const startTime = Date.now()
  
  const response: DatabaseHealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      connection: { status: 'fail' },
      schema: { status: 'fail', tablesChecked: 0, errors: [], warnings: [] },
      migrations: { status: 'fail', appliedCount: 0, pendingCount: 0 },
      rls: { status: 'fail', tablesChecked: 0, errors: [] },
      performance: { status: 'fail' }
    },
    metadata: {
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'unknown',
      region: process.env.VERCEL_REGION || 'local'
    }
  }

  try {
    // Test database connection
    const supabase = await createClient()
    
    const connectionStart = Date.now()
    try {
      const { error: connectionError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)

      const connectionTime = Date.now() - connectionStart
      
      if (connectionError) {
        response.checks.connection = {
          status: 'fail',
          responseTime: connectionTime,
          error: connectionError.message
        }
      } else {
        response.checks.connection = {
          status: 'pass',
          responseTime: connectionTime
        }
      }
    } catch (error) {
      response.checks.connection = {
        status: 'fail',
        responseTime: Date.now() - connectionStart,
        error: error instanceof Error ? error.message : 'Unknown connection error'
      }
    }

    // Only proceed with other checks if connection is successful
    if (response.checks.connection.status === 'pass') {
      
      // Schema validation
      try {
        const schemaResult = await validateComprehensiveSchema(supabase)
        response.checks.schema = {
          status: schemaResult.isValid ? 'pass' : (schemaResult.warnings.length > 0 ? 'warning' : 'fail'),
          tablesChecked: schemaResult.details.tables.length,
          errors: schemaResult.errors,
          warnings: schemaResult.warnings
        }
      } catch (error) {
        response.checks.schema = {
          status: 'fail',
          tablesChecked: 0,
          errors: [`Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
          warnings: []
        }
      }

      // Migration status check
      try {
        const { getMigrationFiles, getAppliedMigrations } = await import('@/scripts/runMigrations')
        const availableMigrations = getMigrationFiles()
        const appliedMigrations = await getAppliedMigrations(supabase)
        const successfulMigrations = appliedMigrations.filter(m => m.success)
        
        response.checks.migrations = {
          status: 'pass',
          appliedCount: successfulMigrations.length,
          pendingCount: availableMigrations.length - successfulMigrations.length,
          lastMigration: successfulMigrations.length > 0 
            ? successfulMigrations[successfulMigrations.length - 1].version 
            : undefined
        }
      } catch (error) {
        response.checks.migrations = {
          status: 'fail',
          appliedCount: 0,
          pendingCount: 0
        }
      }

      // RLS validation
      try {
        const rlsResult = await validateRLSEnabled(supabase)
        response.checks.rls = {
          status: rlsResult.isValid ? 'pass' : 'fail',
          tablesChecked: 4, // Expected number of tables
          errors: rlsResult.errors
        }
      } catch (error) {
        response.checks.rls = {
          status: 'fail',
          tablesChecked: 0,
          errors: [`RLS validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
        }
      }

      // Performance check
      const performanceStart = Date.now()
      try {
        // Simple query performance test
        await supabase
          .from('profiles')
          .select('count')
          .single()

        const queryTime = Date.now() - performanceStart
        
        response.checks.performance = {
          status: queryTime < 1000 ? 'pass' : (queryTime < 3000 ? 'warning' : 'fail'),
          queryTime,
          connectionCount: 1 // Placeholder - would need actual monitoring
        }
      } catch (error) {
        response.checks.performance = {
          status: 'fail',
          queryTime: Date.now() - performanceStart
        }
      }
    }

    // Determine overall status
    const failedChecks = Object.values(response.checks).filter(check => check.status === 'fail').length
    const warningChecks = Object.values(response.checks).filter(check => check.status === 'warning').length
    
    if (failedChecks > 0) {
      response.status = 'unhealthy'
    } else if (warningChecks > 0) {
      response.status = 'degraded'
    } else {
      response.status = 'healthy'
    }

  } catch (error) {
    response.status = 'unhealthy'
    response.checks.connection = {
      status: 'fail',
      error: `Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
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