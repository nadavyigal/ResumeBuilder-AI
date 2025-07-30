'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { env } from '@/lib/env'

export default function AuthDebugPage() {
  const [supabase, setSupabase] = useState<any>(null)
  const [status, setStatus] = useState<any>({
    loading: true,
    user: null,
    error: null,
    env: {
      url: '',
      hasKey: false,
    },
    clientCreation: {
      success: false,
      error: null
    }
  })

  useEffect(() => {
    async function initializeClient() {
      try {
        // Check environment variables first
        const envStatus = {
          url: env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
          hasKey: !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          urlLength: env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
          keyLength: env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
          // Add more debugging info
          envType: typeof env,
          hasEnv: !!env,
          processEnv: {
            hasProcessEnv: typeof process !== 'undefined',
            hasWindow: typeof window !== 'undefined',
            nodeEnv: process.env.NODE_ENV,
            publicUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
            publicKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'
          }
        }

        console.log('Environment check:', envStatus)

        // Try to create the client
        let client = null
        let clientError = null
        
        try {
          client = createClient()
          console.log('Supabase client created successfully')
        } catch (error) {
          clientError = error instanceof Error ? error.message : 'Unknown client creation error'
          console.error('Client creation error:', error)
        }

        setStatus((prev: any) => ({
          ...prev,
          env: envStatus,
          clientCreation: {
            success: !!client,
            error: clientError
          }
        }))

        if (client) {
          setSupabase(client)
        }

      } catch (error) {
        console.error('Initialization error:', error)
        setStatus((prev: any) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown initialization error',
          loading: false
        }))
      }
    }

    initializeClient()
  }, [])

  useEffect(() => {
    if (!supabase) return

    async function checkAuth() {
      try {
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

        setStatus((prev: any) => ({
          ...prev,
          loading: false,
          user,
          error: error?.message || null,
          dbTest,
          timestamp: new Date().toISOString(),
        }))
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      console.log('Auth event:', event)
      setStatus((prev: any) => ({ ...prev, user: session?.user || null, lastEvent: event }))
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const testSignIn = async () => {
    if (!supabase) {
      alert('Supabase client not available')
      return
    }

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
                <h2 className="text-lg font-semibold mb-2">Client Creation</h2>
                <div className={`p-3 rounded ${status.clientCreation.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {status.clientCreation.success ? '✅ Client created successfully' : `❌ Client creation failed: ${status.clientCreation.error}`}
                </div>
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
                  {status.dbTest || 'Not tested'}
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
                    disabled={!supabase}
                    className={`px-4 py-2 rounded ${supabase ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-400 text-gray-600 cursor-not-allowed'}`}
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