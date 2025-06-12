'use client'

import Link from 'next/link'
import { DocumentTextIcon, SparklesIcon, BriefcaseIcon } from '@heroicons/react/24/outline'

const templates = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean and modern design perfect for corporate positions',
    icon: BriefcaseIcon,
    preview: '/templates/professional.png',
    status: 'Coming Soon'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Stand out with a unique design for creative roles',
    icon: SparklesIcon,
    preview: '/templates/creative.png',
    status: 'Coming Soon'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and elegant design that focuses on content',
    icon: DocumentTextIcon,
    preview: '/templates/minimal.png',
    status: 'Coming Soon'
  }
]

export default function TemplatesPage() {
  return (
    <div className="min-h-[calc(100vh-64px-80px)] bg-[#FAFAFA] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Resume Templates</h1>
          <p className="mt-2 text-base text-gray-600">
            Choose from our professionally designed templates
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-w-4 aspect-h-5 bg-gray-100 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <template.icon className="h-24 w-24 text-gray-300" />
                </div>
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {template.status}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[#1A1A1A]">{template.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{template.description}</p>
                <button
                  disabled
                  className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-400 bg-gray-50 cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Can't wait? Start building your resume now with our editor
          </p>
          <Link
            href="/resumes/new"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#2F80ED] hover:bg-blue-600 transition-colors"
          >
            Create Resume Now
          </Link>
        </div>
      </div>
    </div>
  )
} 