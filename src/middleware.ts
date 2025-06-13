import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of paths that require authentication
const PROTECTED_PATHS = [
  '/resumes',
  '/dashboard',
  '/profile',
  '/settings',
]

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Check if the path requires authentication
  const isProtectedPath = PROTECTED_PATHS.some(path => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !session) {
    // Redirect to login page with a return URL
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('returnUrl', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/resumes/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
  ],
} 