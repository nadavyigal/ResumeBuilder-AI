'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { supabase } from '@/lib/supabase'
import { getResume } from '@/lib/db'

type Resume = Database['public']['Tables']['resumes']['Row']

export default function ResumePage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)

  const resumeId = params.id as string

  useEffect(() => {
    async function loadUserAndResume() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/')
          return
        }

        setUser(user)
        
        if (resumeId) {
          const resumeData = await getResume(resumeId, user.id)
          if (!resumeData) {
            router.push('/resumes')
            return
          }
          setResume(resumeData)
        }
      } catch (error) {
        console.error('Error loading resume:', error)
        router.push('/resumes')
      } finally {
        setLoading(false)
      }
    }

    loadUserAndResume()
  }, [router, resumeId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Loading resume...</p>
        </div>
      </div>
    )
  }

  if (!user || !resume) {
    return null // Router will handle redirect
  }

  const content = resume.content as any

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <nav className="mb-4">
              <Link href="/resumes" className="text-sm text-blue-600 hover:text-blue-800">
                ← Back to Resumes
              </Link>
            </nav>
            <h1 className="text-3xl font-bold text-gray-900">{resume.title}</h1>
            <p className="mt-2 text-sm text-gray-600">
              Created {new Date(resume.created_at).toLocaleDateString()}
              {resume.is_public && (
                <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Public
                </span>
              )}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href={`/resumes/${resume.id}/edit`}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Edit Resume
            </Link>
          </div>
        </div>
      </div>

      {/* Resume Content */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* Personal Information */}
          {content?.personal && Object.keys(content.personal).length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {content.personal.fullName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-sm text-gray-900">{content.personal.fullName}</p>
                  </div>
                )}
                {content.personal.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{content.personal.email}</p>
                  </div>
                )}
                {content.personal.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900">{content.personal.phone}</p>
                  </div>
                )}
                {content.personal.location && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="text-sm text-gray-900">{content.personal.location}</p>
                  </div>
                )}
              </div>
              {content.personal.summary && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Professional Summary</label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{content.personal.summary}</p>
                </div>
              )}
            </div>
          )}

          {/* Experience */}
          {content?.experience && content.experience.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Experience</h2>
              <div className="space-y-6">
                {content.experience.map((exp: any, index: number) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-4">
                    <h3 className="text-lg font-medium text-gray-900">{exp.title}</h3>
                    <p className="text-sm text-gray-600">{exp.company} • {exp.duration}</p>
                    {exp.description && (
                      <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {content?.education && content.education.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Education</h2>
              <div className="space-y-4">
                {content.education.map((edu: any, index: number) => (
                  <div key={index} className="border-l-4 border-green-200 pl-4">
                    <h3 className="text-lg font-medium text-gray-900">{edu.degree}</h3>
                    <p className="text-sm text-gray-600">{edu.school} • {edu.year}</p>
                    {edu.details && (
                      <p className="mt-2 text-sm text-gray-700">{edu.details}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {content?.skills && content.skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {content.skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-sm font-medium text-gray-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {(!content || 
            (!content.personal || Object.keys(content.personal).length === 0) &&
            (!content.experience || content.experience.length === 0) &&
            (!content.education || content.education.length === 0) &&
            (!content.skills || content.skills.length === 0)
          ) && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-12 w-12">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Resume is empty</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by editing this resume to add your information.
              </p>
              <div className="mt-6">
                <Link
                  href={`/resumes/${resume.id}/edit`}
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Edit Resume
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
