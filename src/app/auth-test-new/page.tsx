'use client'

import { createClient } from '@/lib/supabase-browser'
import { useEffect, useState } from 'react'

export default function AuthTestNew() {
  const [authData, setAuthData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getUser = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Auth error:', error)
      setError(error.message)
    }
    
    console.log('User data:', data)
    setAuthData(data)
    setLoading(false)
  }

  useEffect(() => {
    getUser()
  }, [])

  if (loading) return <div className="p-8">Loading auth test...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">New Authentication Test</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      <div className="space-y-4">
        <button
          onClick={getUser}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Auth State
        </button>
        
        <div>
          <h2 className="text-lg font-semibold">Authentication Data:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(authData, null, 2)}
          </pre>
        </div>
        
        {authData?.user ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <h3 className="font-bold">✅ User Authenticated</h3>
            <p>Email: {authData.user.email}</p>
            <p>ID: {authData.user.id}</p>
            <p>Created: {new Date(authData.user.created_at).toLocaleString()}</p>
          </div>
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <h3 className="font-bold">❌ No User Authenticated</h3>
            <p>Please <a href="/login" className="underline">login</a> to test authentication.</p>
          </div>
        )}
      </div>
    </div>
  )
}