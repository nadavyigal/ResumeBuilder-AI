import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Check if environment variables are set
    const envCheck = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
    }

    // Test basic connection (using secure getUser method)
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    // Check auth settings
    const authSettings = {
      hasUser: !!userData?.user,
      userError: userError?.message || null,
    }

    // Try to get auth providers
    let providers = []
    try {
      // This will help us understand what's configured
      const { data, error } = await supabase.auth.getUser()
      if (!error) {
        providers.push('User authentication check passed')
      }
    } catch (e) {
      providers.push(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }

    return NextResponse.json({
      status: 'ok',
      environment: envCheck,
      auth: authSettings,
      providers,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
} 