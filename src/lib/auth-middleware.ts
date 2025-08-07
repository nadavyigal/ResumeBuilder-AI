import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createErrorResponse, createServerErrorResponse } from './error-responses'
import { logger } from './logger'

export interface AuthenticatedHandler {
  (request: NextRequest, user: any): Promise<NextResponse>
}

/**
 * Middleware wrapper for API routes that require authentication
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const supabase = await createClient()
      
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return createErrorResponse(
          'AUTH_REQUIRED',
          401,
          authError,
          { path: request.nextUrl.pathname }
        )
      }

      // Call the handler with authenticated user
      return await handler(request, user)
    } catch (error) {
      return createServerErrorResponse(error, {
        path: request.nextUrl.pathname
      })
    }
  }
}

/**
 * Get user from request headers (set by middleware)
 */
export function getUserFromHeaders(request: NextRequest) {
  return {
    id: request.headers.get('x-user-id'),
    email: request.headers.get('x-user-email')
  }
}