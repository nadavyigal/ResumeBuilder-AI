import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'
import { env } from '@/lib/env'

let client: ReturnType<typeof createBrowserClient<Database>> | undefined

export function createClient() {
  // Create a singleton client for the browser
  if (!client) {
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables:', {
        url: !!supabaseUrl,
        key: !!supabaseAnonKey
      })
      throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
    }
    
    console.log('Initializing Supabase client:', {
      url: supabaseUrl,
      keyLength: supabaseAnonKey.length
    })
    
    client = createBrowserClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce'
        },
        global: {
          headers: {
            'x-client-info': 'resumebuilder-ai',
          },
        },
      }
    )
  }
  
  return client
}

// Export a default instance for convenience
export const supabaseBrowser = createClient() 