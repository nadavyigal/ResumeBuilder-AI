import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Singleton instance to prevent multiple client creation
let client: SupabaseClient<Database> | null = null

export function createClient(): SupabaseClient<Database> {
  // Return existing client if already created
  if (client) {
    return client
  }

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
  }

  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined')
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch (error) {
    throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`)
  }

  // Create new client only if one doesn't exist
  try {
    client = createBrowserClient<Database>(
      supabaseUrl,
      supabaseAnonKey
    )
    
    return client
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    throw new Error(`Failed to create Supabase client: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}