import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import dynamic from 'next/dynamic'
import './globals.css'
import { PostHogProvider } from '@/components/PostHogProvider'
import { ErrorBoundary } from './error-boundary'
import { env } from '@/lib/env'

// Lazy load performance monitor only in development
const PerformanceMonitor = dynamic(() => import('@/components/PerformanceMonitor'), {
  ssr: false,
  loading: () => null
})

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Optimize font loading
  preload: true
})

// Validate critical environment variables on application startup (non-blocking)

export const metadata: Metadata = {
  title: 'ResumeBuilder AI - AI-Powered Resume Creation',
  description: 'AI-powered resume builder that helps you create tailored resumes for specific job descriptions',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1A1A1A',
  robots: 'index, follow',
  authors: [{ name: 'ResumeBuilder AI' }],
  keywords: 'resume builder, AI resume, job application, career tools',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://resumebuilder-ai.com',
    title: 'ResumeBuilder AI - AI-Powered Resume Creation',
    description: 'AI-powered resume builder that helps you create tailored resumes for specific job descriptions',
    siteName: 'ResumeBuilder AI'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResumeBuilder AI - AI-Powered Resume Creation',
    description: 'AI-powered resume builder that helps you create tailored resumes for specific job descriptions'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://api.openai.com" />
        <link rel="dns-prefetch" href="https://supabase.co" />
        
        {/* Resource hints */}
        <link rel="preload" href="/api/generate" as="fetch" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} performance-container`}>
        <ErrorBoundary>
          <PostHogProvider>
            {children}
          </PostHogProvider>
        </ErrorBoundary>
        
        {/* Performance monitor - only in development */}
        {env.NODE_ENV === 'development' && <PerformanceMonitor />}
      </body>
    </html>
  )
}
