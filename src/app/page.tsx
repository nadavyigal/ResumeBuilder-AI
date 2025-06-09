'use client'

import Link from 'next/link'

export default function Home() {
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
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-[#2F80ED] hover:bg-blue-600 transition-colors shadow-sm"
              >
                Create Your Resume
              </Link>
              <Link
                href="/templates"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-[#1A1A1A] bg-white border border-[#E5E5E5] hover:bg-gray-50 transition-colors"
              >
                View Templates
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1A1A1A]">Why Choose ResumeBuilder AI?</h2>
            <p className="mt-4 text-lg text-gray-600">Everything you need to create a winning resume</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-[#2F80ED] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">AI-Powered</h3>
              <p className="text-gray-600">Smart suggestions to optimize your resume for ATS systems and recruiters.</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-[#27AE60] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">Quick & Easy</h3>
              <p className="text-gray-600">Create a professional resume in under 10 minutes with our guided process.</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-[#F2C94C] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">Professional Templates</h3>
              <p className="text-gray-600">Choose from modern, ATS-friendly templates designed by professionals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">Ready to Land Your Dream Job?</h2>
          <p className="text-lg text-gray-600 mb-8">Start building your professional resume today</p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-[#2F80ED] hover:bg-blue-600 transition-colors shadow-sm"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  )
} 