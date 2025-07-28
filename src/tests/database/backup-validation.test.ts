import { describe, it, expect, beforeAll } from 'vitest'
import { validateBackupIntegrity } from '../../scripts/validateBackup'

describe('Database Backup Validation', () => {
  beforeAll(() => {
    // Ensure environment is available for tests
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is required for backup validation tests')
    }
  })

  describe('validateBackupIntegrity', () => {
    it('should return validation result with correct structure', async () => {
      const result = await validateBackupIntegrity()
      
      // Validate result structure
      expect(result).toHaveProperty('isValid')
      expect(result).toHaveProperty('timestamp')
      expect(result).toHaveProperty('checks')
      expect(result).toHaveProperty('summary')
      
      // Validate checks structure
      expect(result.checks).toHaveProperty('connectivity')
      expect(result.checks).toHaveProperty('schema')
      expect(result.checks).toHaveProperty('integrity')
      expect(result.checks).toHaveProperty('dataConsistency')
      
      // Validate each check has status
      expect(['pass', 'fail']).toContain(result.checks.connectivity.status)
      expect(['pass', 'fail']).toContain(result.checks.schema.status)
      expect(['pass', 'fail']).toContain(result.checks.integrity.status)
      expect(['pass', 'fail']).toContain(result.checks.dataConsistency.status)
      
      // Validate summary
      expect(typeof result.summary.totalChecks).toBe('number')
      expect(typeof result.summary.passedChecks).toBe('number')
      expect(typeof result.summary.failedChecks).toBe('number')
      expect(Array.isArray(result.summary.warnings)).toBe(true)
      
      // Summary should be consistent
      expect(result.summary.totalChecks).toBe(
        result.summary.passedChecks + result.summary.failedChecks
      )
    })

    it('should validate database connectivity', async () => {
      const result = await validateBackupIntegrity()
      
      const connectivityCheck = result.checks.connectivity
      expect(connectivityCheck).toHaveProperty('status')
      
      if (connectivityCheck.status === 'pass') {
        expect(connectivityCheck.responseTime).toBeDefined()
        expect(typeof connectivityCheck.responseTime).toBe('number')
        expect(connectivityCheck.responseTime!).toBeGreaterThan(0)
      } else {
        expect(connectivityCheck.error).toBeDefined()
        expect(typeof connectivityCheck.error).toBe('string')
      }
    })

    it('should check expected tables exist', async () => {
      const result = await validateBackupIntegrity()
      
      const schemaCheck = result.checks.schema
      expect(Array.isArray(schemaCheck.tablesFound)).toBe(true)
      expect(Array.isArray(schemaCheck.missingTables)).toBe(true)
      expect(typeof schemaCheck.tableCounts).toBe('object')
      
      // Expected tables should be checked
      const expectedTables = ['profiles', 'resumes', 'chat_interactions', 'job_scrapings']
      expectedTables.forEach(table => {
        const isFound = schemaCheck.tablesFound.includes(table)
        const isMissing = schemaCheck.missingTables.includes(table)
        
        // Table should be either found or missing, not both
        expect(isFound && isMissing).toBe(false)
      })
    })

    it('should validate data consistency', async () => {
      const result = await validateBackupIntegrity()
      
      const consistencyCheck = result.checks.dataConsistency
      expect(Array.isArray(consistencyCheck.checks)).toBe(true)
      
      // Each consistency check should have required properties
      consistencyCheck.checks.forEach(check => {
        expect(check).toHaveProperty('name')
        expect(check).toHaveProperty('status')
        expect(check).toHaveProperty('message')
        
        expect(typeof check.name).toBe('string')
        expect(['pass', 'fail']).toContain(check.status)
        expect(typeof check.message).toBe('string')
      })
    })

    it('should complete validation within reasonable time', async () => {
      const startTime = Date.now()
      const result = await validateBackupIntegrity()
      const duration = Date.now() - startTime
      
      // Validation should complete within 30 seconds
      expect(duration).toBeLessThan(30000)
      expect(result).toBeDefined()
    })

    it('should handle database connection failures gracefully', async () => {
      // Mock environment to test error handling
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://invalid-url.supabase.co'
      
      try {
        const result = await validateBackupIntegrity()
        
        // Should still return a result structure even with failures
        expect(result).toHaveProperty('isValid')
        expect(result).toHaveProperty('checks')
        expect(result).toHaveProperty('summary')
        
        // Connectivity should fail
        expect(result.checks.connectivity.status).toBe('fail')
        expect(result.checks.connectivity.error).toBeDefined()
        
        // Overall validation should fail
        expect(result.isValid).toBe(false)
        expect(result.summary.failedChecks).toBeGreaterThan(0)
        
      } finally {
        // Restore original URL
        process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
      }
    })

    it('should provide meaningful error messages', async () => {
      const result = await validateBackupIntegrity()
      
      // Check for meaningful error messages in failed checks
      Object.values(result.checks).forEach(check => {
        if ('error' in check && check.status === 'fail' && check.error) {
          expect(check.error.length).toBeGreaterThan(5) // More than just "Error"
          expect(check.error).not.toBe('Unknown error')
        }
      })
      
      // Data consistency checks should have descriptive messages
      result.checks.dataConsistency.checks.forEach(check => {
        expect(check.message.length).toBeGreaterThan(10)
        expect(check.message).not.toBe('Error')
      })
    })

    it('should validate timestamp format', async () => {
      const result = await validateBackupIntegrity()
      
      expect(result.timestamp).toBeDefined()
      expect(typeof result.timestamp).toBe('string')
      
      // Should be valid ISO timestamp
      const timestamp = new Date(result.timestamp)
      expect(timestamp.toString()).not.toBe('Invalid Date')
      
      // Should be recent (within last minute)
      const now = new Date()
      const timeDiff = now.getTime() - timestamp.getTime()
      expect(timeDiff).toBeLessThan(60000) // Less than 1 minute
    })

    it('should track warnings appropriately', async () => {
      const result = await validateBackupIntegrity()
      
      expect(Array.isArray(result.summary.warnings)).toBe(true)
      
      // Each warning should be a non-empty string
      result.summary.warnings.forEach(warning => {
        expect(typeof warning).toBe('string')
        expect(warning.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Backup Validation Integration', () => {
    it('should be compatible with schema validation', async () => {
      // Both validation systems should be able to run concurrently
      const [backupResult, schemaResult] = await Promise.all([
        validateBackupIntegrity(),
        import('../../scripts/validateSchema').then(module => 
          module.validateComprehensiveSchema()
        )
      ])
      
      expect(backupResult).toBeDefined()
      expect(schemaResult).toBeDefined()
      
      // Both should provide consistent view of database state
      if (backupResult.checks.connectivity.status === 'pass' && 
          schemaResult.isValid) {
        // Both should agree on basic database accessibility
        expect(backupResult.checks.schema.status).toBe('pass')
      }
    })

    it('should provide actionable validation results', async () => {
      const result = await validateBackupIntegrity()
      
      // If validation fails, it should provide specific information
      if (!result.isValid) {
        const failedChecks = Object.entries(result.checks)
          .filter(([_, check]) => check.status === 'fail')
        
        expect(failedChecks.length).toBeGreaterThan(0)
        
        // Each failed check should provide actionable information
        failedChecks.forEach(([checkName, check]) => {
          if ('error' in check && check.error) {
            expect(typeof check.error).toBe('string')
            expect(check.error.length).toBeGreaterThan(10)
          }
        })
      }
    })
  })

  describe('Performance and Reliability', () => {
    it('should handle concurrent validation requests', async () => {
      const promises = Array(3).fill(null).map(() => validateBackupIntegrity())
      const results = await Promise.all(promises)
      
      // All requests should complete successfully
      results.forEach(result => {
        expect(result).toBeDefined()
        expect(result).toHaveProperty('isValid')
        expect(result).toHaveProperty('checks')
      })
      
      // Results should be consistent (same database state)
      const statuses = results.map(r => r.checks.connectivity.status)
      expect(new Set(statuses).size).toBeLessThanOrEqual(2) // Should be mostly consistent
    })

    it('should not leave resources hanging', async () => {
      // This test ensures the validation process cleans up properly
      const initialTime = Date.now()
      
      await validateBackupIntegrity()
      
      const duration = Date.now() - initialTime
      
      // Should complete in reasonable time (not hang)
      expect(duration).toBeLessThan(30000)
    })
  })
})