import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { validateSupabaseConfig } from '@/lib/api-protection'
import { env } from '@/lib/env'

// Validate Supabase configuration on module load
const validation = validateSupabaseConfig()
if (!validation.success) {
  throw new Error(`Supabase Configuration Error: ${validation.error}`)
}

const supabaseUrl = env.client.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = env.client.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ⚠️ DEPRECATED: Legacy server-side client - use @/utils/supabase/server instead
// Keeping for backward compatibility during migration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false, // Server-side should not persist sessions
    detectSessionInUrl: false
  }
})

// Admin client for server-side operations that require elevated permissions
export const createServiceClient = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Service client cannot be used on the client side')
  }
  
  const serviceKey = env.server.SUPABASE_SERVICE_ROLE_KEY
  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Named export for compatibility
export const getServiceClient = createServiceClient
