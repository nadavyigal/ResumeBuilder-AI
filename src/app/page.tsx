'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRightIcon, DocumentTextIcon, SparklesIcon, CloudArrowUpIcon, ShieldCheckIcon, BoltIcon } from '@heroicons/react/24/outline'

import { supabase } from '@/lib/supabase'
import ChatOverlay from '@/components/ChatOverlay'
import AIDemo from '@/components/AIDemo'

const features = [
  {
    name: 'AI Career Intelligence',
    description: 'Analyzes 1000+ successful resumes in your industry to optimize your content for maximum impact.',
    icon: SparklesIcon,
    stat: '87% more interviews',
  },
  {
    name: 'ATS-Beating Templates',
    description: 'Recruiter-approved templates that guarantee passage through Applicant Tracking Systems.',
    icon: DocumentTextIcon,
    stat: '99% ATS compatibility',
  },
  {
    name: 'Instant Resume Analysis',
    description: 'Upload your existing resume and get immediate improvement suggestions with AI-powered insights.',
    icon: CloudArrowUpIcon,
    stat: '5-minute optimization',
  },
  {
    name: 'Enterprise-Grade Security',
    description: 'Bank-level encryption protects your data. Trusted by Fortune 500 professionals.',
    icon: ShieldCheckIcon,
    stat: 'SOC 2 certified',
  },
  {
    name: 'Real-time Optimization',
    description: 'Watch your resume score improve in real-time as you make AI-suggested changes.',
    icon: BoltIcon,
    stat: 'Live feedback',
  },
]

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [, setLoading] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)

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
    // PostHog removed - analytics tracking disabled
    console.log('Analytics event:', eventName, properties)
  }

  const handleCreateResume = () => {
    if (!user) {
      router.push('/login?returnUrl=/resumes/new')
    } else {
      router.push('/resumes/new')
    }
    trackEvent('cta_clicked', { location: 'hero', action: 'create_resume' })
  }

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen)
    trackEvent('chat_toggled', { isOpen: !isChatOpen })
  }

  return (
    <div className="min-h-[calc(100vh-64px-80px)]">
      {/* Hero Section */}
      <section className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Land Your Dream Job
              <span className="block text-blue-600 mt-2">3x Faster with AI</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              The only AI career strategist that analyzes 1000+ successful resumes in your industry. Get more interviews, faster results.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleCreateResume}
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
              >
                Create Your Resume Free
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
            
            {/* Trust Indicators */}
            <div className="mt-12 text-center">
              <p className="text-sm text-gray-500 mb-4">Trusted by professionals at leading companies</p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                <div className="text-gray-400 font-semibold">Google</div>
                <div className="text-gray-400 font-semibold">Microsoft</div>
                <div className="text-gray-400 font-semibold">Amazon</div>
                <div className="text-gray-400 font-semibold">Meta</div>
                <div className="text-gray-400 font-semibold">Apple</div>
              </div>
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
                <div className="mt-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {feature.name}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {feature.stat}
                  </span>
                </div>
                <p className="mt-2 text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Demo Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              See Your Resume's Potential in Real-Time
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the power of our AI resume analyzer. Get instant insights and see exactly how we'll improve your resume.
            </p>
          </div>
          <AIDemo />
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

      {/* AI Chat Assistant */}
      <ChatOverlay
        isOpen={isChatOpen}
        onToggle={handleChatToggle}
        currentStep="onboarding"
        className="z-50"
      />
    </div>
  )
}
