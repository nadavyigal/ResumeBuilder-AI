import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import { env } from '@/lib/env'

// Enhanced Supabase client with retry logic and error handling
class SupabaseClientWrapper {
  private client: ReturnType<typeof createClient<Database>>
  private retryAttempts = 3
  private retryDelay = 1000

  constructor() {
    if (!env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
    }
    if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
    }

    this.client = createClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        db: {
          schema: 'public',
        },
        global: {
          headers: {
            'X-Client-Info': 'resumebuilder-ai@1.0.0',
          },
        },
      }
    )

    console.log('Initializing Supabase client:', {
      url: env.NEXT_PUBLIC_SUPABASE_URL,
      keyLength: env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length,
    })
  }

  // Utility method for retrying failed operations
  private async retry<T>(
    operation: () => Promise<T>,
    attempts: number = this.retryAttempts
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (attempts > 1) {
        console.warn(`Operation failed, retrying... (${attempts - 1} attempts left)`)
        await new Promise(resolve => setTimeout(resolve, this.retryDelay))
        return this.retry(operation, attempts - 1)
      }
      throw error
    }
  }

  // Enhanced query method with automatic retry
  async query<T>(queryFn: () => Promise<T>): Promise<T> {
    return this.retry(queryFn)
  }

  // Get the underlying client for direct access
  get auth() {
    return this.client.auth
  }

  get from() {
    return this.client.from.bind(this.client)
  }

  get storage() {
    return this.client.storage
  }

  get rpc() {
    return this.client.rpc.bind(this.client)
  }

  // Enhanced authentication methods
  async signUp(email: string, password: string, options?: any) {
    return this.query(() => this.client.auth.signUp({
      email,
      password,
      options
    }))
  }

  async signIn(email: string, password: string) {
    return this.query(() => this.client.auth.signInWithPassword({
      email,
      password
    }))
  }

  async signOut() {
    return this.query(() => this.client.auth.signOut())
  }

  async resetPassword(email: string) {
    return this.query(() => this.client.auth.resetPasswordForEmail(email))
  }

  // Enhanced session management (secure method)
  async getUser() {
    return this.query(() => this.client.auth.getUser())
  }

  // Enhanced database operations with better error handling
  async createProfile(profileData: any) {
    return this.query(async () => {
      const { data, error } = await this.client
        .from('profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) throw new Error(`Profile creation failed: ${error.message}`)
      return { data, error: null }
    })
  }

  async getProfile(userId: string) {
    return this.query(async () => {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      return { data, error }
    })
  }

  async updateProfile(userId: string, updates: any) {
    return this.query(async () => {
      const { data, error } = await this.client
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw new Error(`Profile update failed: ${error.message}`)
      return { data, error: null }
    })
  }

  async createResume(resumeData: any) {
    return this.query(async () => {
      const { data, error } = await this.client
        .from('resumes')
        .insert(resumeData)
        .select()
        .single()

      if (error) throw new Error(`Resume creation failed: ${error.message}`)
      return { data, error: null }
    })
  }

  async getResumes(userId: string) {
    return this.query(async () => {
      const { data, error } = await this.client
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      return { data: data || [], error }
    })
  }

  async getResume(resumeId: string) {
    return this.query(async () => {
      const { data, error } = await this.client
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .single()

      return { data, error }
    })
  }

  async updateResume(resumeId: string, updates: any) {
    return this.query(async () => {
      const { data, error } = await this.client
        .from('resumes')
        .update(updates)
        .eq('id', resumeId)
        .select()
        .single()

      if (error) throw new Error(`Resume update failed: ${error.message}`)
      return { data, error: null }
    })
  }

  async deleteResume(resumeId: string) {
    return this.query(async () => {
      const { error } = await this.client
        .from('resumes')
        .delete()
        .eq('id', resumeId)

      if (error) throw new Error(`Resume deletion failed: ${error.message}`)
      return { error: null }
    })
  }

  // File upload with enhanced error handling
  async uploadFile(bucket: string, path: string, file: File) {
    return this.query(async () => {
      const { data, error } = await this.client.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw new Error(`File upload failed: ${error.message}`)
      return { data, error: null }
    })
  }

  async downloadFile(bucket: string, path: string) {
    return this.query(async () => {
      const { data, error } = await this.client.storage
        .from(bucket)
        .download(path)

      return { data, error }
    })
  }

  async getPublicUrl(bucket: string, path: string) {
    const { data } = this.client.storage
      .from(bucket)
      .getPublicUrl(path)

    return data
  }

  // Health check method
  async healthCheck() {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('count(*)', { count: 'exact', head: true })

      return {
        status: error ? 'error' : 'healthy',
        error: error?.message,
        timestamp: new Date().toISOString()
      }
    } catch (err) {
      return {
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }
}

// Export singleton instance
const supabaseClient = new SupabaseClientWrapper()
export default supabaseClient

// Export the wrapper class for direct instantiation if needed
export { SupabaseClientWrapper } 