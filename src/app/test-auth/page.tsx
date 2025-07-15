'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { env } from '@/lib/env'

export default function TestAuthPage() {
  const [status, setStatus] = useState<any>({})
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check Supabase URL and Anon Key
        const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        const urlStatus = supabaseUrl ? '✅ Set' : '❌ Missing'
        const keyStatus = supabaseAnonKey ? 
          (supabaseAnonKey.length > 20 ? '✅ Set' : '❌ Invalid') : 
          '❌ Missing'

        // Test connection
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        const connectionStatus = userError && !userError.message.includes('session_not_found') ? 
          `❌ Error: ${userError.message}` : '✅ Connected'

        // Test auth state
        const authStatus = user ? `✅ Logged in as: ${user.email}` : '❌ Not logged in'

        setStatus({
          supabaseUrl,
          urlStatus,
          keyStatus,
          connectionStatus,
          authStatus,
          user,
          userError
        })
      } catch (error) {
        setStatus({ error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    checkAuth()
  }, [supabase])

  const handleTestLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'test123456'
    })

    if (error) {
      alert(`Login error: ${error.message}`)
    } else {
      alert('Login successful! Redirecting...')
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase Authentication Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Status</h2>
          <div className="space-y-2">
            <p><strong>Supabase URL:</strong> {status.urlStatus}</p>
            <p className="text-xs text-gray-600 break-all">{status.supabaseUrl}</p>
            <p><strong>Anon Key:</strong> {status.keyStatus}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="space-y-2">
            <p><strong>Connection:</strong> {status.connectionStatus}</p>
            <p><strong>Auth:</strong> {status.authStatus}</p>
          </div>
        </div>

        {status.user && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">User Details</h2>
            <pre className="text-xs overflow-auto bg-gray-100 p-2 rounded">
              {JSON.stringify(status.user, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-x-4">
            <button
              onClick={handleTestLogin}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Login (test@example.com)
            </button>
            <a
              href="/login"
              className="inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Go to Login Page
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 