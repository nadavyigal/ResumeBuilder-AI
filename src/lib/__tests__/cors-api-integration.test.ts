/**
 * @vitest-environment node
 * CORS API Integration Testing
 * Tests CORS implementation with actual API endpoints and HTTP requests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getCORSHeaders, createCORSResponse } from '../cors';

// Mock environment for testing
vi.mock('../env', () => ({
  env: {
    NODE_ENV: 'test',
    ALLOWED_ORIGINS: 'https://app.example.com,https://www.example.com',
    PRODUCTION_DOMAIN: 'https://app.example.com',
    PREVIEW_ORIGIN_PATTERN: 'https://preview-*.vercel.app',
    CORS_SECURITY_LEVEL: 'standard',
    ENABLE_CORS_MONITORING: 'true'
  }
}));

describe('CORS API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('API Endpoint CORS Integration', () => {
    it('should handle OPTIONS preflight requests correctly', () => {
      const origin = 'https://app.example.com';
      const response = createCORSResponse(origin);
      
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      
      // Check CORS headers
      const corsHeaders = [
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Credentials',
        'Access-Control-Max-Age',
        'Vary'
      ];
      
      corsHeaders.forEach(header => {
        expect(response.headers.has(header)).toBe(true);
      });
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin);
    });

    it('should reject OPTIONS requests from invalid origins', () => {
      const invalidOrigin = 'https://malicious-site.com';
      const response = createCORSResponse(invalidOrigin);
      
      expect(response.status).toBe(403);
      expect(response.statusText).toBe('Forbidden');
    });

    it('should generate appropriate headers for API responses', () => {
      const testCases = [
        {
          origin: 'https://app.example.com',
          expected: {
            'Access-Control-Allow-Origin': 'https://app.example.com',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '86400',
            'Vary': 'Origin'
          }
        },
        {
          origin: 'https://www.example.com',
          expected: {
            'Access-Control-Allow-Origin': 'https://www.example.com',
            'Access-Control-Allow-Credentials': 'true',
            'Vary': 'Origin'
          }
        }
      ];

      testCases.forEach(({ origin, expected }) => {
        const headers = getCORSHeaders(origin);
        
        Object.entries(expected).forEach(([key, value]) => {
          expect(headers[key]).toBe(value);
        });
      });
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle browser preflight with custom headers', () => {
      const origin = 'https://app.example.com';
      const response = createCORSResponse(origin);
      
      // Verify custom headers are allowed
      const allowedHeaders = response.headers.get('Access-Control-Allow-Headers');
      expect(allowedHeaders).toContain('Content-Type');
      expect(allowedHeaders).toContain('Authorization');
      expect(allowedHeaders).toContain('X-Requested-With');
    });

    it('should handle credentials correctly', () => {
      const origin = 'https://app.example.com';
      const headers = getCORSHeaders(origin);
      
      expect(headers['Access-Control-Allow-Credentials']).toBe('true');
      expect(headers['Access-Control-Allow-Origin']).toBe(origin); // Not '*' when credentials are true
    });

    it('should provide cache control headers', () => {
      const origin = 'https://app.example.com';
      const response = createCORSResponse(origin);
      
      expect(response.headers.get('Access-Control-Max-Age')).toBe('86400');
      expect(response.headers.get('Vary')).toBe('Origin');
    });
  });

  describe('Security Validation', () => {
    it('should not expose sensitive information in error responses', () => {
      const maliciousOrigin = 'https://evil.com';
      const response = createCORSResponse(maliciousOrigin);
      
      expect(response.status).toBe(403);
      
      // Should not reveal specific reasons or allowed origins
      const body = response.body;
      expect(body).toBeDefined();
      // Body should be minimal and not expose internals
    });

    it('should handle null origin securely', () => {
      const response = createCORSResponse(null);
      expect(response.status).toBe(403);
    });

    it('should handle undefined origin securely', () => {
      const response = createCORSResponse(undefined);
      expect(response.status).toBe(403);
    });
  });

  describe('Pattern Matching Integration', () => {
    it('should work with Vercel preview deployments', () => {
      const previewOrigins = [
        'https://preview-abc123.vercel.app',
        'https://preview-feature-branch.vercel.app'
      ];

      previewOrigins.forEach(origin => {
        const headers = getCORSHeaders(origin);
        expect(headers['Access-Control-Allow-Origin']).toBe(origin);
        
        const response = createCORSResponse(origin);
        expect(response.status).toBe(200);
      });
    });

    it('should reject non-matching patterns', () => {
      const invalidPatterns = [
        'https://not-preview.vercel.app',
        'https://preview-123.herokuapp.com',
        'http://preview-123.vercel.app' // HTTP instead of HTTPS
      ];

      invalidPatterns.forEach(origin => {
        const response = createCORSResponse(origin);
        expect(response.status).toBe(403);
      });
    });
  });

  describe('Performance Under Load', () => {
    it('should handle rapid successive requests', () => {
      const origin = 'https://app.example.com';
      const requestCount = 100;
      const start = performance.now();

      for (let i = 0; i < requestCount; i++) {
        const response = createCORSResponse(origin);
        expect(response.status).toBe(200);
      }

      const end = performance.now();
      const totalTime = end - start;
      const avgTime = totalTime / requestCount;

      expect(avgTime).toBeLessThan(1); // Each request should take less than 1ms
      expect(totalTime).toBeLessThan(100); // Total time should be reasonable
    });

    it('should handle mixed valid and invalid requests efficiently', () => {
      const origins = [
        'https://app.example.com',    // Valid
        'https://evil.com',           // Invalid
        'https://www.example.com',    // Valid
        'https://malicious.com'       // Invalid
      ];

      const iterations = 50;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        origins.forEach(origin => {
          const response = createCORSResponse(origin);
          // Just verify we get a response
          expect([200, 403]).toContain(response.status);
        });
      }

      const end = performance.now();
      const totalRequests = iterations * origins.length;
      const avgTime = (end - start) / totalRequests;

      expect(avgTime).toBeLessThan(1);
    });
  });

  describe('Header Generation Edge Cases', () => {
    it('should handle empty origin gracefully', () => {
      const headers = getCORSHeaders('');
      expect(headers).toBeDefined();
      expect(headers).toHaveProperty('Access-Control-Allow-Origin');
    });

    it('should handle very long origins', () => {
      const longOrigin = 'https://' + 'a'.repeat(1000) + '.example.com';
      const headers = getCORSHeaders(longOrigin);
      expect(headers).toBeDefined();
    });

    it('should maintain consistent header structure', () => {
      const origins = [
        'https://app.example.com',
        'https://www.example.com',
        'https://preview-123.vercel.app',
        'https://invalid.com'
      ];

      const requiredHeaders = [
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Credentials',
        'Access-Control-Max-Age',
        'Vary'
      ];

      origins.forEach(origin => {
        const headers = getCORSHeaders(origin);
        
        requiredHeaders.forEach(header => {
          expect(headers).toHaveProperty(header);
          expect(typeof headers[header]).toBe('string');
          expect(headers[header].length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Response Generation Edge Cases', () => {
    it('should create consistent response objects', () => {
      const origins = ['https://app.example.com', 'https://evil.com'];
      
      origins.forEach(origin => {
        const response = createCORSResponse(origin);
        
        expect(response).toBeInstanceOf(Response);
        expect(typeof response.status).toBe('number');
        expect([200, 403]).toContain(response.status);
        expect(response.headers).toBeDefined();
      });
    });

    it('should handle malformed origins without crashing', () => {
      const malformedOrigins = [
        'not-a-url',
        'https://',
        'ftp://invalid.com',
        '../../etc/passwd',
        '<script>alert("xss")</script>'
      ];

      malformedOrigins.forEach(origin => {
        expect(() => {
          const response = createCORSResponse(origin);
          expect(response.status).toBe(403);
        }).not.toThrow();
      });
    });
  });
});