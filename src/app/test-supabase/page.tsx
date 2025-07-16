'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { env } from '@/lib/env'

export default function TestSupabasePage() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [error, setError] = useState<string | null>(null)
  const [envVars, setEnvVars] = useState({
    url: '',
    hasKey: false
  })

  useEffect(() => {
    // Check environment variables
    setEnvVars({
      url: env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
      hasKey: !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })

    // Test connection
    async function testConnection() {
      try {
        // Try a simple auth check (using secure getUser method)
        const { data, error } = await supabase.auth.getUser()
        
        if (error && !error.message.includes('session_not_found')) {
          throw error
        }
        
        setStatus('connected')
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Supabase Connection Test</h1>
        
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Environment Variables</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">NEXT_PUBLIC_SUPABASE_URL:</span>
                <span className={`font-mono text-sm ${envVars.url === 'NOT SET' ? 'text-red-600' : 'text-green-600'}`}>
                  {envVars.url === 'NOT SET' ? 'NOT SET' : envVars.url.substring(0, 30) + '...'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                <span className={`font-mono text-sm ${!envVars.hasKey ? 'text-red-600' : 'text-green-600'}`}>
                  {envVars.hasKey ? 'SET ✓' : 'NOT SET'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Connection Status</h2>
            <div className="flex items-center space-x-2">
              {status === 'checking' && (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Checking connection...</span>
                </>
              )}
              {status === 'connected' && (
                <>
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-600">Connected to Supabase!</span>
                </>
              )}
              {status === 'error' && (
                <>
                  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-red-600">Connection failed</span>
                </>
              )}
            </div>
            {error && (
              <div className="mt-2 p-3 bg-red-50 rounded text-sm text-red-700">
                Error: {error}
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <h3 className="font-medium mb-2">Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Create a <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code> file in your project root</li>
              <li>Add your Supabase URL and anon key from your Supabase dashboard</li>
              <li>Restart your development server</li>
              <li>Refresh this page to test the connection</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
} 