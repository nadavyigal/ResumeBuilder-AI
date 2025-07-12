export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { withEnvironmentValidation } from '@/lib/api-protection'
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
    if (/^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/.test(info.phone)) {
      validFields++
    } else {
      issues.push('Invalid phone format')
    }
  }

  if (info.name) {
    totalFields++
    if (info.name.trim().length > 0 && info.name.split(' ').length >= 2) {
      validFields++
    } else {
      issues.push('Name appears incomplete')
    }
  }

  return {
    isValid: validFields > 0,
    confidence: totalFields > 0 ? validFields / totalFields : 0,
    issues: issues.length > 0 ? issues : undefined
  }
}

// Enhanced date extraction with better patterns
function extractDates(text: string): { startDate?: string; endDate?: string; confidence: number } {
  const datePatterns = [
    /(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{4})\s*[-–—]\s*(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{4}|present|current)/i,
    /(\d{1,2}\/\d{4})\s*[-–—]\s*(\d{1,2}\/\d{4}|present|current)/i,
    /(\d{4})\s*[-–—]\s*(\d{4}|present|current)/i
  ]

  let bestMatch = null
  let confidence = 0

  for (const pattern of datePatterns) {
    const matches = text.match(pattern)
    if (matches) {
      bestMatch = matches
      confidence = pattern.source.includes('jan') ? 0.9 : 0.7
      break
    }
  }

  if (bestMatch) {
    return {
      startDate: bestMatch[1],
      endDate: bestMatch[2].toLowerCase() === 'present' || bestMatch[2].toLowerCase() === 'current' ? undefined : bestMatch[2],
      confidence
    }
  }

  return { confidence: 0 }
}

// Enhanced experience extraction with better validation
function extractExperience(text: string): ParsedField<ParsedResumeData['experience']> {
  const experiences: ParsedResumeData['experience'] = []
  
  // Split text into potential experience blocks
  const blocks = text.split(/\n\s*\n/).filter(block => block.trim().length > 20)
  
  for (const block of blocks) {
    const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    if (lines.length < 2) continue
    
    // Look for job title patterns
    const jobTitlePatterns = [
      /^(.*?)\s+(?:at|@)\s+(.+)$/i,
      /^(.+?)\s*[-–—]\s*(.+)$/,
      /^(.+)/
    ]
    
    let company = ''
    let position = ''
    let description = ''
    
    for (const line of lines) {
      for (const pattern of jobTitlePatterns) {
        const match = line.match(pattern)
        if (match && !position) {
          if (match[2]) {
            position = match[1].trim()
            company = match[2].trim()
          } else {
            position = match[1].trim()
          }
          break
        }
      }
      
      if (position && !company && line !== lines[0]) {
        company = line
        break
      }
    }
    
    if (position) {
      const dates = extractDates(block)
      description = lines.slice(2).join(' ').trim()
      
      experiences.push({
        company: company || 'Unknown Company',
        position,
        startDate: dates.startDate,
        endDate: dates.endDate,
        description: description || 'No description provided'
      })
    }
  }
  
  return {
    value: experiences,
    confidence: experiences.length > 0 ? 0.8 : 0
  }
}

// Enhanced education extraction
function extractEducation(text: string): ParsedField<ParsedResumeData['education']> {
  const education: ParsedResumeData['education'] = []
  
  // Look for education keywords
  const educationPattern = /(?:education|academic|university|college|school|degree|bachelor|master|phd|doctorate)/i
  const educationSection = text.split('\n').find(line => educationPattern.test(line))
  
  if (educationSection) {
    const lines = text.split('\n')
    const startIndex = lines.findIndex(line => educationPattern.test(line))
    const educationLines = lines.slice(startIndex, startIndex + 10)
    
    for (const line of educationLines) {
      const degreePattern = /(?:bachelor|master|phd|doctorate|bs|ba|ms|ma|mba|phd)[\s\w]*(?:in|of)?\s*([^,\n]+)/i
      const match = line.match(degreePattern)
      
      if (match) {
        education.push({
          institution: 'Unknown Institution',
          degree: match[0].trim(),
          graduationDate: undefined
        })
      }
    }
  }
  
  return {
    value: education,
    confidence: education.length > 0 ? 0.7 : 0
  }
}

// Enhanced skills extraction with categorization
function extractSkills(text: string): ParsedField<CategorizedSkill[]> {
  const skills: CategorizedSkill[] = []
  const textLower = text.toLowerCase()
  
  // Extract skills by category
  Object.entries(skillCategories).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      const matches = text.match(regex)
      
      if (matches) {
        matches.forEach(match => {
          const existingSkill = skills.find(s => s.name.toLowerCase() === match.toLowerCase())
          if (!existingSkill) {
            skills.push({
              name: match,
              category,
              confidence: 0.8
            })
          }
        })
      }
    })
  })
  
  return {
    value: skills,
    confidence: skills.length > 0 ? 0.8 : 0
  }
}

// Validation functions
function validateExperience(entry: ParsedResumeData['experience'][0]): ValidationResult {
  const issues: string[] = []
  
  if (!entry.company || entry.company.trim().length === 0) {
    issues.push('Company name is missing')
  }
  
  if (!entry.position || entry.position.trim().length === 0) {
    issues.push('Position title is missing')
  }
  
  if (!entry.description || entry.description.trim().length < 20) {
    issues.push('Job description is too short or missing')
  }
  
  return {
    isValid: issues.length === 0,
    confidence: issues.length === 0 ? 0.8 : 0.4,
    issues: issues.length > 0 ? issues : undefined
  }
}

function validateEducation(entry: ParsedResumeData['education'][0]): ValidationResult {
  const issues: string[] = []
  
  if (!entry.institution || entry.institution.trim().length === 0) {
    issues.push('Institution name is missing')
  }
  
  if (!entry.degree || entry.degree.trim().length === 0) {
    issues.push('Degree information is missing')
  }
  
  return {
    isValid: issues.length === 0,
    confidence: issues.length === 0 ? 0.7 : 0.3,
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
  
  console.log('Skills validation:', { avgConfidence, categorizationRate })
  
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

async function uploadHandler(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Create Supabase client with modern SSR pattern
    const supabase = await createClient()
    
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

    // Store the parsed resume data in Supabase (matching DS.md schema)
    const { data: resumeData, error: insertError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        title: `Resume uploaded on ${new Date().toLocaleDateString()}`,
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

export const POST = withEnvironmentValidation(uploadHandler, ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']) 