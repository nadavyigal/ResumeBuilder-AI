import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { env } from '@/lib/env'

// Simple client-safe Supabase validation
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase configuration incomplete: Missing URL or anonymous key')
}

if (supabaseUrl.includes('your-project') || supabaseUrl.includes('placeholder')) {
  throw new Error('Supabase URL is using placeholder value')
}

if (supabaseAnonKey.includes('your_') || supabaseAnonKey.includes('placeholder')) {
  throw new Error('Supabase anonymous key is using placeholder value')
}

// ⚠️ DEPRECATED: Legacy server-side client - use @/utils/supabase/server instead
// Keeping for backward compatibility during migration
export const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false, // Server-side should not persist sessions
    detectSessionInUrl: false
  }
})

// Export createClient function for API routes
export const createClient = () => supabase

// Admin client for server-side operations that require elevated permissions
export const createServiceClient = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Service client cannot be used on the client side')
  }
  
  // Access server environment directly to avoid circular imports
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    if (process.env.NODE_ENV === 'test') {
      // Return mock client for tests
      throw new Error('Service client cannot be used on the client side')
    }
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for service client')
  }
  
  return createSupabaseClient<Database>(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Named export for compatibility
export const getServiceClient = createServiceClient
