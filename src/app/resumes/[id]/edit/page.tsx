'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { supabase } from '@/lib/supabase'
import { getResume } from '@/lib/db'
import DashboardLayout from '@/components/DashboardLayout'
import ResumeEditor, { EditorContent } from '@/components/ResumeEditor'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

type Resume = Database['public']['Tables']['resumes']['Row']

interface PersonalInfo {
  name: string
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

function convertResumeToEditorContent(resume: Resume): EditorContent {
  const content = resume.content as any

  console.log('🔍 Converting resume data to editor content:', { resumeId: resume.id, content })

  const editorContent: EditorContent = {
    personal: content?.personal || { name: '', email: '', phone: '', location: '', summary: '' },
    experience: content?.experience || [],
    education: content?.education || [],
    skills: content?.skills || [],
  }

  console.log('✅ Converted editor content:', editorContent)
  return editorContent
}

export default function EditResumePage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [editorContent, setEditorContent] = useState<EditorContent | null>(null)
  const [jobDescription, setJobDescription] = useState<string>('')

  const resumeId = params.id as string

  useEffect(() => {
    async function loadUserAndResume() {
      try {
        console.log('🔍 Loading user and resume for ID:', resumeId)
        
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          console.warn('⚠️ No user found, redirecting to home')
          router.push('/')
          return
        }

        console.log('✅ User authenticated:', user.email)
        setUser(user)
        
        if (resumeId) {
          console.log('🔍 Fetching resume data for ID:', resumeId)
          const resumeData = await getResume(resumeId, user.id)
          
          if (!resumeData) {
            console.warn('⚠️ Resume not found, redirecting to resumes list')
            router.push('/resumes')
            return
          }
          
          console.log('✅ Resume data loaded:', resumeData)
          setResume(resumeData)
          
          const content = resumeData.content as any
          console.log('🔍 Resume content:', content)
          
          if (content) {
            const editorContent = convertResumeToEditorContent(resumeData)
            setEditorContent(editorContent)
            
            // Set job description from metadata if available
            setJobDescription(content.jobDescription || '')
          }
        }
      } catch (error) {
        console.error('❌ Error loading resume:', error)
        router.push('/resumes')
      } finally {
        setLoading(false)
      }
    }

    loadUserAndResume()
  }, [router, resumeId])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">Loading resume...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user || !resume) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Resume not found</h3>
            <p className="mt-2 text-sm text-gray-500">We couldn't find the resume you're looking for.</p>
            <div className="mt-6">
              <Link
                href="/resumes"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to my resumes
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!editorContent) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Error loading resume data</h3>
            <p className="mt-2 text-sm text-gray-500">We had trouble loading the content of this resume.</p>
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      title={`Edit Resume - ${resume.title}`}
      description="Make changes to your resume and see real-time updates"
    >
      {/* Action Button */}
      <div className="mb-6 flex justify-end">
        <Link
          href={`/resumes/${resumeId}/template`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <DocumentTextIcon className="w-4 h-4" />
          Choose Template & Export
        </Link>
      </div>
      
      {/* Resume Editor */}
      <div className="bg-white rounded-lg shadow-sm">
        <ResumeEditor
          resumeId={resumeId}
          initialContent={editorContent}
          jobDescription={jobDescription}
        />
      </div>
    </DashboardLayout>
  )
}