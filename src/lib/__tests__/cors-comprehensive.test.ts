/**
 * @vitest-environment node
 * Comprehensive CORS Configuration Testing Suite
 * Tests all aspects of the Enhanced CORS Configuration implementation
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { performance } from 'perf_hooks';
import { 
  validateOrigin,
  getAllowedOrigin,
  getCORSHeaders,
  createCORSResponse,
  getCORSConfigSummary,
  type CORSSecurityLevel,
  type CORSValidationResult
} from '../cors';

// Mock the environment module with extended functionality
vi.mock('../env', () => {
  let mockEnv = {
    NODE_ENV: 'test',
    ALLOWED_ORIGINS: '',
    PRODUCTION_DOMAIN: '',
    PREVIEW_ORIGIN_PATTERN: '',
    CORS_SECURITY_LEVEL: '',
    ENABLE_CORS_MONITORING: 'false'
  };

  return {
    env: mockEnv,
    setMockEnv: (newEnv: Record<string, string>) => {
      Object.assign(mockEnv, newEnv);
    },
    resetMockEnv: () => {
      mockEnv = {
        NODE_ENV: 'test',
        ALLOWED_ORIGINS: '',
        PRODUCTION_DOMAIN: '',
        PREVIEW_ORIGIN_PATTERN: '',
        CORS_SECURITY_LEVEL: '',
        ENABLE_CORS_MONITORING: 'false'
      };
    }
  };
});

const { setMockEnv, resetMockEnv } = await import('../env');

// Test data sets for comprehensive testing
const TEST_ORIGINS = {
  LEGITIMATE: [
    'https://app.example.com',
    'https://www.example.com',
    'https://api.example.com',
    'https://staging.example.com',
    'https://preview-abc123.vercel.app',
    'https://pr-feature-xyz.netlify.app'
  ],
  MALICIOUS: [
    'javascript:alert("xss")',
    'data:text/html,<script>alert("xss")</script>',
    'file:///etc/passwd',
    'ftp://malicious.com',
    'vbscript:msgbox("xss")',
    'http://127.0.0.1:3000', // Local IP (malicious in production)
    'http://192.168.1.100:8080',
    'http://10.0.0.1:3000',
    'http://172.16.0.1:8080'
  ],
  DEVELOPMENT: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://[::1]:3000'
  ],
  EDGE_CASES: [
    'null',
    '',
    ' ',
    'undefined',
    'https://very-long-subdomain-name-that-exceeds-normal-length-limits.example.com',
    'https://app.example.com:443', // Standard HTTPS port
    'https://app.example.com:8443' // Non-standard port
  ]
};

const PERFORMANCE_THRESHOLDS = {
  SINGLE_VALIDATION: 1, // 1ms max per validation
  BULK_VALIDATION: 100, // 100ms max for 1000 validations
  PATTERN_MATCHING: 5 // 5ms max for complex pattern matching
};

describe('CORS Comprehensive Testing Suite', () => {
  let consoleSpy: any;

  beforeEach(() => {
    resetMockEnv();
    consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (consoleSpy) {
      consoleSpy.mockRestore();
    }
  });

  describe('1. FUNCTIONAL TESTING - Multi-Origin Support', () => {
    it('should handle single origin configuration', () => {
      setMockEnv({
        ALLOWED_ORIGINS: 'https://app.example.com'
      });

      const result = validateOrigin('https://app.example.com');
      expect(result.allowed).toBe(true);
      
      const result2 = validateOrigin('https://evil.com');
      expect(result2.allowed).toBe(false);
    });

    it('should handle multiple origins (2-5 origins)', () => {
      setMockEnv({
        ALLOWED_ORIGINS: 'https://app.example.com,https://www.example.com,https://api.example.com'
      });

      TEST_ORIGINS.LEGITIMATE.slice(0, 3).forEach(origin => {
        const result = validateOrigin(origin);
        expect(result.allowed).toBe(true);
      });
    });

    it('should handle large origin lists efficiently', () => {
      const manyOrigins = Array.from({ length: 100 }, (_, i) => `https://app${i}.example.com`).join(',');
      setMockEnv({
        ALLOWED_ORIGINS: manyOrigins
      });

      const start = performance.now();
      const result = validateOrigin('https://app50.example.com');
      const end = performance.now();

      expect(result.allowed).toBe(true);
      expect(end - start).toBeLessThan(PERFORMANCE_THRESHOLDS.SINGLE_VALIDATION);
    });

    it('should maintain origin ordering and precedence', () => {
      setMockEnv({
        ALLOWED_ORIGINS: 'https://first.com,https://second.com,https://third.com'
      });

      const firstOrigin = getAllowedOrigin('https://invalid.com');
      expect(firstOrigin).toBe('https://first.com'); // Should return first origin as fallback
    });

    it('should handle whitespace and formatting in origin lists', () => {
      setMockEnv({
        ALLOWED_ORIGINS: ' https://app.example.com , https://www.example.com , https://api.example.com '
      });

      const result1 = validateOrigin('https://app.example.com');
      const result2 = validateOrigin('https://www.example.com');
      const result3 = validateOrigin('https://api.example.com');

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
      expect(result3.allowed).toBe(true);
    });
  });

  describe('2. FUNCTIONAL TESTING - Wildcard Pattern Matching', () => {
    it('should match simple wildcard patterns', () => {
      setMockEnv({
        CORS_SECURITY_LEVEL: 'standard',
        PREVIEW_ORIGIN_PATTERN: 'https://preview-*.vercel.app'
      });

      const validPatterns = [
        'https://preview-abc123.vercel.app',
        'https://preview-feature-xyz.vercel.app',
        'https://preview-test-123-456.vercel.app'
      ];

      validPatterns.forEach(origin => {
        const result = validateOrigin(origin);
        expect(result.allowed).toBe(true);
      });
    });

    it('should match complex wildcard patterns', () => {
      setMockEnv({
        CORS_SECURITY_LEVEL: 'standard',
        PREVIEW_ORIGIN_PATTERN: 'https://*.netlify.app,https://pr-*.staging.example.com'
      });

      const validPatterns = [
        'https://my-app.netlify.app',
        'https://staging-branch.netlify.app',
        'https://pr-123.staging.example.com',
        'https://pr-feature-auth.staging.example.com'
      ];

      validPatterns.forEach(origin => {
        const result = validateOrigin(origin);
        expect(result.allowed).toBe(true);
      });
    });

    it('should reject invalid patterns gracefully', () => {
      setMockEnv({
        CORS_SECURITY_LEVEL: 'standard',
        PREVIEW_ORIGIN_PATTERN: '[invalid-regex-pattern'
      });

      const result = validateOrigin('https://anything.com');
      expect(result.allowed).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid CORS pattern'),
        expect.any(Error)
      );
    });

    it('should handle multiple pattern formats', () => {
      setMockEnv({
        CORS_SECURITY_LEVEL: 'standard',
        PREVIEW_ORIGIN_PATTERN: 'https://preview-*.vercel.app,https://*.netlify.app,https://branch-*.herokuapp.com'
      });

      const testCases = [
        { origin: 'https://preview-123.vercel.app', expected: true },
        { origin: 'https://my-app.netlify.app', expected: true },
        { origin: 'https://branch-feature.herokuapp.com', expected: true },
        { origin: 'https://invalid.example.com', expected: false }
      ];

      testCases.forEach(({ origin, expected }) => {
        const result = validateOrigin(origin);
        expect(result.allowed).toBe(expected);
      });
    });
  });

  describe('3. FUNCTIONAL TESTING - Security Levels', () => {
    it('should enforce strict mode correctly', () => {
      setMockEnv({
        CORS_SECURITY_LEVEL: 'strict',
        ALLOWED_ORIGINS: 'https://app.example.com',
        PREVIEW_ORIGIN_PATTERN: 'https://preview-*.vercel.app'
      });

      // Exact matches should work
      expect(validateOrigin('https://app.example.com').allowed).toBe(true);
      
      // Pattern matching should be disabled in strict mode
      expect(validateOrigin('https://preview-123.vercel.app').allowed).toBe(false);
      
      // Development origins should be blocked
      expect(validateOrigin('http://localhost:3000').allowed).toBe(false);
    });

    it('should allow patterns in standard mode', () => {
      setMockEnv({
        CORS_SECURITY_LEVEL: 'standard',
        ALLOWED_ORIGINS: 'https://app.example.com',
        PREVIEW_ORIGIN_PATTERN: 'https://preview-*.vercel.app'
      });

      // Both exact matches and patterns should work
      expect(validateOrigin('https://app.example.com').allowed).toBe(true);
      expect(validateOrigin('https://preview-123.vercel.app').allowed).toBe(true);
      
      // Development origins should still be blocked
      expect(validateOrigin('http://localhost:3000').allowed).toBe(false);
    });

    it('should be permissive in development mode', () => {
      setMockEnv({
        CORS_SECURITY_LEVEL: 'permissive',
        ALLOWED_ORIGINS: 'https://app.example.com',
        PREVIEW_ORIGIN_PATTERN: 'https://preview-*.vercel.app'
      });

      // Everything should work including development origins
      expect(validateOrigin('https://app.example.com').allowed).toBe(true);
      expect(validateOrigin('https://preview-123.vercel.app').allowed).toBe(true);
      expect(validateOrigin('http://localhost:3000').allowed).toBe(true);
    });

    it('should auto-detect security levels by environment', () => {
      // Test production default
      setMockEnv({ NODE_ENV: 'production' });
      expect(getCORSConfigSummary().securityLevel).toBe('strict');

      // Test staging default
      setMockEnv({ NODE_ENV: 'staging' });
      expect(getCORSConfigSummary().securityLevel).toBe('standard');

      // Test development default
      setMockEnv({ NODE_ENV: 'development' });
      expect(getCORSConfigSummary().securityLevel).toBe('permissive');
    });
  });

  describe('4. SECURITY TESTING - Malicious Origin Detection', () => {
    it('should block all known malicious origin patterns', () => {
      setMockEnv({
        NODE_ENV: 'production',
        CORS_SECURITY_LEVEL: 'strict'
      });

      TEST_ORIGINS.MALICIOUS.forEach(maliciousOrigin => {
        const result = validateOrigin(maliciousOrigin);
        expect(result.allowed).toBe(false);
        expect(result.violationType).toBe('MALICIOUS_PATTERN');
      });
    });

    it('should block private IP addresses in production', () => {
      setMockEnv({
        NODE_ENV: 'production',
        CORS_SECURITY_LEVEL: 'strict'
      });

      const privateIPs = [
        'http://192.168.1.1:3000',
        'http://10.0.0.1:8080',
        'http://172.16.0.1:3000',
        'http://127.0.0.1:3000'
      ];

      privateIPs.forEach(ip => {
        const result = validateOrigin(ip);
        expect(result.allowed).toBe(false);
        expect(result.violationType).toBe('MALICIOUS_PATTERN');
      });
    });

    it('should allow localhost in development but block in production', () => {
      // Development mode
      setMockEnv({
        NODE_ENV: 'development',
        CORS_SECURITY_LEVEL: 'permissive'
      });

      TEST_ORIGINS.DEVELOPMENT.forEach(devOrigin => {
        const result = validateOrigin(devOrigin);
        expect(result.allowed).toBe(true);
      });

      // Production mode
      setMockEnv({
        NODE_ENV: 'production',
        CORS_SECURITY_LEVEL: 'strict'
      });

      TEST_ORIGINS.DEVELOPMENT.forEach(devOrigin => {
        const result = validateOrigin(devOrigin);
        expect(result.allowed).toBe(false);
      });
    });

    it('should handle edge case origins securely', () => {
      setMockEnv({
        NODE_ENV: 'production',
        ALLOWED_ORIGINS: 'https://app.example.com'
      });

      TEST_ORIGINS.EDGE_CASES.forEach(edgeCase => {
        const result = validateOrigin(edgeCase);
        // All edge cases should be rejected except legitimate long subdomains
        if (edgeCase.startsWith('https://very-long-subdomain')) {
          // This should be handled by exact matching
          expect(result.allowed).toBe(false); // Not in allowed origins
        } else {
          expect(result.allowed).toBe(false);
        }
      });
    });
  });

  describe('5. SECURITY TESTING - Attack Vector Scenarios', () => {
    it('should prevent origin header spoofing attempts', () => {
      setMockEnv({
        NODE_ENV: 'production',
        ALLOWED_ORIGINS: 'https://app.example.com'
      });

      const spoofingAttempts = [
        'https://app.example.com.evil.com',
        'https://evil.com/app.example.com',
        'https://app.example.com@evil.com',
        'https://app.example.com:443@evil.com',
        'app.example.com', // Missing protocol
        'http://app.example.com' // Wrong protocol
      ];

      spoofingAttempts.forEach(spoofed => {
        const result = validateOrigin(spoofed);
        expect(result.allowed).toBe(false);
      });
    });

    it('should prevent wildcard injection attempts', () => {
      setMockEnv({
        CORS_SECURITY_LEVEL: 'standard',
        PREVIEW_ORIGIN_PATTERN: 'https://preview-*.vercel.app'
      });

      const injectionAttempts = [
        'https://preview-*.evil.com',
        'https://preview-malicious.vercel.app.evil.com',
        'https://evil.preview-valid.vercel.app'
      ];

      injectionAttempts.forEach(injection => {
        const result = validateOrigin(injection);
        expect(result.allowed).toBe(false);
      });
    });

    it('should prevent protocol downgrade attempts', () => {
      setMockEnv({
        ALLOWED_ORIGINS: 'https://app.example.com'
      });

      // HTTP should not match HTTPS allowed origin
      const result = validateOrigin('http://app.example.com');
      expect(result.allowed).toBe(false);
    });
  });

  describe('6. PERFORMANCE TESTING', () => {
    it('should validate single origins under 1ms', () => {
      setMockEnv({
        ALLOWED_ORIGINS: 'https://app.example.com'
      });

      const iterations = 100;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        validateOrigin('https://app.example.com');
      }

      const end = performance.now();
      const avgTime = (end - start) / iterations;
      
      expect(avgTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SINGLE_VALIDATION);
    });

    it('should handle bulk validations efficiently', () => {
      const manyOrigins = Array.from({ length: 50 }, (_, i) => `https://app${i}.example.com`).join(',');
      setMockEnv({
        ALLOWED_ORIGINS: manyOrigins
      });

      const testOrigins = Array.from({ length: 1000 }, (_, i) => `https://app${i % 50}.example.com`);
      
      const start = performance.now();
      testOrigins.forEach(origin => validateOrigin(origin));
      const end = performance.now();

      expect(end - start).toBeLessThan(PERFORMANCE_THRESHOLDS.BULK_VALIDATION);
    });

    it('should handle complex pattern matching efficiently', () => {
      setMockEnv({
        CORS_SECURITY_LEVEL: 'standard',
        PREVIEW_ORIGIN_PATTERN: 'https://preview-*.vercel.app,https://*.netlify.app,https://branch-*.herokuapp.com'
      });

      const complexOrigin = 'https://preview-very-long-branch-name-with-multiple-dashes.vercel.app';
      
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        validateOrigin(complexOrigin);
      }
      const end = performance.now();

      const avgTime = (end - start) / 100;
      expect(avgTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PATTERN_MATCHING);
    });
  });

  describe('7. MONITORING AND LOGGING TESTING', () => {
    it('should log CORS violations when monitoring is enabled', () => {
      setMockEnv({
        NODE_ENV: 'development',
        ENABLE_CORS_MONITORING: 'true',
        ALLOWED_ORIGINS: 'https://app.example.com'
      });

      getAllowedOrigin('https://evil.com');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('CORS Violation'),
        expect.objectContaining({
          type: 'CORS_VIOLATION',
          origin: 'https://evil.com',
          violationType: 'UNKNOWN_ORIGIN'
        })
      );
    });

    it('should not log when monitoring is disabled', () => {
      setMockEnv({
        NODE_ENV: 'development',
        ENABLE_CORS_MONITORING: 'false',
        ALLOWED_ORIGINS: 'https://app.example.com'
      });

      getAllowedOrigin('https://evil.com');
      
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should categorize violations correctly', () => {
      setMockEnv({
        NODE_ENV: 'development',
        ENABLE_CORS_MONITORING: 'true',
        ALLOWED_ORIGINS: 'https://app.example.com'
      });

      const testCases = [
        { origin: null, expectedType: 'UNKNOWN_ORIGIN' },
        { origin: 'javascript:alert("xss")', expectedType: 'MALICIOUS_PATTERN' },
        { origin: 'https://unknown.com', expectedType: 'UNKNOWN_ORIGIN' }
      ];

      testCases.forEach(({ origin, expectedType }) => {
        consoleSpy.mockClear();
        getAllowedOrigin(origin);
        
        if (origin === null) {
          expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('CORS Violation'),
            expect.objectContaining({
              violationType: expectedType
            })
          );
        } else {
          expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('CORS Violation'),
            expect.objectContaining({
              origin: origin,
              violationType: expectedType
            })
          );
        }
      });
    });

    it('should be resilient to logging failures', () => {
      setMockEnv({
        NODE_ENV: 'development',
        ENABLE_CORS_MONITORING: 'true',
        ALLOWED_ORIGINS: 'https://app.example.com'
      });

      // Mock console.warn to throw an error
      consoleSpy.mockImplementation(() => {
        throw new Error('Logging service unavailable');
      });

      // Should not crash the application
      expect(() => {
        getAllowedOrigin('https://evil.com');
      }).not.toThrow();
    });
  });

  describe('8. INTEGRATION SCENARIOS', () => {
    it('should handle complex multi-environment setup', () => {
      setMockEnv({
        NODE_ENV: 'staging',
        ALLOWED_ORIGINS: 'https://staging.example.com,https://app.example.com',
        PREVIEW_ORIGIN_PATTERN: 'https://pr-*.staging.example.com,https://preview-*.vercel.app',
        CORS_SECURITY_LEVEL: 'standard',
        ENABLE_CORS_MONITORING: 'true'
      });

      const summary = getCORSConfigSummary();
      expect(summary).toEqual({
        securityLevel: 'standard',
        allowedOrigins: ['https://staging.example.com', 'https://app.example.com'],
        allowedPatterns: ['https://pr-*.staging.example.com', 'https://preview-*.vercel.app'],
        environment: 'staging',
        monitoringEnabled: true
      });

      // Test various origin types
      expect(validateOrigin('https://staging.example.com').allowed).toBe(true);
      expect(validateOrigin('https://pr-123.staging.example.com').allowed).toBe(true);
      expect(validateOrigin('https://preview-abc.vercel.app').allowed).toBe(true);
      expect(validateOrigin('https://evil.com').allowed).toBe(false);
    });

    it('should maintain backward compatibility', () => {
      setMockEnv({
        PRODUCTION_DOMAIN: 'https://legacy.example.com',
        ALLOWED_ORIGINS: '' // Empty to test fallback
      });

      const result = validateOrigin('https://legacy.example.com');
      expect(result.allowed).toBe(true);
    });

    it('should provide proper CORS headers for valid origins', () => {
      setMockEnv({
        ALLOWED_ORIGINS: 'https://app.example.com'
      });

      const headers = getCORSHeaders('https://app.example.com');
      expect(headers).toEqual({
        'Access-Control-Allow-Origin': 'https://app.example.com',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin'
      });
    });

    it('should create proper CORS responses', () => {
      setMockEnv({
        ALLOWED_ORIGINS: 'https://app.example.com'
      });

      // Valid origin should get 200
      const validResponse = createCORSResponse('https://app.example.com');
      expect(validResponse.status).toBe(200);
      expect(validResponse.headers.get('Access-Control-Allow-Origin')).toBe('https://app.example.com');

      // Invalid origin should get 403
      const invalidResponse = createCORSResponse('https://evil.com');
      expect(invalidResponse.status).toBe(403);
      expect(invalidResponse.statusText).toBe('Forbidden');
    });
  });

  describe('9. ERROR HANDLING AND EDGE CASES', () => {
    it('should handle malformed environment variables gracefully', () => {
      setMockEnv({
        ALLOWED_ORIGINS: ',,,https://app.example.com,,,',
        PREVIEW_ORIGIN_PATTERN: ',,,https://preview-*.vercel.app,,,'
      });

      const summary = getCORSConfigSummary();
      expect(summary.allowedOrigins).toEqual(['https://app.example.com']);
      expect(summary.allowedPatterns).toEqual(['https://preview-*.vercel.app']);
    });

    it('should handle empty configurations', () => {
      setMockEnv({
        ALLOWED_ORIGINS: '',
        PREVIEW_ORIGIN_PATTERN: '',
        CORS_SECURITY_LEVEL: ''
      });

      const summary = getCORSConfigSummary();
      expect(summary.allowedOrigins).toEqual([]);
      expect(summary.allowedPatterns).toEqual([]);
      expect(summary.securityLevel).toBe('strict'); // Default for test environment
    });

    it('should handle very long origin strings', () => {
      const veryLongOrigin = 'https://' + 'a'.repeat(1000) + '.example.com';
      const result = validateOrigin(veryLongOrigin);
      expect(result.allowed).toBe(false);
      expect(result).toHaveProperty('violationType');
    });

    it('should handle unicode and special characters in origins', () => {
      const specialOrigins = [
        'https://app-tëst.example.com',
        'https://app.测试.com',
        'https://app.example.com?param=value',
        'https://app.example.com#fragment'
      ];

      specialOrigins.forEach(origin => {
        const result = validateOrigin(origin);
        expect(result).toHaveProperty('allowed');
        expect(result).toHaveProperty('origin');
      });
    });
  });

  describe('10. COMPLIANCE AND SECURITY STANDARDS', () => {
    it('should meet OWASP CORS security requirements', () => {
      setMockEnv({
        NODE_ENV: 'production',
        ALLOWED_ORIGINS: 'https://app.example.com',
        CORS_SECURITY_LEVEL: 'strict'
      });

      // Test OWASP recommendations
      // 1. No wildcard in production
      const wildcardResult = validateOrigin('*');
      expect(wildcardResult.allowed).toBe(false);

      // 2. HTTPS only for production origins
      const httpResult = validateOrigin('http://app.example.com');
      expect(httpResult.allowed).toBe(false);

      // 3. Explicit origin validation
      const validResult = validateOrigin('https://app.example.com');
      expect(validResult.allowed).toBe(true);
    });

    it('should provide security headers according to best practices', () => {
      setMockEnv({
        ALLOWED_ORIGINS: 'https://app.example.com'
      });

      const headers = getCORSHeaders('https://app.example.com');
      
      // Check required security headers
      expect(headers).toHaveProperty('Access-Control-Allow-Origin');
      expect(headers).toHaveProperty('Access-Control-Allow-Methods');
      expect(headers).toHaveProperty('Access-Control-Allow-Headers');
      expect(headers).toHaveProperty('Access-Control-Allow-Credentials');
      expect(headers).toHaveProperty('Vary');
      
      // Verify secure defaults
      expect(headers['Access-Control-Allow-Credentials']).toBe('true');
      expect(headers['Vary']).toBe('Origin');
    });
  });
});