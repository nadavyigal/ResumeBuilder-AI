import { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { POST } from '../route'
import mammoth from 'mammoth'

// Mock dependencies
jest.mock('@supabase/auth-helpers-nextjs')
jest.mock('next/headers', () => ({
  cookies: () => ({
    getAll: () => []
  })
}))
jest.mock('mammoth')

describe('Upload API Route', () => {
  const mockUser = { id: 'test-user-id' }
  const mockSupabase = {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase)
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
  })

  it('should reject unauthenticated requests', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: 'Not authenticated' })

    const request = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: new FormData()
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Authentication required')
  })

  it('should reject requests without a file', async () => {
    const request = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: new FormData()
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('No file provided')
  })

  it('should reject unsupported file types', async () => {
    const formData = new FormData()
    formData.append('file', new Blob(['test'], { type: 'text/plain' }), 'test.txt')

    const request = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: formData
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Unsupported file type')
  })

  it('should successfully process and store a valid DOCX file', async () => {
    // Mock successful Supabase insert
    mockSupabase.single.mockResolvedValue({
      data: { id: 'test-resume-id' },
      error: null
    })

    // Mock mammoth extraction
    ;(mammoth.extractRawText as jest.Mock).mockResolvedValue({
      value: 'Test resume content'
    })

    const formData = new FormData()
    formData.append(
      'file',
      new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
      'test.docx'
    )

    const request = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: formData
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('id')
    expect(data.data).toHaveProperty('parsed')
  })

  it('should handle Supabase storage errors', async () => {
    // Mock mammoth extraction
    ;(mammoth.extractRawText as jest.Mock).mockResolvedValue({
      value: 'Test resume content'
    })

    // Mock Supabase error
    mockSupabase.single.mockResolvedValue({
      data: null,
      error: new Error('Database error')
    })

    const formData = new FormData()
    formData.append(
      'file',
      new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
      'test.docx'
    )

    const request = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: formData
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to store resume data')
  })
}) 