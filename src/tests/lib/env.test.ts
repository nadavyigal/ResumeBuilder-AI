/* eslint-disable no-process-env */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  validateSupabaseEnv,
  getEnvironmentStatus,
  validateEnvironmentSync
} from '@/lib/validateEnv'

const originalEnv = process.env

describe('Environment Validation', () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('validateSupabaseEnv', () => {
    it('validates successfully with all required variables', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
      process.env.OPENAI_API_KEY = 'sk-test-key'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'

      const result = await validateSupabaseEnv()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('fails validation with missing client variables', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const result = await validateSupabaseEnv()
      expect(result.isValid).toBe(false)
      expect(result.missingVars).toContain('NEXT_PUBLIC_SUPABASE_URL')
      expect(result.missingVars).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    })

    it('fails validation with invalid Supabase URL', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://invalid-url.com'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const result = await validateSupabaseEnv()
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('Supabase URL'))).toBe(true)
    })

    it('includes warnings for optional variables', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
      delete process.env.NEXT_PUBLIC_MIXPANEL_TOKEN

      const result = await validateSupabaseEnv()
      expect(result.warnings.some(w => w.includes('Mixpanel'))).toBe(true)
    })
  })

  describe('validateEnvironmentSync', () => {
    it('reports missing vars synchronously', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      const result = validateEnvironmentSync()
      expect(result.isValid).toBe(false)
      expect(result.missingVars).toContain('NEXT_PUBLIC_SUPABASE_URL')
    })
  })

  describe('getEnvironmentStatus', () => {
    it('returns safe environment status', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://very-long-supabase-url-that-should-be-truncated.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
      process.env.OPENAI_API_KEY = 'sk-test-key'

      const status = getEnvironmentStatus()

      expect(status.supabaseUrl).toContain('...')
      expect(status.supabaseUrl.length).toBeLessThanOrEqual(33)
      expect(status.hasAnonKey).toBe(true)
      expect(status.hasOpenAIKey).toBe(true)
    })

    it('handles missing environment variables safely', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.OPENAI_API_KEY

      const status = getEnvironmentStatus()
      expect(status.supabaseUrl).toBe('NOT_SET')
      expect(status.hasAnonKey).toBe(false)
      expect(status.hasOpenAIKey).toBe(false)
    })
  })
})
