import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

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
        return NextResponse.json(
          { 
            error: 'Authentication required',
            message: 'You must be logged in to access this resource'
          },
          { status: 401 }
        )
      }

      // Call the handler with authenticated user
      return await handler(request, user)
    } catch (error) {
      console.error('Authentication middleware error:', error)
      return NextResponse.json(
        { 
          error: 'Authentication error',
          message: 'Failed to verify authentication' 
        },
        { status: 500 }
      )
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