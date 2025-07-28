'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import { createResume } from '@/lib/db'
import DashboardLayout from '@/components/DashboardLayout'
import { DocumentTextIcon, CloudArrowUpIcon, SparklesIcon, DocumentPlusIcon } from '@heroicons/react/24/outline'
import ResumeUpload from '@/components/ResumeUpload'

export default function NewResumePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [activeTab, setActiveTab] = useState<'blank' | 'upload' | 'template'>('blank')
  const [formData, setFormData] = useState({
    title: '',
    is_public: false
  })
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        setUser(user)
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.title.trim()) return

    setCreating(true)
    try {
      const resume = await createResume({
        user_id: user.id,
        title: formData.title.trim(),
        content: {
          personal: {
            name: '',
            email: '',
            phone: '',
            location: '',
            summary: ''
          },
          experience: [],
          education: [],
          skills: []
        },
        is_public: formData.is_public
      })

      router.push(`/resumes/${resume.id}/edit`)
    } catch (error) {
      console.error('Error creating resume:', error)
      alert('Failed to create resume. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleUploadComplete = (data: any) => {
    // Handle the nested data structure from API response
    const resumeId = data.data?.resumeId || data.resumeId
    if (resumeId) {
      router.push(`/resumes/${resumeId}/edit`)
    } else {
      console.error('No resumeId found in upload response:', data)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return null // Router will handle redirect
  }

  const tabs = [
    { id: 'blank', name: 'Start from Scratch', icon: DocumentPlusIcon },
    { id: 'upload', name: 'Upload Resume', icon: CloudArrowUpIcon },
    { id: 'template', name: 'Use Template', icon: DocumentTextIcon },
  ]

  return (
    <DashboardLayout 
      title="Create New Resume" 
      description="Choose how you'd like to create your resume"
    >
      <div className="mx-auto max-w-4xl">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className={`
                  -ml-0.5 mr-2 h-5 w-5
                  ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}
                `} />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'blank' && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Resume Title
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        value={formData.title}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="e.g., Software Engineer Resume"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Give your resume a descriptive name to help you organize multiple resumes.
                    </p>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="is_public"
                      name="is_public"
                      type="checkbox"
                      checked={formData.is_public}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
                      Make this resume public
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Public resumes can be viewed by others with the link. Keep it private if you prefer.
                  </p>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => router.push('/resumes')}
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating || !formData.title.trim()}
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creating ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        'Create Resume'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Your Existing Resume</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Upload your current resume in DOCX or PDF format, and we'll extract the information to create a new editable version.
                </p>
                <ResumeUpload onUploadSuccess={handleUploadComplete} />
              </div>
            </div>
          )}

          {activeTab === 'template' && (
            <div>
              <p className="text-gray-600 text-center py-12">
                Template gallery coming soon! For now, please start from scratch or upload an existing resume.
              </p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setActiveTab('blank')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Start from Scratch
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
