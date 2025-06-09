'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { supabase } from '@/lib/supabase'
import { getResumes } from '@/lib/db'
import { 
  HomeIcon, 
  DocumentTextIcon, 
  UserIcon, 
  Cog6ToothIcon,
  PlusIcon,
  SparklesIcon,
  CloudArrowUpIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline'
import ResumeUpload from '@/components/ResumeUpload'

type Resume = Database['public']['Tables']['resumes']['Row']

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: true },
  { name: 'My Resumes', href: '/resumes', icon: DocumentTextIcon, current: false },
  { name: 'Profile', href: '/profile', icon: UserIcon, current: false },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, current: false },
]

const comingSoonFeatures = [
  {
    name: 'Resume Parser',
    description: 'Upload existing resumes and extract information automatically',
    icon: CloudArrowUpIcon,
    status: 'Coming Soon'
  },
  {
    name: 'AI Content Generator',
    description: 'Generate compelling resume content with AI assistance',
    icon: SparklesIcon,
    status: 'Coming Soon'
  },
  {
    name: 'Template Library',
    description: 'Choose from professional resume templates',
    icon: DocumentDuplicateIcon,
    status: 'Coming Soon'
  }
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState<any>(null)

  useEffect(() => {
    async function loadUserData() {
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
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleUploadSuccess = (data: any) => {
    setUploadSuccess(data)
    setShowUpload(false)
    // Redirect to the uploaded resume
    router.push(`/resumes/${data.resumeId}`)
  }

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error)
    // Error handling is done in the component itself
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2F80ED] border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading dashboard...</p>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A]">
            Welcome back{user.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Here's your resume builder dashboard
          </p>
        </div>

        {/* Upload Resume Section */}
        <div className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">Upload Resume</h2>
            <ResumeUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Link
            href="/resumes/new"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#2F80ED] bg-opacity-10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#2F80ED]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-[#1A1A1A]">Create Resume</h3>
                <p className="text-sm text-gray-600">Start a new resume</p>
              </div>
            </div>
          </Link>

          <Link
            href="/resumes"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#27AE60] bg-opacity-10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#27AE60]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-[#1A1A1A]">My Resumes</h3>
                <p className="text-sm text-gray-600">{resumes.length} resume{resumes.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </Link>

          <Link
            href="/templates"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#F2C94C] bg-opacity-10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#F2C94C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-[#1A1A1A]">Templates</h3>
                <p className="text-sm text-gray-600">Browse designs</p>
              </div>
            </div>
          </Link>

          <Link
            href="/profile"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-[#1A1A1A]">Profile</h3>
                <p className="text-sm text-gray-600">Account settings</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Resumes */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#1A1A1A]">Recent Resumes</h2>
            {resumes.length > 0 && (
              <Link href="/resumes" className="text-sm text-[#2F80ED] hover:text-blue-600">
                View all →
              </Link>
            )}
          </div>

          {resumes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No resumes yet. Create your first one!</p>
              <Link
                href="/resumes/new"
                className="mt-4 inline-flex items-center justify-center rounded-md bg-[#2F80ED] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 transition-colors"
              >
                Create Resume
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {resumes.slice(0, 3).map((resume) => (
                <div key={resume.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <h3 className="text-base font-medium text-[#1A1A1A]">{resume.title}</h3>
                    <p className="text-sm text-gray-600">
                      Updated {new Date(resume.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    href={`/resumes/${resume.id}/edit`}
                    className="text-sm text-[#2F80ED] hover:text-blue-600"
                  >
                    Edit →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 