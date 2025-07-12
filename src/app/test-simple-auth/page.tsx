'use client'

import { createClient } from '@/lib/supabase-browser'
import { useState, useEffect } from 'react'

export default function TestSimpleAuth() {
  const [authState, setAuthState] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      
      // Use secure getUser() instead of getSession()
      const { data: userData } = await supabase.auth.getUser()
      
      console.log('Current auth state:', userData)
      setAuthState(userData)
      setLoading(false)
    }

    checkAuth()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    
    // Refresh auth state after sign out
    const { data, error } = await supabase.auth.getUser()
    setAuthState(data)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Auth Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Auth State:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(authState, null, 2)}
          </pre>
        </div>
        
        {authState?.user ? (
          <div className="space-y-2">
            <p className="text-green-600">✅ User is authenticated</p>
            <p>Email: {authState.user.email}</p>
            <p>ID: {authState.user.id}</p>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            <p className="text-red-600">❌ No user authenticated</p>
            <a href="/login" className="text-blue-500 underline">
              Go to Login
            </a>
          </div>
        )}
      </div>
    </div>
  )
} 