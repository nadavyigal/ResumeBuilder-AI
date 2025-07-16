import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'
import { env } from '@/lib/env'

/**
 * Creates and returns a Supabase browser client instance configured with environment variables.
 *
 * @returns A Supabase client for interacting with the configured database
 */
export function createClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}