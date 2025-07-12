import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PostHogProvider } from '@/components/PostHogProvider'
import { ErrorBoundary } from './error-boundary'
import { checkCriticalEnvVars } from '@/lib/env'

const inter = Inter({ subsets: ['latin'] })

// Validate critical environment variables on application startup (non-blocking)
if (typeof window === 'undefined') {
  // Only run on server-side to avoid client-side errors
  try {
    checkCriticalEnvVars()
    console.log('✅ Environment validation passed')
  } catch (error) {
    console.error('❌ Environment Configuration Error:', error instanceof Error ? error.message : error)
    console.error('Please check your .env.local file and ensure all required variables are set.')
    console.error('Refer to .env.example for the correct format.')
    // Don't throw - allow app to continue with graceful degradation
  }
}

export const metadata: Metadata = {
  title: 'ResumeBuilder AI',
  description: 'AI-powered resume builder that helps you create tailored resumes for specific job descriptions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <PostHogProvider>
            {children}
          </PostHogProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
