import { env } from './env';

/**
 * Security levels for CORS validation
 */
export type CORSSecurityLevel = 'strict' | 'standard' | 'permissive';

/**
 * CORS violation types for logging
 */
export type CORSViolationType = 'UNKNOWN_ORIGIN' | 'MALICIOUS_PATTERN' | 'INVALID_PATTERN' | 'ENVIRONMENT_RESTRICTED';

/**
 * CORS validation result
 */
export interface CORSValidationResult {
  allowed: boolean;
  origin: string;
  reason?: string;
  violationType?: CORSViolationType;
}

/**
 * Known malicious patterns to block
 */
const MALICIOUS_PATTERNS = [
  /localhost:\d+/, // Block localhost in production
  /127\.0\.0\.1/, // Block local IP
  /192\.168\./, // Block local network
  /10\.0\./, // Block local network
  /172\.(1[6-9]|2[0-9]|3[0-1])\./, // Block local network
  /null/, // Block null origin
  /undefined/, // Block undefined origin
  /javascript:/, // Block javascript protocol
  /data:/, // Block data protocol
  /file:/, // Block file protocol
];

/**
 * Development-only patterns (allowed in development)
 */
const DEV_PATTERNS = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  /^http:\/\/\[::1\]:\d+$/,
];

/**
 * Get current CORS security level based on environment
 */
function getSecurityLevel(): CORSSecurityLevel {
  // For build-time, check if the property exists on the env object
  const corsLevel = (env as any).CORS_SECURITY_LEVEL;
  if (corsLevel) {
    return corsLevel as CORSSecurityLevel;
  }
  
  // Default security levels by environment
  switch (env.NODE_ENV) {
    case 'production':
      return 'strict';
    case 'staging':
      return 'standard';
    case 'development':
    case 'test':
      return 'permissive';
    default:
      return 'strict';
  }
}

/**
 * Check if origin matches any malicious patterns
 */
function isMaliciousOrigin(origin: string, securityLevel: CORSSecurityLevel): boolean {
  // In development/permissive mode, allow local patterns
  if (securityLevel === 'permissive') {
    const isLocalDev = DEV_PATTERNS.some(pattern => pattern.test(origin));
    if (isLocalDev) {
      return false;
    }
  }
  
  // Check against malicious patterns
  return MALICIOUS_PATTERNS.some(pattern => pattern.test(origin));
}

/**
 * Check if origin matches allowed pattern
 */
function matchesPattern(origin: string, pattern: string): boolean {
  try {
    // Convert pattern to regex, replacing * with appropriate regex
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '[^.]*')
      .replace(/^/, '^')
      .replace(/$/, '$');
    
    const regex = new RegExp(regexPattern);
    return regex.test(origin);
  } catch (error) {
    console.warn(`Invalid CORS pattern: ${pattern}`, error);
    return false;
  }
}

/**
 * Get allowed origins from environment
 */
function getAllowedOrigins(): string[] {
  const origins: string[] = [];
  
  // Add ALLOWED_ORIGINS (comma-separated)
  if ((env as any).ALLOWED_ORIGINS) {
    origins.push(...(env as any).ALLOWED_ORIGINS.split(',').map((o: string) => o.trim()).filter(Boolean));
  }
  
  // Add PRODUCTION_DOMAIN for backward compatibility
  if ((env as any).PRODUCTION_DOMAIN && !origins.includes((env as any).PRODUCTION_DOMAIN)) {
    origins.push((env as any).PRODUCTION_DOMAIN);
  }
  
  return origins;
}

/**
 * Get allowed origin patterns from environment
 */
function getAllowedPatterns(): string[] {
  const patterns: string[] = [];
  
  // Add PREVIEW_ORIGIN_PATTERN (comma-separated)
  if ((env as any).PREVIEW_ORIGIN_PATTERN) {
    patterns.push(...(env as any).PREVIEW_ORIGIN_PATTERN.split(',').map((p: string) => p.trim()).filter(Boolean));
  }
  
  return patterns;
}

/**
 * Validate origin against allowed origins, patterns, and security policies
 */
export function validateOrigin(origin: string | null): CORSValidationResult {
  // Handle null/undefined origin
  if (!origin) {
    return {
      allowed: false,
      origin: 'null',
      reason: 'No origin provided',
      violationType: 'UNKNOWN_ORIGIN'
    };
  }
  
  const securityLevel = getSecurityLevel();
  
  // Check for malicious patterns first
  if (isMaliciousOrigin(origin, securityLevel)) {
    return {
      allowed: false,
      origin,
      reason: 'Origin matches malicious pattern',
      violationType: 'MALICIOUS_PATTERN'
    };
  }
  
  // In development, allow localhost
  if (securityLevel === 'permissive' && DEV_PATTERNS.some(pattern => pattern.test(origin))) {
    return { allowed: true, origin };
  }
  
  // Check exact matches against allowed origins
  const allowedOrigins = getAllowedOrigins();
  if (allowedOrigins.includes(origin)) {
    return { allowed: true, origin };
  }
  
  // Check pattern matches (only in standard/permissive mode)
  if (securityLevel !== 'strict') {
    const allowedPatterns = getAllowedPatterns();
    for (const pattern of allowedPatterns) {
      if (matchesPattern(origin, pattern)) {
        return { allowed: true, origin };
      }
    }
  }
  
  // Origin not allowed
  return {
    allowed: false,
    origin,
    reason: `Origin not in allowed list (${allowedOrigins.length} allowed origins, security level: ${securityLevel})`,
    violationType: 'UNKNOWN_ORIGIN'
  };
}

/**
 * Get secure CORS origin based on environment
 * @param requestOrigin - The origin from the request header
 * @returns string - allowed origin for CORS or fallback
 */
export function getAllowedOrigin(requestOrigin?: string | null): string {
  // If no request origin, use legacy behavior
  if (!requestOrigin) {
    if (env.NODE_ENV === 'production') {
      const allowedOrigins = getAllowedOrigins();
      if (allowedOrigins.length > 0) {
        return allowedOrigins[0]; // Use first origin for single origin header
      }
      // Fallback to secure default (should be configured in production)
      return 'https://your-domain.com';
    }
    
    // In development, allow localhost
    return 'http://localhost:3000';
  }
  
  // Validate the request origin
  const validation = validateOrigin(requestOrigin);
  
  // Log CORS violations if monitoring is enabled
  if (!validation.allowed && (env as any).ENABLE_CORS_MONITORING === 'true') {
    logCORSViolation(validation);
  }
  
  // Return the origin if allowed, otherwise return a safe fallback
  if (validation.allowed) {
    return requestOrigin;
  }
  
  // For security, return a default origin instead of the invalid one
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins[0] || 'https://your-domain.com';
}

/**
 * Log CORS violations for monitoring
 */
function logCORSViolation(validation: CORSValidationResult): void {
  try {
    const logData = {
      timestamp: new Date().toISOString(),
      type: 'CORS_VIOLATION',
      origin: validation.origin,
      reason: validation.reason,
      violationType: validation.violationType,
      environment: env.NODE_ENV,
      securityLevel: getSecurityLevel(),
      userAgent: typeof window !== 'undefined' ? window.navigator?.userAgent : 'server-side',
    };
    
    // In development, log to console
    if (env.NODE_ENV === 'development') {
      console.warn('CORS Violation:', logData);
    } else {
      // In production, this could be sent to your logging service
      console.warn('CORS violation detected', { origin: validation.origin, type: validation.violationType });
    }
  } catch (error) {
    // Fail silently to avoid breaking the application
    try {
      console.warn('Failed to log CORS violation:', error);
    } catch {
      // If even console.warn fails, fail completely silently
    }
  }
}

/**
 * Get CORS headers for API responses with origin validation
 * @param requestOrigin - The origin from the request header
 * @returns object - CORS headers
 */
export function getCORSHeaders(requestOrigin?: string | null): Record<string, string> {
  const allowedOrigin = getAllowedOrigin(requestOrigin);
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin' // Important for caching with multiple origins
  };
}

/**
 * Create OPTIONS response with secure CORS headers
 * @param requestOrigin - The origin from the request header
 * @returns Response - OPTIONS response
 */
export function createCORSResponse(requestOrigin?: string | null): Response {
  // Validate origin first
  const validation = validateOrigin(requestOrigin || null);
  
  if (!validation.allowed) {
    // Return 403 Forbidden for invalid origins
    return new Response('CORS policy violation', {
      status: 403,
      statusText: 'Forbidden',
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
  
  return new Response(null, {
    status: 200,
    headers: getCORSHeaders(requestOrigin)
  });
}

/**
 * Utility function for testing CORS configuration
 * @returns object - Current CORS configuration summary
 */
export function getCORSConfigSummary(): {
  securityLevel: CORSSecurityLevel;
  allowedOrigins: string[];
  allowedPatterns: string[];
  environment: string;
  monitoringEnabled: boolean;
} {
  return {
    securityLevel: getSecurityLevel(),
    allowedOrigins: getAllowedOrigins(),
    allowedPatterns: getAllowedPatterns(),
    environment: env.NODE_ENV || 'unknown',
    monitoringEnabled: (env as any).ENABLE_CORS_MONITORING === 'true'
  };
}