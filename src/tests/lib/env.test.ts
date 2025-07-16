/* eslint-disable no-process-env */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { 
  validateEnvironmentSync, 
  getEnvironmentStatus, 
  checkCriticalEnvVars,
  EnvironmentConfigError
} from '@/lib/env'

// Store original environment
const originalEnv = process.env

describe('Environment Validation', () => {
  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
  })

  describe('validateEnvironmentSync', () => {
    it('should validate successfully with all required variables', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
      process.env.OPENAI_API_KEY = 'sk-test-key'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'

      const result = validateEnvironmentSync()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail validation with missing client variables', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const result = validateEnvironmentSync()
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.missingVars).toContain('NEXT_PUBLIC_SUPABASE_URL')
      expect(result.missingVars).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    })

    it('should fail validation with invalid Supabase URL', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://invalid-url.com'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const result = validateEnvironmentSync()
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('Supabase URL'))).toBe(true)
    })

    it('should include warnings for optional variables', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
      delete process.env.NEXT_PUBLIC_POSTHOG_KEY

      const result = validateEnvironmentSync()
      expect(result.warnings.some(warning => warning.includes('PostHog'))).toBe(true)
    })
  })

  describe('getEnvironmentStatus', () => {
    it('should return safe environment status', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://very-long-supabase-url-that-should-be-truncated.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
      process.env.OPENAI_API_KEY = 'sk-test-key'

      const status = getEnvironmentStatus()
      
      expect(status.supabaseUrl).toContain('...')
      expect(status.supabaseUrl.length).toBeLessThanOrEqual(33) // 30 chars + '...'
      expect(status.hasSupabaseAnonKey).toBe(true)
      expect(status.hasOpenAIKey).toBe(true)
      expect(status.environment).toBeDefined()
    })

    it('should handle missing environment variables safely', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.OPENAI_API_KEY

      const status = getEnvironmentStatus()
      expect(status.supabaseUrl).toBe('NOT_SET')
      expect(status.hasSupabaseAnonKey).toBe(false)
      expect(status.hasOpenAIKey).toBe(false)
    })
  })

  describe('checkCriticalEnvVars', () => {
    it('should pass with critical variables present', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      expect(() => checkCriticalEnvVars()).not.toThrow()
    })

    it('should throw EnvironmentConfigError with missing critical variables', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      expect(() => checkCriticalEnvVars()).toThrow(EnvironmentConfigError)
      
      try {
        checkCriticalEnvVars()
      } catch (error) {
        expect(error).toBeInstanceOf(EnvironmentConfigError)
        expect((error as EnvironmentConfigError).missingVars).toContain('NEXT_PUBLIC_SUPABASE_URL')
        expect((error as EnvironmentConfigError).missingVars).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY')
      }
    })

    it('should throw with descriptive error message', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL

      expect(() => checkCriticalEnvVars()).toThrow(/Critical environment variables are missing/)
    })
  })

  describe('EnvironmentConfigError', () => {
    it('should create error with missing variables and validation errors', () => {
      const missingVars = ['VAR1', 'VAR2']
      const validationErrors = ['Error 1', 'Error 2']
      
      const error = new EnvironmentConfigError('Test error', missingVars, validationErrors)
      
      expect(error.name).toBe('EnvironmentConfigError')
      expect(error.message).toBe('Test error')
      expect(error.missingVars).toEqual(missingVars)
      expect(error.validationErrors).toEqual(validationErrors)
    })

    it('should work with minimal parameters', () => {
      const error = new EnvironmentConfigError('Simple error')
      
      expect(error.name).toBe('EnvironmentConfigError')
      expect(error.message).toBe('Simple error')
      expect(error.missingVars).toEqual([])
      expect(error.validationErrors).toEqual([])
    })
  })
}) 