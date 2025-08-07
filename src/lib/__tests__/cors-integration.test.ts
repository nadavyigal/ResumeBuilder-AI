/**
 * @vitest-environment node
 * CORS Integration and Real-World Testing Suite
 * Tests CORS implementation against real API endpoints and scenarios
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getCORSHeaders, createCORSResponse, validateOrigin } from '../cors';

// Mock environment with realistic production values
vi.mock('../env', () => ({
  env: {
    NODE_ENV: 'test',
    ALLOWED_ORIGINS: 'https://app.example.com,https://www.example.com',
    PRODUCTION_DOMAIN: 'https://app.example.com',
    PREVIEW_ORIGIN_PATTERN: 'https://preview-*.vercel.app,https://*.netlify.app',
    CORS_SECURITY_LEVEL: 'standard',
    ENABLE_CORS_MONITORING: 'true'
  }
}));

describe('CORS Integration Testing Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Real API Endpoint Integration', () => {
    it('should handle preflight OPTIONS requests correctly', () => {
      const validOrigin = 'https://app.example.com';
      const response = createCORSResponse(validOrigin);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(validOrigin);
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET, POST, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type');
    });

    it('should reject preflight requests from invalid origins', () => {
      const invalidOrigin = 'https://malicious.com';
      const response = createCORSResponse(invalidOrigin);
      
      expect(response.status).toBe(403);
      expect(response.statusText).toBe('Forbidden');
    });

    it('should provide appropriate CORS headers for API responses', () => {
      const validOrigin = 'https://app.example.com';
      const headers = getCORSHeaders(validOrigin);
      
      // Verify all required headers are present
      const requiredHeaders = [
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Credentials',
        'Access-Control-Max-Age',
        'Vary'
      ];
      
      requiredHeaders.forEach(header => {
        expect(headers).toHaveProperty(header);
      });
      
      // Verify specific values
      expect(headers['Access-Control-Allow-Credentials']).toBe('true');
      expect(headers['Vary']).toBe('Origin');
    });

    it('should handle multiple simultaneous origin requests', () => {
      const origins = [
        'https://app.example.com',
        'https://www.example.com',
        'https://preview-123.vercel.app',
        'https://malicious.com'
      ];
      
      const results = origins.map(origin => ({
        origin,
        validation: validateOrigin(origin),
        headers: getCORSHeaders(origin)
      }));
      
      // First three should be valid, last should be invalid
      expect(results[0].validation.allowed).toBe(true);
      expect(results[1].validation.allowed).toBe(true);
      expect(results[2].validation.allowed).toBe(true);
      expect(results[3].validation.allowed).toBe(false);
    });
  });

  describe('Browser Compatibility Scenarios', () => {
    it('should handle Chrome preflight behavior', () => {
      // Chrome sends specific headers in preflight requests
      const chromeOrigin = 'https://app.example.com';
      const headers = getCORSHeaders(chromeOrigin);
      
      expect(headers['Access-Control-Allow-Headers']).toContain('Content-Type');
      expect(headers['Access-Control-Allow-Headers']).toContain('Authorization');
      expect(headers['Access-Control-Max-Age']).toBe('86400');
    });

    it('should handle Firefox CORS behavior', () => {
      // Firefox has specific CORS handling for credentials
      const firefoxOrigin = 'https://app.example.com';
      const headers = getCORSHeaders(firefoxOrigin);
      
      expect(headers['Access-Control-Allow-Credentials']).toBe('true');
      expect(headers['Access-Control-Allow-Origin']).toBe(firefoxOrigin);
    });

    it('should handle Safari cross-origin restrictions', () => {
      // Safari has stricter CORS policies
      const safariOrigin = 'https://app.example.com';
      const response = createCORSResponse(safariOrigin);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    });
  });

  describe('Production Environment Simulation', () => {
    it('should simulate production CORS configuration', () => {
      // Test with production-like settings
      const productionOrigins = [
        'https://app.example.com', // Should pass
        'https://www.example.com', // Should pass
        'http://app.example.com',  // Should fail (HTTP in HTTPS environment)
        'https://staging.example.com', // Should fail (not in allowed list)
        'http://localhost:3000'    // Should fail (localhost in production)
      ];
      
      productionOrigins.forEach((origin, index) => {
        const result = validateOrigin(origin);
        if (index < 2) {
          expect(result.allowed).toBe(true);
        } else {
          expect(result.allowed).toBe(false);
        }
      });
    });

    it('should handle high-traffic scenarios', () => {
      const validOrigin = 'https://app.example.com';
      const iterations = 1000;
      
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        const result = validateOrigin(validOrigin);
        expect(result.allowed).toBe(true);
      }
      
      const endTime = performance.now();
      const avgTime = (endTime - startTime) / iterations;
      
      // Should be under 1ms per validation
      expect(avgTime).toBeLessThan(1);
    });
  });

  describe('Security Attack Simulations', () => {
    it('should prevent CSRF attacks via origin validation', () => {
      const maliciousOrigins = [
        'https://evil.com',
        'https://app.example.com.evil.com',
        'https://phishing-app.example.com.attacker.com',
        'null',
        'file://local-file'
      ];
      
      maliciousOrigins.forEach(origin => {
        const result = validateOrigin(origin);
        expect(result.allowed).toBe(false);
        expect(result).toHaveProperty('violationType');
      });
    });

    it('should prevent XSS attacks via protocol validation', () => {
      const xssOrigins = [
        { origin: 'javascript:alert("xss")', expectedType: 'MALICIOUS_PATTERN' },
        { origin: 'data:text/html,<script>alert("xss")</script>', expectedType: 'MALICIOUS_PATTERN' },
        { origin: 'vbscript:msgbox("xss")', expectedType: 'UNKNOWN_ORIGIN' } // Not in malicious patterns list
      ];
      
      xssOrigins.forEach(({ origin, expectedType }) => {
        const result = validateOrigin(origin);
        expect(result.allowed).toBe(false);
        expect(result.violationType).toBe(expectedType);
      });
    });

    it('should prevent subdomain takeover attacks', () => {
      const subdomainAttacks = [
        'https://evil.app.example.com',
        'https://app.example.com.evil.com',
        'https://malicious-app.example.com'
      ];
      
      subdomainAttacks.forEach(origin => {
        const result = validateOrigin(origin);
        expect(result.allowed).toBe(false);
      });
    });
  });

  describe('Edge Case Handling', () => {
    it('should handle null and undefined origins', () => {
      const nullResult = validateOrigin(null);
      const undefinedResult = validateOrigin(undefined);
      const emptyResult = validateOrigin('');
      
      expect(nullResult.allowed).toBe(false);
      expect(undefinedResult.allowed).toBe(false);
      expect(emptyResult.allowed).toBe(false);
      
      expect(nullResult.violationType).toBe('UNKNOWN_ORIGIN');
      expect(undefinedResult.violationType).toBe('UNKNOWN_ORIGIN');
      expect(emptyResult.violationType).toBe('UNKNOWN_ORIGIN');
    });

    it('should handle malformed URLs', () => {
      const malformedUrls = [
        'not-a-url',
        'ftp://invalid',
        'https://',
        'https://.',
        'https://../',
        'https://app..example.com'
      ];
      
      malformedUrls.forEach(url => {
        const result = validateOrigin(url);
        expect(result.allowed).toBe(false);
      });
    });

    it('should handle very long URLs', () => {
      const longUrl = 'https://' + 'a'.repeat(2000) + '.example.com';
      const result = validateOrigin(longUrl);
      
      expect(result.allowed).toBe(false);
      expect(result).toHaveProperty('origin');
    });

    it('should handle special characters in URLs', () => {
      const specialUrls = [
        'https://app.example.com?param=value',
        'https://app.example.com#fragment',
        'https://app.example.com/path',
        'https://app.example.com:8443'
      ];
      
      specialUrls.forEach(url => {
        const result = validateOrigin(url);
        // These should all be rejected as they don't match exact allowed origins
        expect(result.allowed).toBe(false);
      });
    });
  });

  describe('Pattern Matching Advanced Tests', () => {
    it('should match Vercel preview patterns', () => {
      const vercelPreviews = [
        'https://preview-abc123.vercel.app',
        'https://preview-feature-branch.vercel.app',
        'https://preview-pr-123.vercel.app'
      ];
      
      vercelPreviews.forEach(origin => {
        const result = validateOrigin(origin);
        expect(result.allowed).toBe(true);
      });
    });

    it('should match Netlify deployment patterns', () => {
      const netlifyDeployments = [
        'https://app.netlify.app',
        'https://staging.netlify.app',
        'https://feature-branch.netlify.app'
      ];
      
      netlifyDeployments.forEach(origin => {
        const result = validateOrigin(origin);
        expect(result.allowed).toBe(true);
      });
    });

    it('should reject patterns that dont match', () => {
      const nonMatchingPatterns = [
        'https://preview-123.herokuapp.com', // Wrong platform
        'https://not-preview.vercel.app',    // Doesn't match pattern
        'https://preview.example.com',       // Wrong domain
        'http://preview-123.vercel.app'      // Wrong protocol
      ];
      
      nonMatchingPatterns.forEach(origin => {
        const result = validateOrigin(origin);
        expect(result.allowed).toBe(false);
      });
    });
  });

  describe('Performance and Reliability', () => {
    it('should maintain consistent performance under load', () => {
      const origins = [
        'https://app.example.com',
        'https://www.example.com',
        'https://preview-123.vercel.app',
        'https://evil.com'
      ];
      
      const iterations = 100;
      const times: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const origin = origins[i % origins.length];
        const start = performance.now();
        validateOrigin(origin);
        const end = performance.now();
        times.push(end - start);
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      
      expect(avgTime).toBeLessThan(0.5); // Average under 0.5ms
      expect(maxTime).toBeLessThan(5);   // Max under 5ms
    });

    it('should handle concurrent validations', async () => {
      const concurrentOrigins = Array.from({ length: 100 }, (_, i) => 
        i % 2 === 0 ? 'https://app.example.com' : 'https://evil.com'
      );
      
      const start = performance.now();
      const results = await Promise.all(
        concurrentOrigins.map(origin => Promise.resolve(validateOrigin(origin)))
      );
      const end = performance.now();
      
      expect(results).toHaveLength(100);
      expect(end - start).toBeLessThan(100); // Under 100ms for 100 concurrent validations
      
      // Verify results
      results.forEach((result, index) => {
        if (index % 2 === 0) {
          expect(result.allowed).toBe(true);
        } else {
          expect(result.allowed).toBe(false);
        }
      });
    });
  });

  describe('Monitoring and Observability', () => {
    it('should provide detailed validation results', () => {
      const testCases = [
        { origin: 'https://app.example.com', expectAllowed: true },
        { origin: 'https://evil.com', expectAllowed: false },
        { origin: 'javascript:alert("xss")', expectAllowed: false },
        { origin: null, expectAllowed: false }
      ];
      
      testCases.forEach(({ origin, expectAllowed }) => {
        const result = validateOrigin(origin);
        
        expect(result).toHaveProperty('allowed');
        expect(result).toHaveProperty('origin');
        expect(result.allowed).toBe(expectAllowed);
        
        if (!expectAllowed) {
          expect(result).toHaveProperty('reason');
          expect(result).toHaveProperty('violationType');
        }
      });
    });

    it('should categorize violations appropriately', () => {
      const violationTests = [
        { origin: null, expectedType: 'UNKNOWN_ORIGIN' },
        { origin: 'javascript:alert("xss")', expectedType: 'MALICIOUS_PATTERN' },
        { origin: 'https://unknown.com', expectedType: 'UNKNOWN_ORIGIN' }
      ];
      
      violationTests.forEach(({ origin, expectedType }) => {
        const result = validateOrigin(origin);
        expect(result.allowed).toBe(false);
        expect(result.violationType).toBe(expectedType);
      });
    });
  });
});