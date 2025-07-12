'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { createClient } from '@/lib/supabase-browser'
import { getResumes, deleteResume } from '@/lib/db'
import DashboardLayout from '@/components/DashboardLayout'
import { PlusIcon, PencilIcon, TrashIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

type Resume = Database['public']['Tables']['resumes']['Row']

export default function ResumesPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadUserAndResumes() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
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
  }, [router, supabase])

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
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-2 text-sm text-gray-600">Loading resumes...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return null // Router will handle redirect
  }

  return (
    <DashboardLayout 
      title="My Resumes" 
      description="Create and manage your professional resumes"
    >
      {/* Action Button */}
      <div className="mb-8 flex justify-end">
        <Link
          href="/resumes/new"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create New Resume
        </Link>
      </div>

      {/* Resume Grid */}
      {resumes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="mx-auto h-16 w-16 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-16 w-16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No resumes yet</h3>
          <p className="mt-2 text-base text-gray-600">
            Get started by creating your first resume
          </p>
          <div className="mt-6">
            <Link
              href="/resumes/new"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
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
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {resume.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Created {new Date(resume.created_at).toLocaleDateString()}
                  </p>
                  {resume.is_public && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 mt-2">
                      Public
                    </span>
                  )}
                </div>
                
                {/* Actions Menu */}
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/resumes/${resume.id}/edit`}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit resume"
                  >
                    <PencilIcon className="h-5 w-5" />
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
                      <TrashIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="mt-6">
                <Link
                  href={`/resumes/${resume.id}`}
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View Resume
                  <ChevronRightIcon className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
