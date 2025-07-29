'use client'

import { useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import TemplateCard from '@/components/TemplateCard'
import TemplatePreviewModal from '@/components/TemplatePreviewModal'
import { templates } from '@/lib/templates'
import { ResumeTemplate } from '@/types/template'

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<ResumeTemplate | null>(null)

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
  }

  const handleTemplatePreview = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setPreviewTemplate(template)
    }
  }

  const handleClosePreview = () => {
    setPreviewTemplate(null)
  }

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      // Navigate to resume editor with selected template
      window.location.href = `/resumes/new?template=${selectedTemplate}`
    }
  }

  return (
    <DashboardLayout 
      title="Resume Templates" 
      description="Choose from our professionally designed templates"
    >
      {/* Filter/Sort Bar */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            {templates.filter(t => t.isAtsOptimized).length} ATS Optimized
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {templates.length} Templates Available
          </span>
        </div>
        
        {selectedTemplate && (
          <button
            onClick={handleUseTemplate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Use Selected Template
          </button>
        )}
      </div>

      {/* Templates Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            selected={selectedTemplate === template.id}
            onSelect={handleTemplateSelect}
            onPreview={handleTemplatePreview}
          />
        ))}
      </div>

      {/* Getting Started Section */}
      <div className="mt-12 bg-gray-50 rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            {selectedTemplate ? 
              'You\'ve selected a template! Click "Use Selected Template" above to start building your resume.' :
              'Select a template above to get started, or create a resume from scratch with our flexible editor.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!selectedTemplate && (
              <Link
                href="/resumes/new"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Start from Scratch
              </Link>
            )}
            <Link
              href="/upload"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Upload Existing Resume
            </Link>
          </div>
        </div>
      </div>

      {/* Template Features */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">ATS Optimized</h3>
          <p className="text-gray-600">Our templates are designed to pass through Applicant Tracking Systems (ATS) with ease.</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 mx-auto bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Fully Customizable</h3>
          <p className="text-gray-600">Adjust colors, fonts, and layouts to match your personal style and industry standards.</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 mx-auto bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Powered</h3>
          <p className="text-gray-600">Get intelligent suggestions and optimizations based on job descriptions and industry trends.</p>
        </div>
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          isOpen={true}
          onClose={handleClosePreview}
          onSelect={() => {
            handleTemplateSelect(previewTemplate.id)
            handleClosePreview()
          }}
        />
      )}
    </DashboardLayout>
  )
} 