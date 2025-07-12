'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function ClearSessionPage() {
  const router = useRouter()

  useEffect(() => {
    const clearEverything = async () => {
      console.log('Clearing all sessions and storage...')
      
      // Clear Supabase session
      const supabase = createClient()
      await supabase.auth.signOut()
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        
        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
      }
      
      console.log('All sessions cleared, redirecting to login...')
      
      // Wait a moment then redirect
      setTimeout(() => {
        router.push('/login')
      }, 1000)
    }
    
    clearEverything()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Clearing session...</p>
      </div>
    </div>
  )
} 