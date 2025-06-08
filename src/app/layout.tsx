import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { PostHogProvider } from '@/components/PostHogProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'ResumeBuilder AI - Build Professional Resumes with AI',
    template: '%s | ResumeBuilder AI'
  },
  description: 'Create stunning, ATS-optimized resumes in minutes with AI assistance. Build professional resumes that get you noticed by hiring managers.',
  keywords: ['resume builder', 'AI resume', 'professional resume', 'ATS optimized', 'job application', 'career'],
  authors: [{ name: 'ResumeBuilder AI Team' }],
  creator: 'ResumeBuilder AI',
  publisher: 'ResumeBuilder AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://resumebuilder-ai.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://resumebuilder-ai.vercel.app',
    title: 'ResumeBuilder AI - Build Professional Resumes with AI',
    description: 'Create stunning, ATS-optimized resumes in minutes with AI assistance. Build professional resumes that get you noticed by hiring managers.',
    siteName: 'ResumeBuilder AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ResumeBuilder AI - Professional Resume Builder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResumeBuilder AI - Build Professional Resumes with AI',
    description: 'Create stunning, ATS-optimized resumes in minutes with AI assistance.',
    images: ['/og-image.png'],
    creator: '@resumebuilderai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={inter.className}>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}