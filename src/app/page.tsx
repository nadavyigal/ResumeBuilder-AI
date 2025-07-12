'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRightIcon, DocumentTextIcon, SparklesIcon, CloudArrowUpIcon, ShieldCheckIcon, BoltIcon } from '@heroicons/react/24/outline'
import { usePostHog } from 'posthog-js/react'
import { supabase } from '@/lib/supabase'

const features = [
  {
    name: 'AI-Powered Generation',
    description: 'Create professional resumes with intelligent AI assistance that understands your industry and role.',
    icon: SparklesIcon,
  },
  {
    name: 'Smart Templates',
    description: 'Choose from professionally designed templates optimized for ATS systems and hiring managers.',
    icon: DocumentTextIcon,
  },
  {
    name: 'Quick Import',
    description: 'Upload your existing resume or LinkedIn profile to get started in seconds.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Privacy First',
    description: 'Your data is encrypted and secure. You control who sees your information.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Real-time Preview',
    description: 'See changes instantly as you build your resume with our live preview feature.',
    icon: BoltIcon,
  },
]

export default function Home() {
  const router = useRouter()
  const posthog = usePostHog()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          console.warn('Auth error (non-critical):', error.message)
        }
        setUser(user)
      } catch (error) {
        console.error('Error loading user:', error)
        // Don't crash - continue without user
      } finally {
        setLoading(false)
      }
    }

    // Add small delay to prevent immediate flash
    const timer = setTimeout(loadUser, 100)
    return () => clearTimeout(timer)
  }, [])

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (posthog) {
      posthog.capture(eventName, properties)
    }
  }

  const handleCreateResume = () => {
    if (!user) {
      router.push('/login?returnUrl=/resumes/new')
    } else {
      router.push('/resumes/new')
    }
    trackEvent('cta_clicked', { location: 'hero', action: 'create_resume' })
  }

  return (
    <div className="min-h-[calc(100vh-64px-80px)]">
      {/* Hero Section */}
      <section className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Build Professional Resumes
              <span className="block text-blue-600 mt-2">with AI Assistance</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              Create stunning, ATS-optimized resumes in minutes. Get noticed by hiring managers with AI-powered suggestions.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleCreateResume}
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
              >
                Create Your Resume
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </button>
              <Link
                href="/templates"
                onClick={() => trackEvent('cta_clicked', { location: 'hero', action: 'view_templates' })}
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                View Templates
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything you need to create the perfect resume
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform combines cutting-edge technology with proven resume best practices.
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  {feature.name}
                </h3>
                <p className="mt-2 text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to build your perfect resume?
          </h2>
          <p className="mt-4 text-xl text-blue-100">
            Join thousands of professionals who've landed their dream jobs.
          </p>
          <button
            onClick={handleCreateResume}
            className="mt-8 inline-flex items-center px-8 py-3 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-100 transition-colors"
          >
            Get Started Free
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  )
}
