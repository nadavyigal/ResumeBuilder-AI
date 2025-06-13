'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { supabase } from '@/lib/supabase'
import { getResume, updateResume } from '@/lib/db'
import ResumeEditor from '@/components/ResumeEditor'
import { ResumeSectionData } from '@/components/ResumeSection'

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

// Mock data for demonstration
const mockSections: ResumeSectionData[] = [
  {
    id: '1',
    title: 'Professional Summary',
    type: 'summary',
    content: '<p>Experienced software developer with 5+ years of expertise in building scalable web applications.</p>',
  },
  {
    id: '2',
    title: 'Work Experience',
    type: 'experience',
    content: '<p><strong>Senior Developer</strong> - Tech Corp (2020-Present)</p><ul><li>Led development of key features</li><li>Mentored junior developers</li></ul>',
  },
  {
    id: '3',
    title: 'Education',
    type: 'education',
    content: '<p><strong>Bachelor of Science in Computer Science</strong></p><p>University of Technology, 2018</p>',
  },
  {
    id: '4',
    title: 'Skills',
    type: 'skills',
    content: '<ul><li>JavaScript, TypeScript, React</li><li>Node.js, Express, PostgreSQL</li><li>AWS, Docker, CI/CD</li></ul>',
  },
]

const mockJobDescription = 'We are looking for a Senior Full Stack Developer with experience in React, Node.js, and cloud technologies. The ideal candidate should have strong problem-solving skills and experience leading development teams.'

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
    <div className="min-h-screen bg-gray-50">
      {/* Header with Template Link */}
      <div className="bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold">Edit Resume - {resume.title}</h1>
            <Link
              href={`/resumes/${resumeId}/template`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              Choose Template & Export
            </Link>
          </div>
        </div>
      </div>
      
      <div className="py-8">
        <ResumeEditor
          resumeId={resumeId}
          initialSections={mockSections}
          jobDescription={mockJobDescription}
        />
      </div>
    </div>
  )
}
