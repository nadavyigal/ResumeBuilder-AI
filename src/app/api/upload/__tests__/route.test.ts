import { NextRequest, NextResponse } from 'next/server'
import { POST } from '../route'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn()
}))

vi.mock('@/lib/auth-middleware', () => ({
  withAuth: vi.fn((handler) => handler)
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    getAll: () => [],
    set: vi.fn()
  }))
}))

vi.mock('mammoth', () => ({
  default: {
    extractRawText: vi.fn()
  }
}))

vi.mock('pdf-parse', () => ({
  default: vi.fn()
}))

// Mock fs operations
vi.mock('fs/promises', () => ({
  default: {
    writeFile: vi.fn(),
    unlink: vi.fn()
  },
  writeFile: vi.fn(),
  unlink: vi.fn()
}))

vi.mock('fs', () => ({
  default: {
    createReadStream: vi.fn()
  },
  createReadStream: vi.fn()
}))

vi.mock('stream/promises', () => ({
  pipeline: vi.fn()
}))

vi.mock('worker_threads', () => ({
  Worker: vi.fn()
}))

vi.mock('os', () => ({
  default: {
    tmpdir: vi.fn(() => '/tmp')
  },
  tmpdir: vi.fn(() => '/tmp')
}))

vi.mock('path', () => ({
  default: {
    join: vi.fn((...paths) => paths.join('/'))
  },
  join: vi.fn((...paths) => paths.join('/'))
}))

vi.mock('crypto', () => ({
  default: {
    randomUUID: vi.fn(() => 'test-uuid')
  },
  randomUUID: vi.fn(() => 'test-uuid')
}))

describe('Upload API Route', () => {
  const mockUser = { id: 'test-user-id' }
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn()
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    const { createClient } = await import('@/utils/supabase/server')
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    
    // Mock withAuth to simulate authenticated user
    const { withAuth } = await import('@/lib/auth-middleware')
    vi.mocked(withAuth).mockImplementation((handler) => {
      return async (request: NextRequest) => {
        return handler(request, mockUser)
      }
    })
  })

  it('should reject unauthenticated requests', async () => {
    // Mock withAuth to simulate unauthenticated user
    const { withAuth } = await import('@/lib/auth-middleware')
    vi.mocked(withAuth).mockImplementation(() => {
      return async () => {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
    })

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
    expect(data.error).toBe('Please upload a DOCX or PDF file.')
  })

  it('should successfully process and store a valid DOCX file', async () => {
    // Mock successful Supabase insert
    mockSupabase.single.mockResolvedValue({
      data: { id: 'test-resume-id' },
      error: null
    })

    // Mock mammoth extraction
    const mammoth = await import('mammoth')
    vi.mocked(mammoth.default.extractRawText).mockResolvedValue({
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
    expect(data.data).toHaveProperty('personalInfo')
    expect(data.data).toHaveProperty('experience')
    expect(data.data).toHaveProperty('education')
    expect(data.data).toHaveProperty('skills')
  })

  it('should handle Supabase storage errors', async () => {
    // Mock mammoth extraction
    const mammoth = await import('mammoth')
    vi.mocked(mammoth.default.extractRawText).mockResolvedValue({
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
    expect(data.error).toBe('Failed to store resume data.')
  })
}) 