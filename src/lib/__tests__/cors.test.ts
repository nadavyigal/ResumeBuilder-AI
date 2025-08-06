/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import { 
  validateOrigin,
  getAllowedOrigin,
  getCORSHeaders,
  createCORSResponse,
  getCORSConfigSummary,
  type CORSSecurityLevel,
  type CORSValidationResult
} from '../cors';

// Mock the environment module
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
    }
  };
});

// Import the setMockEnv function for test setup
const { setMockEnv } = await import('../env');

describe('CORS Validation', () => {
  beforeEach(() => {
    // Reset environment to defaults
    setMockEnv({
      NODE_ENV: 'test',
      ALLOWED_ORIGINS: '',
      PRODUCTION_DOMAIN: '',
      PREVIEW_ORIGIN_PATTERN: '',
      CORS_SECURITY_LEVEL: '',
      ENABLE_CORS_MONITORING: 'false'
    });
    
    // Clear console mocks
    vi.clearAllMocks();
  });

  describe('validateOrigin', () => {
    describe('Basic validation', () => {
      it('should reject null origin', () => {
        const result = validateOrigin(null);
        expect(result.allowed).toBe(false);
        expect(result.origin).toBe('null');
        expect(result.violationType).toBe('UNKNOWN_ORIGIN');
      });

      it('should reject undefined origin', () => {
        const result = validateOrigin(undefined as any);
        expect(result.allowed).toBe(false);
        expect(result.origin).toBe('null');
        expect(result.violationType).toBe('UNKNOWN_ORIGIN');
      });

      it('should reject empty string origin', () => {
        const result = validateOrigin('');
        expect(result.allowed).toBe(false);
        expect(result.violationType).toBe('UNKNOWN_ORIGIN');
      });
    });

    describe('Malicious pattern detection', () => {
      it('should block malicious origins in production', () => {
        setMockEnv({ NODE_ENV: 'production' });
        
        const maliciousOrigins = [
          'javascript:alert("xss")',
          'data:text/html,<script>alert("xss")</script>',
          'file:///etc/passwd',
          'http://192.168.1.1:3000',
          'http://10.0.0.1:3000',
          'http://172.16.0.1:3000'
        ];

        maliciousOrigins.forEach(origin => {
          const result = validateOrigin(origin);
          expect(result.allowed).toBe(false);
          expect(result.violationType).toBe('MALICIOUS_PATTERN');
        });
      });

      it('should allow localhost in development mode', () => {
        setMockEnv({ NODE_ENV: 'development' });
        
        const devOrigins = [
          'http://localhost:3000',
          'http://127.0.0.1:3000',
          'http://[::1]:3000'
        ];

        devOrigins.forEach(origin => {
          const result = validateOrigin(origin);
          expect(result.allowed).toBe(true);
        });
      });
    });

    describe('Exact origin matching', () => {
      it('should allow exact matches from ALLOWED_ORIGINS', () => {
        setMockEnv({
          ALLOWED_ORIGINS: 'https://app.example.com,https://www.example.com'
        });

        const result1 = validateOrigin('https://app.example.com');
        expect(result1.allowed).toBe(true);
        
        const result2 = validateOrigin('https://www.example.com');
        expect(result2.allowed).toBe(true);
        
        const result3 = validateOrigin('https://evil.com');
        expect(result3.allowed).toBe(false);
      });

      it('should handle PRODUCTION_DOMAIN for backward compatibility', () => {
        setMockEnv({
          PRODUCTION_DOMAIN: 'https://legacy-domain.com'
        });

        const result = validateOrigin('https://legacy-domain.com');
        expect(result.allowed).toBe(true);
      });
    });

    describe('Pattern matching', () => {
      it('should match wildcard patterns in standard security level', () => {
        setMockEnv({
          CORS_SECURITY_LEVEL: 'standard',
          PREVIEW_ORIGIN_PATTERN: 'https://preview-*.vercel.app,https://*.netlify.app'
        });

        const validPatterns = [
          'https://preview-abc123.vercel.app',
          'https://preview-feature-xyz.vercel.app',
          'https://my-app.netlify.app',
          'https://staging.netlify.app'
        ];

        validPatterns.forEach(origin => {
          const result = validateOrigin(origin);
          expect(result.allowed).toBe(true);
        });
      });

      it('should reject pattern matching in strict security level', () => {
        setMockEnv({
          CORS_SECURITY_LEVEL: 'strict',
          PREVIEW_ORIGIN_PATTERN: 'https://preview-*.vercel.app'
        });

        const result = validateOrigin('https://preview-abc123.vercel.app');
        expect(result.allowed).toBe(false);
      });

      it('should handle invalid patterns gracefully', () => {
        setMockEnv({
          CORS_SECURITY_LEVEL: 'standard',
          PREVIEW_ORIGIN_PATTERN: '[invalid-regex-pattern'
        });

        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const result = validateOrigin('https://anything.com');
        expect(result.allowed).toBe(false);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });
    });

    describe('Security levels', () => {
      it('should use strict mode in production by default', () => {
        setMockEnv({ NODE_ENV: 'production' });
        const summary = getCORSConfigSummary();
        expect(summary.securityLevel).toBe('strict');
      });

      it('should use standard mode in staging by default', () => {
        setMockEnv({ NODE_ENV: 'staging' });
        const summary = getCORSConfigSummary();
        expect(summary.securityLevel).toBe('standard');
      });

      it('should use permissive mode in development by default', () => {
        setMockEnv({ NODE_ENV: 'development' });
        const summary = getCORSConfigSummary();
        expect(summary.securityLevel).toBe('permissive');
      });

      it('should respect explicit CORS_SECURITY_LEVEL', () => {
        setMockEnv({ 
          NODE_ENV: 'production',
          CORS_SECURITY_LEVEL: 'permissive'
        });
        const summary = getCORSConfigSummary();
        expect(summary.securityLevel).toBe('permissive');
      });
    });
  });

  describe('getAllowedOrigin', () => {
    it('should return validated origin when valid', () => {
      setMockEnv({
        ALLOWED_ORIGINS: 'https://app.example.com'
      });

      const result = getAllowedOrigin('https://app.example.com');
      expect(result).toBe('https://app.example.com');
    });

    it('should return fallback for invalid origins', () => {
      setMockEnv({
        ALLOWED_ORIGINS: 'https://app.example.com'
      });

      const result = getAllowedOrigin('https://evil.com');
      expect(result).toBe('https://app.example.com'); // Returns first allowed origin
    });

    it('should use legacy behavior when no request origin provided', () => {
      setMockEnv({
        NODE_ENV: 'development'
      });

      const result = getAllowedOrigin();
      expect(result).toBe('http://localhost:3000');
    });

    it('should log violations when monitoring enabled', () => {
      setMockEnv({
        NODE_ENV: 'development',
        ENABLE_CORS_MONITORING: 'true',
        ALLOWED_ORIGINS: 'https://app.example.com'
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      getAllowedOrigin('https://evil.com');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('CORS Violation'), expect.any(Object));
      consoleSpy.mockRestore();
    });
  });

  describe('getCORSHeaders', () => {
    it('should include Vary: Origin header for multiple origins', () => {
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

    it('should handle invalid origins gracefully', () => {
      setMockEnv({
        ALLOWED_ORIGINS: 'https://app.example.com'
      });

      const headers = getCORSHeaders('https://evil.com');
      expect(headers['Access-Control-Allow-Origin']).toBe('https://app.example.com');
    });
  });

  describe('createCORSResponse', () => {
    it('should return 200 OK for valid origins', () => {
      setMockEnv({
        ALLOWED_ORIGINS: 'https://app.example.com'
      });

      const response = createCORSResponse('https://app.example.com');
      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://app.example.com');
    });

    it('should return 403 Forbidden for invalid origins', () => {
      setMockEnv({
        ALLOWED_ORIGINS: 'https://app.example.com'
      });

      const response = createCORSResponse('https://evil.com');
      expect(response.status).toBe(403);
      expect(response.statusText).toBe('Forbidden');
    });

    it('should return 403 for malicious origins', () => {
      const response = createCORSResponse('javascript:alert("xss")');
      expect(response.status).toBe(403);
    });
  });

  describe('getCORSConfigSummary', () => {
    it('should return complete configuration summary', () => {
      setMockEnv({
        NODE_ENV: 'staging',
        ALLOWED_ORIGINS: 'https://app.example.com,https://www.example.com',
        PREVIEW_ORIGIN_PATTERN: 'https://preview-*.vercel.app',
        CORS_SECURITY_LEVEL: 'standard',
        ENABLE_CORS_MONITORING: 'true'
      });

      const summary = getCORSConfigSummary();
      expect(summary).toEqual({
        securityLevel: 'standard',
        allowedOrigins: ['https://app.example.com', 'https://www.example.com'],
        allowedPatterns: ['https://preview-*.vercel.app'],
        environment: 'staging',
        monitoringEnabled: true
      });
    });

    it('should handle empty configuration', () => {
      const summary = getCORSConfigSummary();
      expect(summary.allowedOrigins).toEqual([]);
      expect(summary.allowedPatterns).toEqual([]);
      expect(summary.monitoringEnabled).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complex multi-environment setup', () => {
      setMockEnv({
        NODE_ENV: 'staging',
        ALLOWED_ORIGINS: 'https://staging.example.com,https://app.example.com',
        PREVIEW_ORIGIN_PATTERN: 'https://pr-*.staging.example.com',
        CORS_SECURITY_LEVEL: 'standard'
      });

      // Test exact matches
      expect(validateOrigin('https://staging.example.com').allowed).toBe(true);
      expect(validateOrigin('https://app.example.com').allowed).toBe(true);
      
      // Test pattern matches
      expect(validateOrigin('https://pr-123.staging.example.com').allowed).toBe(true);
      expect(validateOrigin('https://pr-feature-xyz.staging.example.com').allowed).toBe(true);
      
      // Test rejections
      expect(validateOrigin('https://evil.com').allowed).toBe(false);
      expect(validateOrigin('https://pr-123.production.example.com').allowed).toBe(false);
    });

    it('should maintain backward compatibility', () => {
      setMockEnv({
        PRODUCTION_DOMAIN: 'https://legacy.example.com'
      });

      const result = validateOrigin('https://legacy.example.com');
      expect(result.allowed).toBe(true);
    });

    it('should prioritize security in production', () => {
      setMockEnv({
        NODE_ENV: 'production',
        ALLOWED_ORIGINS: 'https://app.example.com',
        PREVIEW_ORIGIN_PATTERN: 'https://preview-*.vercel.app'
      });

      // Exact match should work
      expect(validateOrigin('https://app.example.com').allowed).toBe(true);
      
      // Pattern matching should be disabled in strict mode (default for production)
      expect(validateOrigin('https://preview-abc.vercel.app').allowed).toBe(false);
      
      // Malicious origins should be blocked
      expect(validateOrigin('javascript:alert("xss")').allowed).toBe(false);
    });
  });

  describe('Performance and edge cases', () => {
    it('should handle very long origin lists efficiently', () => {
      const manyOrigins = Array.from({ length: 1000 }, (_, i) => `https://app${i}.example.com`).join(',');
      setMockEnv({
        ALLOWED_ORIGINS: manyOrigins
      });

      const start = performance.now();
      const result = validateOrigin('https://app500.example.com');
      const end = performance.now();
      
      expect(result.allowed).toBe(true);
      expect(end - start).toBeLessThan(10); // Should be very fast
    });

    it('should handle malformed environment variables', () => {
      setMockEnv({
        ALLOWED_ORIGINS: ',,,https://app.example.com,,,',
        PREVIEW_ORIGIN_PATTERN: ',,,https://preview-*.vercel.app,,,'
      });

      const summary = getCORSConfigSummary();
      expect(summary.allowedOrigins).toEqual(['https://app.example.com']);
      expect(summary.allowedPatterns).toEqual(['https://preview-*.vercel.app']);
    });

    it('should be resilient to logging failures', () => {
      setMockEnv({
        NODE_ENV: 'development',
        ENABLE_CORS_MONITORING: 'true'
      });

      // Mock console.warn to throw an error
      const originalWarn = console.warn;
      console.warn = vi.fn().mockImplementation(() => {
        throw new Error('Logging service unavailable');
      });

      // Should not crash the application
      expect(() => {
        getAllowedOrigin('https://evil.com');
      }).not.toThrow();

      console.warn = originalWarn;
    });
  });
});