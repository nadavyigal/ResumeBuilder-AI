import { updateSession } from '@/utils/supabase/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/auth/callback',
  '/auth/error',
  '/privacy',
  '/terms',
  '/support',
  '/templates',
]

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Allow public routes and static assets
  if (PUBLIC_ROUTES.includes(path) || 
      path.startsWith('/_next/') || 
      path.startsWith('/api/auth/') ||
      path.includes('.')) {
    return NextResponse.next()
  }

  // For all other routes, update session and check authentication
  return await updateSession(req)
}

// Specify which routes should be processed by the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for static files and public assets
     * Now includes API routes for authentication
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 