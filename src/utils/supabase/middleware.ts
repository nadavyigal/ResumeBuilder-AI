import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  try {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    // Log authentication errors for debugging
    if (userError) {
      console.error('Session validation error in middleware:', userError.message, 'Path:', request.nextUrl.pathname)
    }

    // Get session for refresh logic
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Session retrieval error in middleware:', sessionError.message, 'Path:', request.nextUrl.pathname)
    }

    // Handle session refresh if needed
    if (session && user) {
      const expiresAt = session.expires_at || 0
      const now = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = expiresAt - now

      // Refresh session if it expires within 5 minutes
      if (timeUntilExpiry > 0 && timeUntilExpiry < 300) {
        console.log('Refreshing session in middleware for user:', user.id, 'Time until expiry:', timeUntilExpiry)

        try {
          const { error: refreshError } = await supabase.auth.refreshSession()
          if (refreshError) {
            console.error('Session refresh failed in middleware:', refreshError.message, 'User ID:', user.id)
          } else {
            console.log('Session refreshed successfully for user:', user.id)
          }
        } catch (refreshError) {
          console.error('Session refresh exception in middleware:', refreshError, 'User ID:', user.id)
        }
      }
    }

    // Handle auth redirect for protected routes
    const isPublicRoute = [
      '/',
      '/login',
      '/signup',
      '/auth/callback',
      '/auth/error',
      '/privacy', 
      '/terms',
      '/support'
    ].includes(request.nextUrl.pathname)

    const isPublicAPIRoute = request.nextUrl.pathname.startsWith('/api/auth/')

    if (!user && !isPublicRoute && !isPublicAPIRoute) {
      console.log('Redirecting unauthenticated user to login. Path:', request.nextUrl.pathname)

      // Redirect to login with return URL
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('returnUrl', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    return supabaseResponse

  } catch (error) {
    console.error('Unexpected error in session middleware:', error, 'Path:', request.nextUrl.pathname)

    // For public routes, continue without authentication
    const isPublicRoute = [
      '/',
      '/login',
      '/signup',
      '/auth/callback',
      '/auth/error',
      '/privacy',
      '/terms',
      '/support'
    ].includes(request.nextUrl.pathname)

    const isPublicAPIRoute = request.nextUrl.pathname.startsWith('/api/auth/')

    if (isPublicRoute || isPublicAPIRoute) {
      return NextResponse.next()
    }

    // For protected routes, redirect to login on error
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('error', 'session_error')
    return NextResponse.redirect(url)
  }
} 