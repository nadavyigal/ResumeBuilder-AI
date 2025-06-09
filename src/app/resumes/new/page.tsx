'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { createResume } from '@/lib/db'

export default function NewResumePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    is_public: false
  })

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/')
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
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.title.trim()) return

    setCreating(true)
    try {
      const resume = await createResume({
        user_id: user.id,
        title: formData.title.trim(),
        content: {
          personal: {},
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Router will handle redirect
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create New Resume</h1>
            <p className="mt-1 text-sm text-gray-600">
              Start building your professional resume
            </p>
          </div>

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
    </div>
  )
}
