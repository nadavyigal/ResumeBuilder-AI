'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { supabase } from '@/lib/supabase'
import { getResumes, deleteResume } from '@/lib/db'

type Resume = Database['public']['Tables']['resumes']['Row']

export default function ResumesPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    async function loadUserAndResumes() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/')
          return
        }

        setUser(user)
        const userResumes = await getResumes(user.id)
        setResumes(userResumes)
      } catch (error) {
        console.error('Error loading resumes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserAndResumes()
  }, [router])

  const handleDeleteResume = async (resumeId: string) => {
    if (!user || !confirm('Are you sure you want to delete this resume?')) return

    setDeleting(resumeId)
    try {
      await deleteResume(resumeId, user.id)
      setResumes(resumes.filter(resume => resume.id !== resumeId))
    } catch (error) {
      console.error('Error deleting resume:', error)
      alert('Failed to delete resume. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2F80ED] border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading resumes...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Router will handle redirect
  }

  return (
    <div className="min-h-[calc(100vh-64px-80px)] bg-[#FAFAFA] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A]">My Resumes</h1>
              <p className="mt-2 text-base text-gray-600">
                Create and manage your professional resumes
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                href="/resumes/new"
                className="inline-flex items-center justify-center rounded-md bg-[#2F80ED] px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Resume
              </Link>
            </div>
          </div>
        </div>

        {/* Resume Grid */}
        {resumes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="mx-auto h-16 w-16 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-16 w-16">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-[#1A1A1A]">No resumes yet</h3>
            <p className="mt-2 text-base text-gray-600">
              Get started by creating your first resume
            </p>
            <div className="mt-6">
              <Link
                href="/resumes/new"
                className="inline-flex items-center justify-center rounded-md bg-[#2F80ED] px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Resume
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="group relative rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-[#1A1A1A] truncate">
                      {resume.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Created {new Date(resume.created_at).toLocaleDateString()}
                    </p>
                    {resume.is_public && (
                      <span className="inline-flex items-center rounded-full bg-[#27AE60] bg-opacity-10 px-2.5 py-0.5 text-xs font-medium text-[#27AE60] mt-2">
                        Public
                      </span>
                    )}
                  </div>
                  
                  {/* Actions Menu */}
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/resumes/${resume.id}/edit`}
                      className="p-2 text-gray-400 hover:text-[#2F80ED] transition-colors"
                      title="Edit resume"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDeleteResume(resume.id)}
                      disabled={deleting === resume.id}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Delete resume"
                    >
                      {deleting === resume.id ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-red-600"></div>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link
                    href={`/resumes/${resume.id}`}
                    className="inline-flex items-center text-sm font-medium text-[#2F80ED] hover:text-blue-600 transition-colors"
                  >
                    View Resume
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
