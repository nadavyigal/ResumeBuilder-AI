import { POST } from '../src/app/api/upload/route'
import { NextRequest } from 'next/server'

// Mock Supabase auth
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null
      })
    },
    from: jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'test-resume-id',
              title: 'Test Resume',
              content: {},
              user_id: 'test-user-id'
            },
            error: null
          })
        })
      })
    })
  })
}))

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn()
}))

// Mock mammoth
jest.mock('mammoth', () => ({
  extractRawText: jest.fn().mockResolvedValue({
    value: `John Doe
john.doe@example.com
(555) 123-4567

EXPERIENCE
Software Engineer
TechCorp Inc
Developed web applications using React and Node.js

EDUCATION
Bachelor of Science in Computer Science
University of Technology

SKILLS
JavaScript, React, Node.js, TypeScript`
  })
}))

describe('/api/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should reject requests without authentication', async () => {
    // Mock no user
    const { createRouteHandlerClient } = require('@supabase/auth-helpers-nextjs')
    createRouteHandlerClient.mockReturnValueOnce({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Not authenticated')
        })
      }
    })

    const formData = new FormData()
    const mockFile = new File(['test content'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    })
    formData.append('file', mockFile)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Authentication required')
  })

  it('should reject unsupported file types', async () => {
    const formData = new FormData()
    const mockFile = new File(['test content'], 'test.txt', {
      type: 'text/plain'
    })
    formData.append('file', mockFile)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Unsupported file type')
  })

  it('should reject files that are too large', async () => {
    const formData = new FormData()
    // Create a mock file larger than 10MB
    const largeContent = 'x'.repeat(11 * 1024 * 1024) // 11MB
    const mockFile = new File([largeContent], 'large.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    })
    formData.append('file', mockFile)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('File too large')
  })

  it('should successfully parse a DOCX file', async () => {
    const formData = new FormData()
    const mockFile = new File(['mock docx content'], 'resume.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    })
    formData.append('file', mockFile)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('Resume uploaded and parsed successfully')
    expect(data.data.resumeId).toBe('test-resume-id')
    expect(data.data.parsedData).toBeDefined()
    expect(data.data.parsedData.personalInfo.name).toBe('John Doe')
    expect(data.data.parsedData.personalInfo.email).toBe('john.doe@example.com')
  })

  it('should reject requests without a file', async () => {
    const formData = new FormData()
    // Don't append any file

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('No file provided')
  })
}) 