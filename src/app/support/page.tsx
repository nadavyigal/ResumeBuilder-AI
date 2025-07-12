'use client'

import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { 
  ChatBubbleLeftRightIcon, 
  DocumentTextIcon, 
  EnvelopeIcon,
  QuestionMarkCircleIcon 
} from '@heroicons/react/24/outline'

const supportOptions = [
  {
    title: 'Documentation',
    description: 'Browse our comprehensive guides and tutorials',
    icon: DocumentTextIcon,
    action: 'View Docs',
    href: '#'
  },
  {
    title: 'FAQs',
    description: 'Find answers to commonly asked questions',
    icon: QuestionMarkCircleIcon,
    action: 'Browse FAQs',
    href: '#'
  },
  {
    title: 'Live Chat',
    description: 'Chat with our support team in real-time',
    icon: ChatBubbleLeftRightIcon,
    action: 'Start Chat',
    href: '#'
  },
  {
    title: 'Email Support',
    description: 'Send us an email and we\'ll get back to you',
    icon: EnvelopeIcon,
    action: 'Send Email',
    href: 'mailto:support@resumebuilder.ai'
  }
]

export default function SupportPage() {
  return (
    <DashboardLayout 
      title="Support Center" 
      description="How can we help you today?"
    >
      {/* Support Options Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 mb-12">
        {supportOptions.map((option) => (
          <div key={option.title} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <option.icon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{option.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{option.description}</p>
                <Link
                  href={option.href}
                  className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  {option.action} →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Information */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Need More Help?</h2>
        <p className="text-gray-600 mb-4">
          Our support team is available Monday through Friday, 9am to 5pm EST.
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            <strong>Email:</strong> support@resumebuilder.ai
          </p>
          <p className="text-sm text-gray-600">
            <strong>Response Time:</strong> Within 24 hours
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/resumes/new"
            className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
          >
            <span className="text-sm font-medium text-gray-900">Create Resume</span>
          </Link>
          <Link
            href="/templates"
            className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
          >
            <span className="text-sm font-medium text-gray-900">View Templates</span>
          </Link>
          <Link
            href="/optimize"
            className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
          >
            <span className="text-sm font-medium text-gray-900">AI Optimizer</span>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
} 