import { NextRequest, NextResponse } from 'next/server'
import { validateSupabaseIntegration } from '@/lib/supabase-integration-test'
import { validateSupabaseEnv, getEnvironmentStatus } from '@/lib/validateEnv'

export async function GET() {
  try {
    console.log('🔍 Running Supabase Integration Validation...')
    
    // Run comprehensive integration tests
    const integrationReport = await validateSupabaseIntegration()
    
    // Get environment status
    const envStatus = getEnvironmentStatus()
    
    // Run basic environment validation
    const envValidation = await validateSupabaseEnv()
    
    return NextResponse.json({
      status: 'completed',
      timestamp: new Date().toISOString(),
      environment: {
        status: envStatus,
        validation: envValidation
      },
      integrationReport,
      summary: {
        environmentValid: envValidation.isValid,
        hasWarnings: envValidation.warnings.length > 0,
        missingVars: envValidation.missingVars,
        errors: envValidation.errors,
        warnings: envValidation.warnings
      }
    })
    
  } catch (error) {
    console.error('Integration validation error:', error)
    
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { testType } = await request.json()
    
    if (testType === 'quick') {
      // Quick environment check only
      const envValidation = await validateSupabaseEnv()
      const envStatus = getEnvironmentStatus()
      
      return NextResponse.json({
        status: 'quick-check',
        environment: envStatus,
        validation: envValidation,
        isValid: envValidation.isValid,
        timestamp: new Date().toISOString()
      })
    }
    
    // Default to full integration test
    return await GET()
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 