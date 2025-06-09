'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupabaseTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1)
        if (error) throw error
        setStatus('success')
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Failed to connect to Supabase')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Supabase Connection Test</h2>
      <div className="space-y-2">
        <p>Status: <span className={status === 'success' ? 'text-green-600' : status === 'error' ? 'text-red-600' : 'text-yellow-600'}>
          {status}
        </span></p>
        {error && <p className="text-red-600">Error: {error}</p>}
      </div>
    </div>
  )
} 