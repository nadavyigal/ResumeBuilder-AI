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

// Common skill categories and their keywords
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

// Enhanced personal info extraction with validation
function extractPersonalInfo(text: string): ParsedField<ParsedResumeData['personalInfo']> {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  const phoneRegex = /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g
  const addressRegex = /\b(\d{1,6}\s+)?([\w\s-]+\.)?([\w\s]+,)?\s*([A-Z]{2}\s+)?\d{5}(-\d{4})?\b/g
  
  const emails = text.match(emailRegex)
  const phones = text.match(phoneRegex)
  const addresses = text.match(addressRegex)
  
  // Enhanced name extraction
  const lines = text.split('\n').filter(line => line.trim().length > 0)
  const nameLines = lines.slice(0, 3) // Check first 3 lines for name
  let nameConfidence = 0
  let bestNameCandidate = ''
  
  for (const line of nameLines) {
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
    email: emails ? emails[0] : undefined,
    phone: phones ? phones[0] : undefined,
    address: addresses ? addresses[0] : undefined
  }

  // Calculate overall confidence
  let confidence = 0
  let validFields = 0
  if (personalInfo.name) { confidence += nameConfidence; validFields++ }
  if (personalInfo.email) { confidence += 1; validFields++ }
  if (personalInfo.phone) { confidence += 0.9; validFields++ }
  if (personalInfo.address) { confidence += 0.8; validFields++ }
  
  return {
    value: personalInfo,
    confidence: validFields > 0 ? confidence / validFields : 0
  }
}

// Validation utilities
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

function extractDates(text: string): { startDate?: string; endDate?: string; confidence: number } {
  const monthNames = '(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)'
  const datePatterns = [
    // MM/YYYY or MM-YYYY
    /\b(0?[1-9]|1[0-2])[/-](20\d{2}|19\d{2})\b/g,
    // Month YYYY
    new RegExp(`\\b${monthNames}\\s+(20\\d{2}|19\\d{2})\\b`, 'g'),
    // YYYY
    /\b(20\d{2}|19\d{2})\b/g
  ]

  let dates: string[] = []
  for (const pattern of datePatterns) {
    const matches = text.match(pattern)
    if (matches) {
      dates.push(...matches)
    }
  }

  // Sort dates chronologically
  dates = dates.map(d => {
    try {
      return new Date(d).toISOString().split('T')[0]
    } catch {
      return d
    }
  }).sort()

  if (dates.length >= 2) {
    return {
      startDate: dates[0],
      endDate: dates[dates.length - 1],
      confidence: 0.9
    }
  } else if (dates.length === 1) {
    return {
      startDate: dates[0],
      confidence: 0.7
    }
  }

  return { confidence: 0 }
}

function validateExperience(entry: ParsedResumeData['experience'][0]): ValidationResult {
  const issues: string[] = []
  let validFields = 0
  let totalFields = 0

  // Company validation
  if (entry.company) {
    totalFields++
    if (entry.company.length >= 2 && !/^\d+$/.test(entry.company)) {
      validFields++
    } else {
      issues.push('Company name may be invalid')
    }
  }

  // Position validation
  if (entry.position) {
    totalFields++
    if (entry.position.length >= 3 && !/^\d+$/.test(entry.position)) {
      validFields++
    } else {
      issues.push('Position title may be invalid')
    }
  }

  // Description validation
  if (entry.description) {
    totalFields++
    if (entry.description.length >= 10) {
      validFields++
    } else {
      issues.push('Description seems too short')
    }
  }

  // Date validation
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

function extractExperience(text: string): ParsedField<ParsedResumeData['experience']> {
  const experience: ParsedResumeData['experience'] = []
  let confidence = 0
  
  // Look for common work experience patterns
  const workSectionRegex = /(work\s+experience|employment(\s+history)?|professional\s+experience)/i
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
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (workSectionRegex.test(line)) {
      inWorkSection = true
      confidence += 0.3 // Found work section header
      continue
    }
    
    if (inWorkSection && line.length > 0) {
      // Detect job titles more accurately
      const titleRegex = /\b(senior|lead|principal|junior|associate)?\s*(software|systems?|data|product|project|program|business|marketing|sales|operations|human\s+resources?|hr|engineer|developer|analyst|manager|director|coordinator|specialist|consultant)\b/i
      
      if (titleRegex.test(line)) {
        if (currentEntry.company || currentEntry.position) {
          // Process dates from accumulated entry text
          const dates = extractDates(entryText)
          currentEntry.startDate = dates.startDate
          currentEntry.endDate = dates.endDate
          confidence += dates.confidence

          experience.push({ ...currentEntry })
        }
        currentEntry = { 
          company: '', 
          position: line, 
          description: '',
          startDate: undefined,
          endDate: undefined
        }
        entryText = line
        confidence += 0.2 // Found job title
      } else if (!currentEntry.company && line.length > 0) {
        currentEntry.company = line
        entryText += ' ' + line
        confidence += 0.2 // Found company
      } else if (line.length > 10) {
        currentEntry.description += (currentEntry.description ? ' ' : '') + line
        entryText += ' ' + line
        confidence += 0.1 // Found description
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
  
  // Normalize confidence score
  confidence = Math.min(confidence, 1)
  
  return {
    value: experience,
    confidence: experience.length > 0 ? confidence : 0
  }
}

function validateEducation(entry: ParsedResumeData['education'][0]): ValidationResult {
  const issues: string[] = []
  let validFields = 0
  let totalFields = 0

  // Institution validation
  if (entry.institution) {
    totalFields++
    if (entry.institution.length >= 2 && !/^\d+$/.test(entry.institution)) {
      validFields++
    } else {
      issues.push('Institution name may be invalid')
    }
  }

  // Degree validation
  if (entry.degree) {
    totalFields++
    if (entry.degree.length >= 3) {
      validFields++
    } else {
      issues.push('Degree seems too short')
    }
  }

  // Date validation
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
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (educationRegex.test(line)) {
      inEducationSection = true
      confidence += 0.3 // Found education section
      continue
    }
    
    if (inEducationSection && line.length > 0) {
      const degreeMatch = line.match(degreeRegex)
      
      if (degreeMatch) {
        if (currentEntry.degree || currentEntry.institution) {
          // Process dates from accumulated entry text
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
        entryText = line
        confidence += 0.2 // Found degree
      } else if (institutionIndicators.test(line) && !currentEntry.institution) {
        currentEntry.institution = line
        entryText += ' ' + line
        confidence += 0.2 // Found institution
      } else if (line.length > 0) {
        entryText += ' ' + line
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
  
  // Normalize confidence score
  confidence = Math.min(confidence, 1)
  
  return {
    value: education,
    confidence: education.length > 0 ? confidence : 0
  }
}

function validateSkills(skills: CategorizedSkill[]): ValidationResult {
  const issues: string[] = []
  let validSkills = 0
  
  // Check for reasonable number of skills
  if (skills.length === 0) {
    issues.push('No skills detected')
  } else if (skills.length > 50) {
    issues.push('Unusually high number of skills detected')
  }
  
  // Check for categorization
  const categorizedSkills = skills.filter(s => s.category)
  if (categorizedSkills.length === 0 && skills.length > 0) {
    issues.push('No skills could be categorized')
  }
  
  // Calculate confidence based on categorization and confidence scores
  const avgConfidence = skills.reduce((sum, skill) => sum + skill.confidence, 0) / (skills.length || 1)
  const categorizationRate = skills.length > 0 ? categorizedSkills.length / skills.length : 0
  
  return {
    isValid: issues.length === 0,
    confidence: (avgConfidence + categorizationRate) / 2,
    issues: issues.length > 0 ? issues : undefined
  }
}

function extractSkills(text: string): ParsedField<CategorizedSkill[]> {
  const skills: CategorizedSkill[] = []
  let confidence = 0
  
  const skillsRegex = /(skills|technologies|competencies|proficiencies|technical expertise)/i
  const lines = text.split('\n')
  
  let inSkillsSection = false
  let sectionConfidence = 0
  
  for (const line of lines) {
    const trimmedLine = line.trim().toLowerCase()
    
    if (skillsRegex.test(trimmedLine)) {
      inSkillsSection = true
      sectionConfidence = 0.3 // Found skills section
      continue
    }
    
    if (inSkillsSection && trimmedLine.length > 0) {
      // Split by common delimiters and clean up
      const lineSkills = trimmedLine
        .split(/[,;|•·]/)
        .map(skill => skill.trim())
        .filter(skill => skill.length >= 2 && !/^[0-9\s]+$/.test(skill))
      
      for (const skillName of lineSkills) {
        let maxConfidence = 0
        let bestCategory = undefined
        
        // Try to categorize the skill
        for (const [category, keywords] of Object.entries(skillCategories)) {
          for (const keyword of keywords) {
            if (new RegExp(`\\b${keyword}\\b`, 'i').test(skillName)) {
              const matchConfidence = inSkillsSection ? 0.8 : 0.6
              if (matchConfidence > maxConfidence) {
                maxConfidence = matchConfidence
                bestCategory = category
              }
            }
          }
        }
        
        // If not categorized but in skills section, still include with lower confidence
        if (maxConfidence === 0 && inSkillsSection) {
          maxConfidence = 0.4
        }
        
        if (maxConfidence > 0) {
          skills.push({
            name: skillName,
            category: bestCategory,
            confidence: maxConfidence
          })
          confidence += maxConfidence
        }
      }
    }
  }
  
  // Normalize confidence score
  confidence = Math.min(confidence / (skills.length || 1), 1)
  
  return {
    value: skills,
    confidence: skills.length > 0 ? confidence : 0
  }
}

function parseResumeText(text: string): ParsedResumeData & { validation: ValidationResults } {
  const personalInfoResult = extractPersonalInfo(text)
  const experienceResult = extractExperience(text)
  const educationResult = extractEducation(text)
  const skillsResult = extractSkills(text)
  
  const lines = text.split('\n').filter(line => line.trim().length > 0)
  const summaryLines = lines.slice(1, 4).join(' ')
  const summary = summaryLines.length > 20 ? summaryLines : undefined
  
  // Validate extracted data
  const validation: ValidationResults = {
    personalInfo: validatePersonalInfo(personalInfoResult.value),
    experience: experienceResult.value.map(validateExperience),
    education: educationResult.value.map(validateEducation),
    skills: validateSkills(skillsResult.value)
  }

  return {
    personalInfo: personalInfoResult.value,
    experience: experienceResult.value,
    education: educationResult.value,
    skills: skillsResult.value,
    summary,
    rawText: text,
    validation
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

    // Calculate overall parsing confidence
    const overallConfidence = {
      score: (
        parsedData.validation.personalInfo.confidence +
        (parsedData.validation.experience.reduce((sum, exp) => sum + exp.confidence, 0) / parsedData.validation.experience.length) +
        ((parsedData.validation.education?.reduce((sum, edu) => sum + edu.confidence, 0) || 0) / 
         (parsedData.validation.education?.length || 1)) +
        (parsedData.validation.skills?.confidence || 0)
      ) / 4,
      issues: [
        ...(parsedData.validation.personalInfo.issues || []),
        ...parsedData.validation.experience.flatMap(exp => exp.issues || []),
        ...(parsedData.validation.education?.flatMap(edu => edu.issues || []) || []),
        ...(parsedData.validation.skills?.issues || [])
      ]
    }

    // Store the parsed resume data in Supabase
    const { data: resumeData, error: insertError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        parsed_data: parsedData,
        raw_text: text,
        confidence_score: overallConfidence.score,
        parsing_issues: overallConfidence.issues.length > 0 ? overallConfidence.issues : null,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error storing resume:', insertError)
      return NextResponse.json(
        { error: 'Failed to store resume data.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...parsedData,
        confidence: overallConfidence,
        id: resumeData.id
      }
    })

  } catch (error) {
    console.error('Error processing resume:', error)
    return NextResponse.json(
      { error: 'Failed to process resume.' },
      { status: 500 }
    )
  }
} 