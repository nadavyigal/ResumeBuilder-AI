'use client'

import { useState, useEffect } from 'react'

interface ValidationResult {
  name: string
  status: 'pending' | 'success' | 'error' | 'warning'
  message: string
  details?: any
  timing?: number
}

interface ValidationGroup {
  name: string
  tests: ValidationResult[]
}

export default function SupabaseValidationPage() {
  const [validationResults, setValidationResults] = useState<ValidationGroup[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [summary, setSummary] = useState({ total: 0, passed: 0, failed: 0, warnings: 0 })

  const runValidation = async () => {
    setIsRunning(true)
    setValidationResults([])

    const results: ValidationGroup[] = []
    
    try {
      // Run the comprehensive validation
      const response = await fetch('/api/validate-integration')
      const data = await response.json()

      if (data.success) {
        // Transform API results into grouped format
        const groups: ValidationGroup[] = [
          {
            name: 'Environment & Configuration',
            tests: [
              { 
                name: 'Environment Variables', 
                status: data.environment.valid ? 'success' : 'error',
                message: data.environment.valid ? 'All required variables present' : 'Missing variables',
                details: data.environment.details,
                timing: data.environment.timing
              },
              {
                name: 'Supabase Connection',
                status: data.connection.connected ? 'success' : 'error',
                message: data.connection.connected ? 'Connection established' : 'Connection failed',
                details: data.connection.details,
                timing: data.connection.timing
              }
            ]
          },
          {
            name: 'Authentication & Security',
            tests: [
              {
                name: 'Authentication Service',
                status: data.auth.working ? 'success' : 'error',
                message: data.auth.working ? 'Auth service operational' : 'Auth service failed',
                details: data.auth.details,
                timing: data.auth.timing
              },
              {
                name: 'Security Patterns',
                status: data.security.secure ? 'success' : 'warning',
                message: data.security.secure ? 'Secure patterns detected' : 'Security improvements needed',
                details: data.security.details,
                timing: data.security.timing
              }
            ]
          },
          {
            name: 'Database & RLS',
            tests: [
              {
                name: 'Database Tables',
                status: data.database.tablesExist ? 'success' : 'error',
                message: data.database.tablesExist ? 'All tables exist' : 'Missing tables',
                details: data.database.details,
                timing: data.database.timing
              },
              {
                name: 'Row Level Security',
                status: data.rls.enabled ? 'success' : 'error',
                message: data.rls.enabled ? 'RLS properly configured' : 'RLS issues detected',
                details: data.rls.details,
                timing: data.rls.timing
              }
            ]
          },
          {
            name: 'Storage & Files',
            tests: [
              {
                name: 'Storage Buckets',
                status: data.storage.configured ? 'success' : 'warning',
                message: data.storage.configured ? 'Storage properly configured' : 'Storage setup incomplete',
                details: data.storage.details,
                timing: data.storage.timing
              }
            ]
          },
          {
            name: 'Performance',
            tests: [
              {
                name: 'Query Performance',
                status: data.performance.fast ? 'success' : 'warning',
                message: data.performance.fast ? `Queries under ${data.performance.target}ms` : 'Performance optimization needed',
                details: data.performance.details,
                timing: data.performance.timing
              },
              {
                name: 'Index Coverage',
                status: data.performance.indexed ? 'success' : 'warning',
                message: data.performance.indexed ? 'Indexes properly configured' : 'Missing indexes detected',
                details: data.performance.indexDetails,
                timing: data.performance.timing
              }
            ]
          }
        ]

        setValidationResults(groups)

        // Calculate summary
        const allTests = groups.flatMap(g => g.tests)
        setSummary({
          total: allTests.length,
          passed: allTests.filter(t => t.status === 'success').length,
          failed: allTests.filter(t => t.status === 'error').length,
          warnings: allTests.filter(t => t.status === 'warning').length
        })

      } else {
        // Handle API error
        setValidationResults([{
          name: 'Validation Error',
          tests: [{
            name: 'API Call',
            status: 'error',
            message: data.error || 'Validation API failed'
          }]
        }])
      }
    } catch (error) {
      setValidationResults([{
        name: 'System Error',
        tests: [{
          name: 'Validation Process',
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }]
      }])
    }

    setIsRunning(false)
  }

  useEffect(() => {
    // Auto-run validation on page load
    runValidation()
  }, [])

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'pending': return '⏳'
      default: return '❓'
    }
  }

  const getStatusColor = (status: ValidationResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'pending': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🔍 Supabase Integration Validation
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive testing of Resume Builder AI Supabase integration
              </p>
            </div>
            <button
              onClick={runValidation}
              disabled={isRunning}
              className={`px-6 py-3 rounded-lg font-medium ${
                isRunning
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isRunning ? 'Running...' : 'Run Validation'}
            </button>
          </div>

          {/* Summary */}
          {summary.total > 0 && (
            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-800">{summary.passed}</div>
                <div className="text-sm text-green-600">Passed</div>
              </div>
              <div className="bg-red-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-800">{summary.failed}</div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-800">{summary.warnings}</div>
                <div className="text-sm text-yellow-600">Warnings</div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isRunning && (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Running comprehensive validation tests...</p>
          </div>
        )}

        {/* Results */}
        {validationResults.map((group, groupIndex) => (
          <div key={groupIndex} className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {group.name}
            </h2>
            
            <div className="space-y-3">
              {group.tests.map((test, testIndex) => (
                <div
                  key={testIndex}
                  className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{getStatusIcon(test.status)}</span>
                      <div>
                        <h3 className="font-medium">{test.name}</h3>
                        <p className="text-sm mt-1">{test.message}</p>
                        {test.timing && (
                          <p className="text-xs text-gray-500 mt-1">
                            Completed in {test.timing}ms
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {test.details && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium">
                        View Details
                      </summary>
                      <pre className="mt-2 text-xs bg-white p-3 rounded border overflow-auto">
                        {typeof test.details === 'string' 
                          ? test.details 
                          : JSON.stringify(test.details, null, 2)
                        }
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🎯 Performance & Security Targets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Performance Goals (11 issues)</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Query response times &lt; 100ms</li>
                <li>✅ Proper database indexing</li>
                <li>✅ Connection pooling optimization</li>
                <li>✅ JSONB query optimization</li>
                <li>✅ Materialized views for aggregations</li>
                <li>✅ Automated maintenance routines</li>
                <li>✅ Performance monitoring</li>
                <li>✅ Bulk operation support</li>
                <li>✅ Partitioned audit logging</li>
                <li>✅ Table statistics optimization</li>
                <li>✅ Query planning optimization</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Security Goals (4 issues)</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Enhanced RLS policies</li>
                <li>✅ Comprehensive audit logging</li>
                <li>✅ Secure auth patterns (getUser vs getSession)</li>
                <li>✅ Storage security with size limits</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 