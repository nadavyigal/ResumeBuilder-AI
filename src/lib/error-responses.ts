import { NextResponse } from 'next/server';
import { logger } from './logger';

/**
 * Standard error response types
 */
export interface ErrorResponse {
  error: string;
  message: string;
  code?: string;
  details?: any;
  timestamp?: string;
}

/**
 * Standard error responses that don't expose internal details
 */
export const StandardErrors = {
  AUTH_REQUIRED: {
    error: 'Authentication required',
    message: 'Please log in to access this resource'
  },
  FORBIDDEN: {
    error: 'Access denied',
    message: 'You do not have permission to access this resource'
  },
  NOT_FOUND: {
    error: 'Resource not found',
    message: 'The requested resource could not be found'
  },
  VALIDATION_FAILED: {
    error: 'Invalid request',
    message: 'Please check your input and try again'
  },
  RATE_LIMIT_EXCEEDED: {
    error: 'Rate limit exceeded',
    message: 'Too many requests. Please try again later'
  },
  FILE_TOO_LARGE: {
    error: 'File too large',
    message: 'File size exceeds the maximum allowed limit'
  },
  INVALID_FILE_TYPE: {
    error: 'Invalid file type',
    message: 'Please upload a supported file format'
  },
  PROCESSING_FAILED: {
    error: 'Processing failed',
    message: 'Unable to process your request. Please try again'
  },
  SERVER_ERROR: {
    error: 'Server error',
    message: 'An unexpected error occurred. Please try again later'
  },
  SERVICE_UNAVAILABLE: {
    error: 'Service unavailable',
    message: 'The service is temporarily unavailable. Please try again later'
  }
} as const;

/**
 * Create a secure error response that doesn't expose internal details
 * @param errorType - Standard error type
 * @param statusCode - HTTP status code
 * @param internalError - Internal error for logging (not exposed to client)
 * @param context - Additional context for logging
 * @returns NextResponse with secure error
 */
export function createErrorResponse(
  errorType: keyof typeof StandardErrors,
  statusCode: number,
  internalError?: Error | any,
  context?: { userId?: string; path?: string; requestId?: string }
): NextResponse<ErrorResponse> {
  const errorResponse: ErrorResponse = {
    ...StandardErrors[errorType],
    timestamp: new Date().toISOString()
  };

  // Log internal error details for debugging (secure logging)
  if (internalError) {
    logger.error(
      `API Error: ${errorType}`,
      internalError,
      context
    );
  }

  return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Create validation error response with sanitized details
 * @param validationErrors - Validation errors (sanitized)
 * @param internalError - Internal error for logging
 * @param context - Additional context
 * @returns NextResponse with validation errors
 */
export function createValidationErrorResponse(
  validationErrors: any[],
  internalError?: Error | any,
  context?: { userId?: string; path?: string; requestId?: string }
): NextResponse<ErrorResponse> {
  const errorResponse: ErrorResponse = {
    ...StandardErrors.VALIDATION_FAILED,
    details: validationErrors.map(err => ({
      field: err.path?.join('.'),
      message: err.message,
      code: err.code
    })),
    timestamp: new Date().toISOString()
  };

  if (internalError) {
    logger.error('Validation failed', internalError, context);
  }

  return NextResponse.json(errorResponse, { status: 400 });
}

/**
 * Create rate limit error response
 * @param retryAfter - Seconds until next request allowed
 * @param context - Additional context
 * @returns NextResponse with rate limit error
 */
export function createRateLimitErrorResponse(
  retryAfter: number,
  context?: { userId?: string; path?: string; requestId?: string }
): NextResponse<ErrorResponse> {
  const errorResponse: ErrorResponse = {
    ...StandardErrors.RATE_LIMIT_EXCEEDED,
    timestamp: new Date().toISOString()
  };

  logger.warn('Rate limit exceeded', { retryAfter }, context);

  return NextResponse.json(errorResponse, { 
    status: 429,
    headers: {
      'Retry-After': retryAfter.toString()
    }
  });
}

/**
 * Create server error response (for unexpected errors)
 * @param internalError - Internal error (logged but not exposed)
 * @param context - Additional context
 * @returns NextResponse with generic server error
 */
export function createServerErrorResponse(
  internalError?: Error | any,
  context?: { userId?: string; path?: string; requestId?: string }
): NextResponse<ErrorResponse> {
  const errorResponse: ErrorResponse = {
    ...StandardErrors.SERVER_ERROR,
    timestamp: new Date().toISOString()
  };

  // Always log server errors for investigation
  logger.error('Unexpected server error', internalError, context);

  return NextResponse.json(errorResponse, { status: 500 });
}

/**
 * Wrapper for handling API route errors consistently
 * @param handler - API route handler function
 * @returns Wrapped handler with consistent error handling
 */
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return createServerErrorResponse(error, {
        path: 'unknown' // Context should be provided by caller
      });
    }
  };
}