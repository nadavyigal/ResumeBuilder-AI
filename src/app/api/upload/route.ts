export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import { Worker } from 'worker_threads'
import { pipeline } from 'stream/promises'
import { createReadStream } from 'fs'
import { writeFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { randomUUID } from 'crypto'

// Dynamic imports for heavy dependencies
const mammoth = import('mammoth')
const pdfParse = import('pdf-parse')

// File size limit: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Supported file types
const SUPPORTED_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/pdf'
]

interface CategorizedSkill {
  name: string
  category?: string
  confidence: number
}

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
    startDate: string | undefined
    endDate: string | undefined
    description: string
  }>
  education: Array<{
    institution: string
    degree: string
    graduationDate?: string
  }>
  skills: CategorizedSkill[]
  summary?: string
  rawText: string
}

interface ValidationResult {
  isValid: boolean
  confidence: number
  issues?: string[]
}

interface ValidationResults {
  personalInfo: ValidationResult
  experience: ValidationResult[]
  education?: ValidationResult[]
  skills?: ValidationResult
}

interface ParsedField<T> {
  value: T
  confidence: number
}

// Common skill categories and their keywords (moved to module level for better memory usage)
const skillCategories = {
  'Programming Languages': [
    'javascript', 'python', 'java', 'c\\+\\+', 'typescript', 'ruby', 'php', 'swift', 'kotlin', 'go'
  ],
  'Web Technologies': [
    'html', 'css', 'react', 'angular', 'vue', 'node\\.?js', 'express', 'django', 'flask', 'spring'
  ],
  'Databases': [
    'sql', 'mysql', 'postgresql', 'mongodb', 'oracle', 'redis', 'elasticsearch', 'dynamodb'
  ],
  'Cloud & DevOps': [
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ci/cd'
  ],
  'Tools & Methodologies': [
    'git', 'agile', 'scrum', 'jira', 'confluence', 'tdd', 'rest', 'graphql'
  ],
  'Soft Skills': [
    'leadership', 'communication', 'teamwork', 'problem.?solving', 'project.?management'
  ]
}

// Optimized file processing with streaming
async function processFileStream(buffer: Buffer, mimeType: string): Promise<string> {
  const tempFilePath = join(tmpdir(), `upload-${randomUUID()}`)
  
  try {
    // Write buffer to temp file for streaming
    await writeFile(tempFilePath, buffer)
    
    if (mimeType === 'application/pdf') {
      const { default: pdfParseDefault } = await pdfParse
      const data = await pdfParseDefault(buffer)
      return data.text
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const { default: mammothDefault } = await mammoth
      const result = await mammothDefault.extractRawText({ path: tempFilePath })
      return result.value
    } else {
      throw new Error('Unsupported file type')
    }
  } finally {
    // Clean up temp file
    try {
      await unlink(tempFilePath)
    } catch (error) {
      console.warn('Failed to clean up temp file:', error)
    }
  }
}

// Memoized regex patterns for better performance
const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
const phoneRegex = /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g
const addressRegex = /\b(\d{1,6}\s+)?([\w\s-]+\.)?([\w\s]+,)?\s*([A-Z]{2}\s+)?\d{5}(-\d{4})?\b/g

// Enhanced personal info extraction with validation
function extractPersonalInfo(text: string): ParsedField<ParsedResumeData['personalInfo']> {
  const emails = text.match(emailRegex)
  const phones = text.match(phoneRegex)
  const addresses = text.match(addressRegex)
  
  // Enhanced name extraction (optimized)
  const lines = text.split('\n').slice(0, 3).filter(line => line.trim().length > 0)
  let nameConfidence = 0
  let bestNameCandidate = ''
  
  for (const line of lines) {
    const words = line.trim().split(/\s+/)
    // Name heuristics: 2-4 words, each capitalized, no numbers
    if (words.length >= 2 && words.length <= 4 && 
        words.every(word => word[0]?.toUpperCase() === word[0]) &&
        !words.some(word => /\d/.test(word))) {
      const confidence = words.length === 2 ? 0.8 : words.length === 3 ? 0.9 : 0.7
      if (confidence > nameConfidence) {
        nameConfidence = confidence
        bestNameCandidate = line.trim()
      }
    }
  }

  const personalInfo = {
    name: bestNameCandidate || undefined,
    email: emails?.[0] || undefined,
    phone: phones?.[0] || undefined,
    address: addresses?.[0] || undefined
  }

  // Calculate overall confidence
  const validFields: number[] = []
  if (personalInfo.name) validFields.push(nameConfidence)
  if (personalInfo.email) validFields.push(1)
  if (personalInfo.phone) validFields.push(0.9)
  if (personalInfo.address) validFields.push(0.8)
  
  return {
    value: personalInfo,
    confidence: validFields.length > 0 ? validFields.reduce((a, b) => a + b, 0) / validFields.length : 0
  }
}

// Optimized validation utilities
function validatePersonalInfo(info: ParsedResumeData['personalInfo']): ValidationResult {
  const issues: string[] = []
  let validFields = 0
  let totalFields = 0

  if (info.email) {
    totalFields++
    if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/.test(info.email)) {
      validFields++
    } else {
      issues.push('Invalid email format')
    }
  }

  if (info.phone) {
    totalFields++
    if (/^(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/.test(info.phone)) {
      validFields++
    } else {
      issues.push('Invalid phone format')
    }
  }

  if (info.name) {
    totalFields++
    if (/^[A-Za-z]+((\s)?([A-Za-z])+)*$/.test(info.name) && info.name.length > 3) {
      validFields++
    } else {
      issues.push('Name may be incomplete or invalid')
    }
  }

  return {
    isValid: issues.length === 0,
    confidence: totalFields > 0 ? validFields / totalFields : 0,
    issues: issues.length > 0 ? issues : undefined
  }
}

// Optimized date extraction
function extractDates(text: string): { startDate?: string; endDate?: string; confidence: number } {
  const monthNames = '(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)'
  const datePatterns = [
    /\b(0?[1-9]|1[0-2])[/-](20\d{2}|19\d{2})\b/g,
    new RegExp(`\\b${monthNames}\\s+(20\\d{2}|19\\d{2})\\b`, 'g'),
    /\b(20\d{2}|19\d{2})\b/g
  ]

  const dates: string[] = []
  for (const pattern of datePatterns) {
    const matches = text.match(pattern)
    if (matches) {
      dates.push(...matches)
    }
  }

  // Sort dates chronologically
  const sortedDates = dates
    .map(d => {
      try {
        return new Date(d).toISOString().split('T')[0]
      } catch {
        return d
      }
    })
    .sort()

  if (sortedDates.length >= 2) {
    return {
      startDate: sortedDates[0],
      endDate: sortedDates[sortedDates.length - 1],
      confidence: 0.9
    }
  } else if (sortedDates.length === 1) {
    return {
      startDate: sortedDates[0],
      confidence: 0.7
    }
  }

  return { confidence: 0 }
}

// Optimized experience extraction
function extractExperience(text: string): ParsedField<ParsedResumeData['experience']> {
  const experience: ParsedResumeData['experience'] = []
  let confidence = 0
  
  const workSectionRegex = /(work\s+experience|employment(\s+history)?|professional\s+experience)/i
  const titleRegex = /\b(senior|lead|principal|junior|associate)?\s*(software|systems?|data|product|project|program|business|marketing|sales|operations|human\s+resources?|hr|engineer|developer|analyst|manager|director|coordinator|specialist|consultant)\b/i
  
  const lines = text.split('\n')
  let inWorkSection = false
  let currentEntry: ParsedResumeData['experience'][0] = { 
    company: '', 
    position: '', 
    description: '',
    startDate: undefined,
    endDate: undefined
  }
  let entryText = ''
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (workSectionRegex.test(trimmedLine)) {
      inWorkSection = true
      confidence += 0.3
      continue
    }
    
    if (inWorkSection && trimmedLine.length > 0) {
      if (titleRegex.test(trimmedLine)) {
        if (currentEntry.company || currentEntry.position) {
          const dates = extractDates(entryText)
          currentEntry.startDate = dates.startDate
          currentEntry.endDate = dates.endDate
          confidence += dates.confidence
          experience.push({ ...currentEntry })
        }
        currentEntry = { 
          company: '', 
          position: trimmedLine, 
          description: '',
          startDate: undefined,
          endDate: undefined
        }
        entryText = trimmedLine
        confidence += 0.2
      } else if (!currentEntry.company && trimmedLine.length > 0) {
        currentEntry.company = trimmedLine
        entryText += ' ' + trimmedLine
        confidence += 0.2
      } else if (trimmedLine.length > 10) {
        currentEntry.description += (currentEntry.description ? ' ' : '') + trimmedLine
        entryText += ' ' + trimmedLine
        confidence += 0.1
      }
    }
  }
  
  if (currentEntry.company || currentEntry.position) {
    const dates = extractDates(entryText)
    currentEntry.startDate = dates.startDate
    currentEntry.endDate = dates.endDate
    confidence += dates.confidence
    experience.push(currentEntry)
  }
  
  return {
    value: experience,
    confidence: experience.length > 0 ? Math.min(confidence, 1) : 0
  }
}

// Optimized education extraction
function extractEducation(text: string): ParsedField<ParsedResumeData['education']> {
  const education: ParsedResumeData['education'] = []
  let confidence = 0
  
  const educationRegex = /(education|academic|qualifications|degrees?)/i
  const degreeRegex = /\b(bachelor|master|phd|doctorate|associate|diploma|certificate|bs|ba|ma|ms|mba|phd|md|jd)\b.*?(of|in)?\s+[a-z\s]+/i
  const institutionIndicators = /\b(university|college|institute|school)\b/i
  
  const lines = text.split('\n')
  let inEducationSection = false
  let currentEntry: ParsedResumeData['education'][0] = {
    institution: '',
    degree: '',
    graduationDate: undefined
  }
  let entryText = ''
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (educationRegex.test(trimmedLine)) {
      inEducationSection = true
      confidence += 0.3
      continue
    }
    
    if (inEducationSection && trimmedLine.length > 0) {
      const degreeMatch = trimmedLine.match(degreeRegex)
      
      if (degreeMatch) {
        if (currentEntry.degree || currentEntry.institution) {
          const dates = extractDates(entryText)
          if (dates.startDate) {
            currentEntry.graduationDate = dates.startDate
            confidence += 0.2
          }
          education.push({ ...currentEntry })
        }
        
        currentEntry = {
          institution: '',
          degree: degreeMatch[0].trim(),
          graduationDate: undefined
        }
        entryText = trimmedLine
        confidence += 0.2
      } else if (institutionIndicators.test(trimmedLine) && !currentEntry.institution) {
        currentEntry.institution = trimmedLine
        entryText += ' ' + trimmedLine
        confidence += 0.2
      } else if (trimmedLine.length > 0) {
        entryText += ' ' + trimmedLine
      }
    }
  }
  
  if (currentEntry.degree || currentEntry.institution) {
    const dates = extractDates(entryText)
    if (dates.startDate) {
      currentEntry.graduationDate = dates.startDate
      confidence += 0.2
    }
    education.push(currentEntry)
  }
  
  return {
    value: education,
    confidence: education.length > 0 ? Math.min(confidence, 1) : 0
  }
}

// Optimized skills extraction
function extractSkills(text: string): ParsedField<CategorizedSkill[]> {
  const skills: CategorizedSkill[] = []
  let confidence = 0
  
  const skillsRegex = /(skills|technologies|expertise|competencies|proficiencies)/i
  const lines = text.split('\n')
  let inSkillsSection = false
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (skillsRegex.test(trimmedLine)) {
      inSkillsSection = true
      confidence += 0.3
      continue
    }
    
    if (inSkillsSection && trimmedLine.length > 0) {
      // Split by common delimiters
      const potentialSkills = trimmedLine.split(/[,;|•\-\n]+/)
        .map(s => s.trim())
        .filter(s => s.length > 1 && s.length < 30)
      
      for (const skill of potentialSkills) {
        let category: string | undefined
        let skillConfidence = 0.5
        
        // Check against skill categories
        for (const [cat, keywords] of Object.entries(skillCategories)) {
          for (const keyword of keywords) {
            const regex = new RegExp(`\\b${keyword}\\b`, 'i')
            if (regex.test(skill)) {
              category = cat
              skillConfidence = 0.8
              break
            }
          }
          if (category) break
        }
        
        skills.push({
          name: skill,
          category,
          confidence: skillConfidence
        })
        confidence += 0.1
      }
    }
  }
  
  return {
    value: skills,
    confidence: skills.length > 0 ? Math.min(confidence, 1) : 0
  }
}

// Optimized validation functions
function validateExperience(entry: ParsedResumeData['experience'][0]): ValidationResult {
  const issues: string[] = []
  let validFields = 0
  let totalFields = 0

  if (entry.company) {
    totalFields++
    if (entry.company.length >= 2 && !/^\d+$/.test(entry.company)) {
      validFields++
    } else {
      issues.push('Company name may be invalid')
    }
  }

  if (entry.position) {
    totalFields++
    if (entry.position.length >= 3 && !/^\d+$/.test(entry.position)) {
      validFields++
    } else {
      issues.push('Position title may be invalid')
    }
  }

  if (entry.description) {
    totalFields++
    if (entry.description.length >= 10) {
      validFields++
    } else {
      issues.push('Description seems too short')
    }
  }

  if (entry.startDate || entry.endDate) {
    totalFields++
    if (entry.startDate && entry.endDate) {
      if (new Date(entry.startDate) <= new Date(entry.endDate)) {
        validFields++
      } else {
        issues.push('Start date is after end date')
      }
    } else {
      validFields += 0.5
    }
  }

  return {
    isValid: issues.length === 0,
    confidence: totalFields > 0 ? validFields / totalFields : 0,
    issues: issues.length > 0 ? issues : undefined
  }
}

function validateEducation(entry: ParsedResumeData['education'][0]): ValidationResult {
  const issues: string[] = []
  let validFields = 0
  let totalFields = 0

  if (entry.institution) {
    totalFields++
    if (entry.institution.length >= 2 && !/^\d+$/.test(entry.institution)) {
      validFields++
    } else {
      issues.push('Institution name may be invalid')
    }
  }

  if (entry.degree) {
    totalFields++
    if (entry.degree.length >= 3) {
      validFields++
    } else {
      issues.push('Degree seems too short')
    }
  }

  if (entry.graduationDate) {
    totalFields++
    const date = new Date(entry.graduationDate)
    if (!isNaN(date.getTime()) && date.getFullYear() >= 1900 && date.getFullYear() <= new Date().getFullYear() + 10) {
      validFields++
    } else {
      issues.push('Graduation date seems invalid')
    }
  }

  return {
    isValid: issues.length === 0,
    confidence: totalFields > 0 ? validFields / totalFields : 0,
    issues: issues.length > 0 ? issues : undefined
  }
}

function validateSkills(skills: CategorizedSkill[]): ValidationResult {
  const issues: string[] = []
  
  if (skills.length === 0) {
    issues.push('No skills detected')
  } else if (skills.length > 50) {
    issues.push('Unusually high number of skills detected')
  }
  
  const categorizedSkills = skills.filter(s => s.category)
  if (categorizedSkills.length === 0 && skills.length > 0) {
    issues.push('No skills could be categorized')
  }
  
  const avgConfidence = skills.reduce((sum, skill) => sum + skill.confidence, 0) / (skills.length || 1)
  const categorizationRate = skills.length > 0 ? categorizedSkills.length / skills.length : 0
  
  return {
    isValid: issues.length === 0,
    confidence: (avgConfidence + categorizationRate) / 2,
    issues: issues.length > 0 ? issues : undefined
  }
}

// Main parsing function
function parseResumeText(text: string): ParsedResumeData & { validation: ValidationResults } {
  const personalInfo = extractPersonalInfo(text)
  const experience = extractExperience(text)
  const education = extractEducation(text)
  const skills = extractSkills(text)

  const result: ParsedResumeData = {
    personalInfo: personalInfo.value,
    experience: experience.value,
    education: education.value,
    skills: skills.value,
    summary: text.substring(0, 500).trim(),
    rawText: text
  }

  const validation: ValidationResults = {
    personalInfo: validatePersonalInfo(personalInfo.value),
    experience: experience.value.map(validateExperience),
    education: education.value.map(validateEducation),
    skills: validateSkills(skills.value)
  }

  return { ...result, validation }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!SUPPORTED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Please upload a DOCX or PDF file.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB.' },
        { status: 400 }
      )
    }

    // Convert file to buffer efficiently
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Process file with streaming
    const extractedText = await processFileStream(buffer, file.type)

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Could not extract text from the file. Please ensure the file contains text.' },
        { status: 400 }
      )
    }

    // Parse resume data
    const parsedData = parseResumeText(extractedText)

    // Get user session for database operations
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Store in database with optimized query
    const { data: resumeData, error: insertError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        title: `Resume - ${new Date().toLocaleDateString()}`,
        content: parsedData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to save resume data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        resumeId: resumeData.id,
        parsedData,
        filename: file.name,
        processingTime: Date.now() - startTime
      }
    }, {
      headers: {
        'X-Processing-Time': `${Date.now() - startTime}ms`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    console.error('Upload processing error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process file',
        processingTime: Date.now() - startTime
      },
      { 
        status: 500,
        headers: {
          'X-Processing-Time': `${Date.now() - startTime}ms`
        }
      }
    )
  }
} 