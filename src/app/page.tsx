'use client'

import Link from 'next/link'
import { ArrowRightIcon, DocumentTextIcon, SparklesIcon, CloudArrowUpIcon, ShieldCheckIcon, BoltIcon } from '@heroicons/react/24/outline'
import { usePostHog } from 'posthog-js/react'

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
  const posthog = usePostHog()

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (posthog) {
      posthog.capture(eventName, properties)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px-80px)]">
      {/* Hero Section */}
      <section className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1A1A1A] leading-tight">
              Build Professional Resumes
              <span className="block text-[#2F80ED] mt-2">with AI Assistance</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              Create stunning, ATS-optimized resumes in minutes. Get noticed by hiring managers with AI-powered suggestions.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/resumes/new"
                onClick={() => trackEvent('cta_clicked', { location: 'hero', action: 'create_resume' })}
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-[#2F80ED] hover:bg-blue-600 transition-colors shadow-sm"
              >
                Create Your Resume
              </Link>
              <Link
                href="/templates"
                onClick={() => trackEvent('cta_clicked', { location: 'hero', action: 'view_templates' })}
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-[#1A1A1A] bg-white border border-[#E5E5E5] hover:bg-gray-50 transition-colors"
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
            <h2 className="text-3xl font-bold text-[#1A1A1A]">
              Everything you need to create the perfect resume
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform combines cutting-edge technology with proven resume best practices.
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-[#2F80ED] rounded-lg flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-[#1A1A1A]">
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
    </div>
  )
}
