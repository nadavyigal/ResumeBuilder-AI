'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function AuthDebugPage() {
  const [supabase] = useState(() => createClient())
  const [status, setStatus] = useState<any>({
    loading: true,
    user: null,
    error: null,
    env: {
      url: '',
      hasKey: false,
    }
  })

  useEffect(() => {
    async function checkAuth() {
      try {
        // Check environment
        const env = {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
          keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
        }

        // Get session
        const { data: { user }, error } = await supabase.auth.getUser()

        // Check if we can make a basic query
        let dbTest = null
        try {
          const { data, error: dbError } = await supabase
            .from('profiles')
            .select('count')
            .limit(1)
          
          dbTest = dbError ? `DB Error: ${dbError.message}` : 'DB connection OK'
        } catch (e) {
          dbTest = `DB Test Failed: ${e instanceof Error ? e.message : 'Unknown error'}`
        }

        setStatus({
          loading: false,
          user,
          error: error?.message || null,
          env,
          dbTest,
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        setStatus((prev: any) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }))
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event)
      setStatus((prev: any) => ({ ...prev, user: session?.user || null, lastEvent: event }))
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const testSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'test123456',
      })
      alert(error ? `Error: ${error.message}` : 'Test sign in attempted - check console')
    } catch (e) {
      alert(`Exception: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication Debug</h1>
        
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          {status.loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div>
                <h2 className="text-lg font-semibold mb-2">Environment</h2>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(status.env, null, 2)}
                </pre>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2">User</h2>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {status.user ? JSON.stringify({
                    email: status.user.email,
                    id: status.user.id,
                    created_at: status.user.created_at,
                    provider: status.user.app_metadata?.provider,
                  }, null, 2) : 'No user'}
                </pre>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2">Database Test</h2>
                <p className={status.dbTest?.includes('OK') ? 'text-green-600' : 'text-red-600'}>
                  {status.dbTest}
                </p>
              </div>

              {status.error && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Error</h2>
                  <p className="text-red-600">{status.error}</p>
                </div>
              )}

              {status.lastEvent && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Last Auth Event</h2>
                  <p className="text-blue-600">{status.lastEvent}</p>
                </div>
              )}

              <div>
                <h2 className="text-lg font-semibold mb-2">Actions</h2>
                <div className="space-x-4">
                  <button
                    onClick={testSignIn}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Test Sign In
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Generated at: {status.timestamp}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 