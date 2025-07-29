'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { supabase } from '@/lib/supabase'
import { getResume, updateResume } from '@/lib/db'
import DashboardLayout from '@/components/DashboardLayout'
import ResumeEditor from '@/components/ResumeEditor'
import { ResumeSectionData } from '@/components/ResumeSection'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

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

// Convert resume data to sections format
function convertResumeToSections(resume: Resume): ResumeSectionData[] {
  const sections: ResumeSectionData[] = []
  const content = resume.content as any

  if (content?.personal?.summary) {
    sections.push({
      id: 'summary',
      title: 'Professional Summary',
      type: 'summary',
      content: `<p>${content.personal.summary}</p>`,
    })
  }

  if (content?.experience?.length > 0) {
    const experienceContent = content.experience.map((exp: Experience) => 
      `<div class="mb-4">
        <h3 class="font-semibold">${exp.title}</h3>
        <h4 class="text-gray-600">${exp.company} - ${exp.duration}</h4>
        <p class="mt-2">${exp.description}</p>
      </div>`
    ).join('')
    
    sections.push({
      id: 'experience',
      title: 'Work Experience',
      type: 'experience',
      content: experienceContent,
    })
  }

  if (content?.education?.length > 0) {
    const educationContent = content.education.map((edu: Education) => 
      `<div class="mb-4">
        <h3 class="font-semibold">${edu.degree}</h3>
        <h4 class="text-gray-600">${edu.school} - ${edu.year}</h4>
        ${edu.details ? `<p class="mt-2">${edu.details}</p>` : ''}
      </div>`
    ).join('')
    
    sections.push({
      id: 'education',
      title: 'Education',
      type: 'education',
      content: educationContent,
    })
  }

  if (content?.skills?.length > 0) {
    const skillsContent = `<div class="flex flex-wrap gap-2">
      ${content.skills.map((skill: string) => 
        `<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">${skill}</span>`
      ).join('')}
    </div>`
    
    sections.push({
      id: 'skills',
      title: 'Skills',
      type: 'skills',
      content: skillsContent,
    })
  }

  return sections
}

export default function EditResumePage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sections, setSections] = useState<ResumeSectionData[]>([])
  const [jobDescription, setJobDescription] = useState<string>('')

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
            
            // Convert resume data to sections for the editor
            setSections(convertResumeToSections(resumeData))
            
            // Set job description from metadata if available
            setJobDescription(content.jobDescription || '')
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
    return null // Router will handle redirect
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
          initialSections={sections}
          jobDescription={jobDescription}
        />
      </div>
    </DashboardLayout>
  )
}
