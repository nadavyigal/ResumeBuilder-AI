export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import mammoth from 'mammoth'
import { Database } from '@/types/supabase'
// @ts-ignore
const pdfParse = require('pdf-parse');

// File size limit: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Supported file types (PDF support coming soon)
const SUPPORTED_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/pdf'
]

interface ParsedResumeData {
  personalInfo: {
    name?: string
    email?: string
    phone?: string
    address?: string
  }
  experience: Array<{
    company: string
    position: string
    startDate?: string
    endDate?: string
    description: string
  }>
  education: Array<{
    institution: string
    degree: string
    graduationDate?: string
  }>
  skills: string[]
  summary?: string
  rawText: string
}

function extractPersonalInfo(text: string) {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  const phoneRegex = /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g
  
  const emails = text.match(emailRegex)
  const phones = text.match(phoneRegex)
  
  // Extract name (usually the first line or near contact info)
  const lines = text.split('\n').filter(line => line.trim().length > 0)
  const nameCandidate = lines[0]?.trim()
  
  return {
    name: nameCandidate && nameCandidate.length < 50 ? nameCandidate : undefined,
    email: emails ? emails[0] : undefined,
    phone: phones ? phones[0] : undefined,
  }
}

function extractExperience(text: string) {
  const experience: ParsedResumeData['experience'] = []
  
  // Look for common work experience patterns
  const workSectionRegex = /(experience|employment|work history|professional experience)/i
  const lines = text.split('\n')
  
  let inWorkSection = false
  let currentEntry = { company: '', position: '', description: '' }
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (workSectionRegex.test(line)) {
      inWorkSection = true
      continue
    }
    
    if (inWorkSection && line.length > 0) {
      // Simple heuristic: if line contains common job title words
      if (/\b(manager|developer|engineer|analyst|specialist|director|coordinator|assistant)\b/i.test(line)) {
        if (currentEntry.company || currentEntry.position) {
          experience.push({ ...currentEntry })
        }
        currentEntry = { company: '', position: line, description: '' }
      } else if (!currentEntry.company && line.length > 0) {
        currentEntry.company = line
      } else if (line.length > 10) {
        currentEntry.description += (currentEntry.description ? ' ' : '') + line
      }
    }
  }
  
  if (currentEntry.company || currentEntry.position) {
    experience.push(currentEntry)
  }
  
  return experience
}

function extractEducation(text: string) {
  const education: ParsedResumeData['education'] = []
  
  const educationRegex = /(education|academic background|qualifications)/i
  const degreeRegex = /\b(bachelor|master|phd|doctorate|associate|diploma|certificate)\b/i
  
  const lines = text.split('\n')
  let inEducationSection = false
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (educationRegex.test(trimmedLine)) {
      inEducationSection = true
      continue
    }
    
    if (inEducationSection && degreeRegex.test(trimmedLine)) {
      education.push({
        institution: '',
        degree: trimmedLine,
        graduationDate: undefined
      })
    }
  }
  
  return education
}

function extractSkills(text: string) {
  const skills: string[] = []
  
  const skillsRegex = /(skills|technologies|competencies|proficiencies)/i
  const lines = text.split('\n')
  
  let inSkillsSection = false
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (skillsRegex.test(trimmedLine)) {
      inSkillsSection = true
      continue
    }
    
    if (inSkillsSection && trimmedLine.length > 0) {
      // Split by common delimiters
      const lineSkills = trimmedLine.split(/[,;|•·]/).map(skill => skill.trim()).filter(skill => skill.length > 0)
      skills.push(...lineSkills)
    }
  }
  
  return skills
}

function parseResumeText(text: string): ParsedResumeData {
  const personalInfo = extractPersonalInfo(text)
  const experience = extractExperience(text)
  const education = extractEducation(text)
  const skills = extractSkills(text)
  
  // Extract summary (usually first few lines after name)
  const lines = text.split('\n').filter(line => line.trim().length > 0)
  const summaryLines = lines.slice(1, 4).join(' ')
  const summary = summaryLines.length > 20 ? summaryLines : undefined
  
  return {
    personalInfo,
    experience,
    education,
    skills,
    summary,
    rawText: text
  }
}

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!SUPPORTED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a DOCX or PDF file.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    let text = ''
    if (file.type === 'application/pdf') {
      try {
        const pdfData = await pdfParse(buffer)
        text = pdfData.text
      } catch (err) {
        return NextResponse.json(
          { error: 'Failed to parse PDF. Please ensure the file is not corrupted.' },
          { status: 400 }
        )
      }
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    }
    if (!text.trim()) {
      return NextResponse.json(
        { error: 'No text content found in the file.' },
        { status: 400 }
      )
    }

    // Parse resume text into structured data
    const parsedData = parseResumeText(text)

    // Store the parsed resume data in Supabase
    const { data: resumeData, error: insertError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        original_filename: file.name,
        parsed_data: parsedData,
        raw_text: text,
        status: 'processed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error storing resume:', insertError)
      return NextResponse.json(
        { error: 'Failed to store resume data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: resumeData.id,
        parsed: parsedData
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process resume' },
      { status: 500 }
    )
  }
} 