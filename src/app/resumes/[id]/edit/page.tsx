'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { supabase } from '@/lib/supabase'
import { getResume, updateResume } from '@/lib/db'

type Resume = Database['public']['Tables']['resumes']['Row']

interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  location: string
  summary: string
}

interface Experience {
  title: string
  company: string
  duration: string
  description: string
}

interface Education {
  degree: string
  school: string
  year: string
  details: string
}

export default function EditResumePage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const resumeId = params.id as string

  // Form state
  const [title, setTitle] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [personal, setPersonal] = useState<PersonalInfo>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: ''
  })
  const [experience, setExperience] = useState<Experience[]>([])
  const [education, setEducation] = useState<Education[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')

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
          
          // Populate form with existing data
          setTitle(resumeData.title)
          setIsPublic(resumeData.is_public)
          
          const content = resumeData.content as any
          if (content) {
            setPersonal(content.personal || {
              fullName: '',
              email: '',
              phone: '',
              location: '',
              summary: ''
            })
            setExperience(content.experience || [])
            setEducation(content.education || [])
            setSkills(content.skills || [])
          }
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

  const handleSave = async () => {
    if (!user || !resume) return

    setSaving(true)
    try {
      await updateResume(resume.id, user.id, {
        title,
        is_public: isPublic,
        content: {
          personal,
          experience,
          education,
          skills
        } as any
      })
      
      router.push(`/resumes/${resume.id}`)
    } catch (error) {
      console.error('Error saving resume:', error)
      alert('Failed to save resume. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const addExperience = () => {
    setExperience([...experience, { title: '', company: '', duration: '', description: '' }])
  }

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = [...experience]
    updated[index] = { ...updated[index], [field]: value }
    setExperience(updated)
  }

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index))
  }

  const addEducation = () => {
    setEducation([...education, { degree: '', school: '', year: '', details: '' }])
  }

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...education]
    updated[index] = { ...updated[index], [field]: value }
    setEducation(updated)
  }

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index))
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <nav className="mb-4">
          <Link href={`/resumes/${resume.id}`} className="text-sm text-blue-600 hover:text-blue-800">
            ← Back to Resume
          </Link>
        </nav>
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Resume</h1>
            <p className="mt-2 text-sm text-gray-600">
              Update your resume information
            </p>
          </div>
          <div className="mt-4 sm:mt-0 space-x-3">
            <Link
              href={`/resumes/${resume.id}`}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Resume Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center">
                  <input
                    id="isPublic"
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                    Make this resume public
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={personal.fullName}
                  onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={personal.email}
                  onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={personal.phone}
                  onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={personal.location}
                  onChange={(e) => setPersonal({ ...personal, location: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
                  Professional Summary
                </label>
                <textarea
                  id="summary"
                  rows={4}
                  value={personal.summary}
                  onChange={(e) => setPersonal({ ...personal, summary: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Skills</h2>
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="Add a skill"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <button
                  onClick={addSkill}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  Add
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-sm font-medium text-gray-800"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(index)}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
