'use client'

import { createClient } from '@/lib/supabase-browser'
import { useEffect, useState } from 'react'

export default function AuthTestPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient()
        
        // Use secure getUser() instead of getSession()
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('User error:', userError)
          setError(userError.message)
        }
        
        console.log('Current user:', user)
        setUser(user)
        
        // Test database connection with user context
        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
            
          if (profileError) {
            console.error('Profile error:', profileError)
            setError(`Profile fetch error: ${profileError.message}`)
          } else {
            console.log('User profile:', profile)
          }
        }
        
      } catch (err) {
        console.error('Auth test error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) return <div className="p-8">Loading auth test...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {user ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <h2 className="font-bold">Authenticated User:</h2>
          <pre className="mt-2 text-sm">{JSON.stringify(user, null, 2)}</pre>
        </div>
      ) : (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No authenticated user found. Please <a href="/login" className="underline">login</a>.
        </div>
      )}
    </div>
  )
} 