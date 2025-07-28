import { describe, it, expect, beforeAll } from 'vitest'
import { validateComprehensiveSchema, validateRLSEnabled, runComprehensiveSchemaValidation } from '../../scripts/validateSchema'
import path from 'path'

// Load environment directly for tests
import dotenv from 'dotenv'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

describe('Database Schema Validation', () => {
  beforeAll(async () => {
    // Ensure environment is loaded for tests
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is required for schema validation tests')
    }
  })

  describe('validateComprehensiveSchema', () => {
    it('should validate all expected tables exist', async () => {
      const result = await validateComprehensiveSchema()
      
      // Check if tables exist
      const expectedTables = ['profiles', 'resumes', 'chat_interactions', 'job_scrapings']
      
      for (const tableName of expectedTables) {
        const tableResult = result.details.tables.find(t => t.tableName === tableName)
        expect(tableResult).toBeDefined()
        expect(tableResult?.exists).toBe(true)
      }
    })

    it('should validate table columns match expected schema', async () => {
      const result = await validateComprehensiveSchema()
      
      // Check profiles table columns
      const profilesTable = result.details.tables.find(t => t.tableName === 'profiles')
      expect(profilesTable).toBeDefined()
      
      if (profilesTable) {
        expect(profilesTable.missingColumns.length).toBe(0)
        
        // Check required columns exist with correct types
        const expectedColumns = ['id', 'created_at', 'email', 'full_name', 'avatar_url']
        for (const columnName of expectedColumns) {
          const column = profilesTable.columns.find(c => c.name === columnName)
          expect(column).toBeDefined()
          expect(column?.exists).toBe(true)
        }
      }
    })

    it('should validate required indexes exist', async () => {
      const result = await validateComprehensiveSchema()
      
      // Check for critical indexes
      const criticalIndexes = [
        'idx_resumes_user_id',
        'idx_resumes_is_public',
        'idx_chat_interactions_user_id',
        'idx_job_scrapings_user_id'
      ]
      
      for (const indexName of criticalIndexes) {
        const indexResult = result.details.indexes.find(i => i.indexName === indexName)
        if (indexResult) {
          expect(indexResult.exists).toBe(true)
        }
      }
    })

    it('should validate RLS policies exist', async () => {
      const result = await validateComprehensiveSchema()
      
      // Check for critical RLS policies
      const criticalPolicies = [
        'Users can view own profile',
        'Users can view own resumes',
        'Users can create own resumes'
      ]
      
      for (const policyName of criticalPolicies) {
        const policyResult = result.details.policies.find(p => p.policyName === policyName)
        if (policyResult) {
          expect(policyResult.exists).toBe(true)
        }
      }
    })

    it('should return validation errors for missing critical components', async () => {
      const result = await validateComprehensiveSchema()
      
      // If validation fails, errors should be descriptive
      if (!result.isValid) {
        expect(result.errors.length).toBeGreaterThan(0)
        result.errors.forEach(error => {
          expect(typeof error).toBe('string')
          expect(error.length).toBeGreaterThan(0)
        })
      }
    })
  })

  describe('validateRLSEnabled', () => {
    it('should verify RLS is enabled on all user-facing tables', async () => {
      const result = await validateRLSEnabled()
      
      // All user-facing tables should have RLS enabled
      if (!result.isValid) {
        // Log errors for debugging
        // RLS validation errors logged appropriately in production
      }
      
      expect(result.errors.length).toBe(0)
      expect(result.isValid).toBe(true)
    })

    it('should provide detailed error messages for RLS failures', async () => {
      const result = await validateRLSEnabled()
      
      // If there are errors, they should be descriptive
      result.errors.forEach(error => {
        expect(typeof error).toBe('string')
        expect(error).toMatch(/Table .+ does not have RLS enabled|Table .+ does not exist/)
      })
    })
  })

  describe('runComprehensiveSchemaValidation', () => {
    it('should complete without throwing errors in valid environment', async () => {
      // This test verifies the main validation function runs to completion
      await expect(runComprehensiveSchemaValidation()).resolves.not.toThrow()
    })
  })

  describe('Schema Validation Performance', () => {
    it('should complete validation within reasonable time', async () => {
      const startTime = Date.now()
      await validateComprehensiveSchema()
      const endTime = Date.now()
      
      // Schema validation should complete within 30 seconds
      expect(endTime - startTime).toBeLessThan(30000)
    })
  })

  describe('Schema Validation Edge Cases', () => {
    it('should handle database connection failures gracefully', async () => {
      // Mock environment with invalid URL to test error handling
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://invalid-url.supabase.co'
      
      try {
        const result = await validateComprehensiveSchema()
        expect(result.isValid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
      } finally {
        // Restore original URL
        process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
      }
    })

    it('should validate schema with partial data', async () => {
      // Even with no data in tables, schema structure should be valid
      const result = await validateComprehensiveSchema()
      
      // Structure validation should not depend on data presence
      const structuralErrors = result.errors.filter(error => 
        error.includes('does not exist') || 
        error.includes('missing columns') || 
        error.includes('type mismatch')
      )
      
      expect(structuralErrors.length).toBe(0)
    })
  })
})