import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { env } from '@/lib/env'

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/auth/callback',
  '/auth/error',
  '/privacy',
  '/terms',
  '/support',
]

export async function middleware(req: NextRequest) {
  try {
    // Create a response object
    let response = NextResponse.next({
      request: {
        headers: req.headers,
      },
    })

    // Create Supabase client for middleware
    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              req.cookies.set(name, value)
            })
            response = NextResponse.next({
              request: req,
            })
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const path = req.nextUrl.pathname

    // Allow public routes
    if (PUBLIC_ROUTES.includes(path)) {
      return response
    }

    // Get authenticated user (secure method)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error('User authentication error:', userError)
      return redirectToLogin(req)
    }

    // Check for valid user on protected routes
    if (!user) {
      return redirectToLogin(req)
    }

    // Add user context to headers for downstream use
    response.headers.set('x-user-id', user.id)
    response.headers.set('x-user-email', user.email || '')

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return redirectToLogin(req)
  }
}

function redirectToLogin(req: NextRequest) {
  const redirectUrl = req.nextUrl.clone()
  redirectUrl.pathname = '/login'
  redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
  return NextResponse.redirect(redirectUrl)
}

// Specify which routes should be processed by the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public assets)
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
  ],
} 