import { describe, it, expect, beforeAll } from 'vitest'
import { NextRequest } from 'next/server'

// Import the health check route handlers
import { GET as DatabaseHealthCheck } from '../../app/api/health/database/route'
import { GET as ServicesHealthCheck } from '../../app/api/health/services/route'
import { GET as OverallHealthCheck } from '../../app/api/health/overall/route'

describe('Health Check Endpoints', () => {
  beforeAll(() => {
    // Ensure environment variables are available for tests
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.warn('NEXT_PUBLIC_SUPABASE_URL not set - some health checks may fail')
    }
  })

  describe('Database Health Check (/api/health/database)', () => {
    it('should return health check response with correct structure', async () => {
      const request = new NextRequest('http://localhost:3000/api/health/database')
      const response = await DatabaseHealthCheck(request)
      
      expect([200, 503]).toContain(response.status)
      
      const data = await response.json()
      
      // Validate response structure
      expect(data).toHaveProperty('status')
      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('checks')
      expect(data).toHaveProperty('metadata')
      
      // Validate status values
      expect(['healthy', 'unhealthy', 'degraded']).toContain(data.status)
      
      // Validate checks structure
      expect(data.checks).toHaveProperty('connection')
      expect(data.checks).toHaveProperty('schema')
      expect(data.checks).toHaveProperty('migrations')
      expect(data.checks).toHaveProperty('rls')
      expect(data.checks).toHaveProperty('performance')
      
      // Validate each check has required properties
      Object.values(data.checks).forEach((check: any) => {
        expect(check).toHaveProperty('status')
        expect(['pass', 'fail', 'warning']).toContain(check.status)
      })
      
      // Validate metadata
      expect(data.metadata).toHaveProperty('version')
      expect(data.metadata).toHaveProperty('environment')
    })

    it('should have appropriate cache headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/health/database')
      const response = await DatabaseHealthCheck(request)
      
      expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate')
      expect(response.headers.get('Pragma')).toBe('no-cache')
      expect(response.headers.get('Expires')).toBe('0')
    })

    it('should handle database connection failures gracefully', async () => {
      // Mock environment to test error handling
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://invalid-url.supabase.co'
      
      try {
        const request = new NextRequest('http://localhost:3000/api/health/database')
        const response = await DatabaseHealthCheck(request)
        
        expect(response.status).toBe(503)
        
        const data = await response.json()
        expect(data.status).toBe('unhealthy')
        expect(data.checks.connection.status).toBe('fail')
        expect(data.checks.connection.error).toBeDefined()
      } finally {
        // Restore original URL
        process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
      }
    })
  })

  describe('Services Health Check (/api/health/services)', () => {
    it('should return services health check response', async () => {
      const request = new NextRequest('http://localhost:3000/api/health/services')
      const response = await ServicesHealthCheck(request)
      
      expect([200, 503]).toContain(response.status)
      
      const data = await response.json()
      
      // Validate response structure
      expect(data).toHaveProperty('status')
      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('checks')
      expect(data).toHaveProperty('metadata')
      
      // Validate checks structure
      expect(data.checks).toHaveProperty('supabase')
      expect(data.checks).toHaveProperty('openai')
      expect(data.checks).toHaveProperty('vercel')
      expect(data.checks).toHaveProperty('external')
      
      // Each service check should have status
      Object.values(data.checks).forEach((check: any) => {
        expect(check).toHaveProperty('status')
        expect(['pass', 'fail']).toContain(check.status)
      })
    })
  })

  describe('Overall Health Check (/api/health/overall)', () => {
    it('should return overall health summary', async () => {
      const request = new NextRequest('http://localhost:3000/api/health/overall')
      const response = await OverallHealthCheck(request)
      
      expect([200, 503]).toContain(response.status)
      
      const data = await response.json()
      
      // Validate response structure
      expect(data).toHaveProperty('status')
      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('summary')
      expect(data).toHaveProperty('details')
      expect(data).toHaveProperty('checks')
      expect(data).toHaveProperty('links')
      
      // Validate summary
      expect(data.summary).toHaveProperty('database')
      expect(data.summary).toHaveProperty('services')
      expect(data.summary).toHaveProperty('application')
      
      // Validate checks summary
      expect(data.checks).toHaveProperty('critical')
      expect(data.checks).toHaveProperty('warnings')
      expect(data.checks).toHaveProperty('passed')
      expect(data.checks).toHaveProperty('total')
      
      // Check counts should be numbers
      expect(typeof data.checks.critical).toBe('number')
      expect(typeof data.checks.warnings).toBe('number')
      expect(typeof data.checks.passed).toBe('number')
      expect(typeof data.checks.total).toBe('number')
      
      // Total should equal sum of other counts
      expect(data.checks.total).toBe(
        data.checks.critical + data.checks.warnings + data.checks.passed
      )
    })

    it('should have custom headers for monitoring', async () => {
      const request = new NextRequest('http://localhost:3000/api/health/overall')
      const response = await OverallHealthCheck(request)
      
      expect(['healthy', 'unhealthy', 'degraded']).toContain(response.headers.get('X-Health-Status'))
      expect(response.headers.get('X-Health-Checks')).toMatch(/^\d+\/\d+$/)
    })
  })
})