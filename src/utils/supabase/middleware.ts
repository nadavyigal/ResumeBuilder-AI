import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/lib/env'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

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
    // Redirect to login with return URL
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('returnUrl', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
} 