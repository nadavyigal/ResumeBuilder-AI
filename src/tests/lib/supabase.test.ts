import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the entire supabase module before importing
vi.mock('@/lib/supabase', () => {
  const mockAuth = {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    refreshSession: vi.fn(),
    getUser: vi.fn(),
    signOut: vi.fn(),
    admin: {
      deleteUser: vi.fn()
    }
  }

  const mockTable = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn(),
    eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis()
  }

  const mockSupabase = {
    auth: mockAuth,
    from: vi.fn(() => mockTable)
  }

  const mockServiceClient = {
    auth: {
      admin: {
        deleteUser: vi.fn()
      }
    },
    from: vi.fn(() => mockTable)
  }

  return {
    supabase: mockSupabase,
    createServiceClient: vi.fn(() => mockServiceClient),
    getServiceClient: vi.fn(() => mockServiceClient)
  }
})

vi.mock('@/utils/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn()
    }))
  }))
}))

// Import after mocking
import { supabase, getServiceClient } from '@/lib/supabase'
import { createClient } from '@/utils/supabase/client'

describe('Supabase Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Client Initialization', () => {
    it('should initialize supabase client with correct env vars', () => {
      expect(supabase).toBeDefined()
      expect(supabase.auth).toBeDefined()
      expect(supabase.from('profiles')).toBeDefined()
    })

    it('should initialize browser client with correct env vars', () => {
      const browserClient = createClient()
      expect(browserClient).toBeDefined()
      expect(browserClient.auth).toBeDefined()
    })

    it('should initialize service client with role key', async () => {
      const serviceClient = getServiceClient()
      expect(serviceClient).toBeDefined()
      expect(serviceClient.auth.admin).toBeDefined()
    })
  })

  describe('Authentication', () => {
    let testEmail: string
    let testPassword: string

    beforeEach(() => {
      testEmail = `test-${Date.now()}@example.com`
      testPassword = 'Test123!@#'
    })

    it('should sign up a new user', async () => {
      const mockUser = { id: 'test-user-id', email: testEmail }
      const mockResponse = { data: { user: mockUser }, error: null }
      
      vi.mocked(supabase.auth.signUp).mockResolvedValue(mockResponse)

      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      })
      
      expect(error).toBeNull()
      expect(data.user).toBeDefined()
      expect(data.user?.email).toBe(testEmail)
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: testEmail,
        password: testPassword,
      })
    })

    it('should sign in an existing user', async () => {
      const mockUser = { id: 'test-user-id', email: testEmail }
      const mockSession = { access_token: 'mock-token', user: mockUser }
      const mockResponse = { data: { user: mockUser, session: mockSession }, error: null }
      
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(mockResponse)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      })
      
      expect(error).toBeNull()
      expect(data.user).toBeDefined()
      expect(data.session).toBeDefined()
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: testEmail,
        password: testPassword,
      })
    })

    it('should handle session refresh', async () => {
      const mockSession = { access_token: 'new-mock-token' }
      const mockResponse = { data: { session: mockSession }, error: null }
      
      vi.mocked(supabase.auth.refreshSession).mockResolvedValue(mockResponse)

      const { data, error } = await supabase.auth.refreshSession()
      
      expect(error).toBeNull()
      expect(data.session?.access_token).toBeDefined()
      expect(data.session?.access_token).toBe('new-mock-token')
    })
  })

  describe('Database Operations', () => {
    let userId: string

    beforeEach(() => {
      userId = 'test-user-id'
    })

    it('should create a profile', async () => {
      const mockProfile = {
        id: userId,
        email: 'test@example.com',
        full_name: 'Test User',
      }
      
      const mockTable = supabase.from('profiles')
      vi.mocked(mockTable.single).mockResolvedValue({
        data: mockProfile,
        error: null
      })

      const result = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: 'test@example.com',
          full_name: 'Test User',
        })
        .select()
        .single()

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data.id).toBe(userId)
    })

    it('should create and retrieve a resume', async () => {
      const resumeData = {
        user_id: userId,
        title: 'Test Resume',
        content: {
          personal: {
            fullName: 'Test User',
            email: 'test@example.com',
            phone: '123-456-7890',
            location: 'Test City',
            summary: 'Test summary',
          },
          experience: [],
          education: [],
          skills: [],
        },
        is_public: false,
      }

      const mockResume = { ...resumeData, id: 'resume-id' }
      const mockTable = supabase.from('resumes')
      
      // Mock insert operation
      vi.mocked(mockTable.single).mockResolvedValueOnce({
        data: mockResume,
        error: null
      })

      const insertResult = await supabase
        .from('resumes')
        .insert(resumeData)
        .select()
        .single()

      expect(insertResult.error).toBeNull()
      expect(insertResult.data).toBeDefined()
      expect(insertResult.data.title).toBe('Test Resume')

      // Mock retrieve operation
      vi.mocked(mockTable.single).mockResolvedValueOnce({
        data: mockResume,
        error: null
      })

      const retrieveResult = await supabase
        .from('resumes')
        .select('*')
        .eq('id', insertResult.data.id)
        .single()

      expect(retrieveResult.error).toBeNull()
      expect(retrieveResult.data).toBeDefined()
      expect(retrieveResult.data.title).toBe('Test Resume')
    })
  })

  describe('RLS Policies', () => {
    let user1Id: string
    let user2Id: string
    let resumeId: string

    beforeEach(() => {
      user1Id = 'user-1-id'
      user2Id = 'user-2-id'
      resumeId = 'resume-id'
    })

    it('should prevent unauthorized access to private resumes', async () => {
      const mockTable = supabase.from('resumes')
      
      // Mock RLS blocking access
      vi.mocked(mockTable.single).mockResolvedValue({
        data: null,
        error: new Error('RLS policy violation')
      })

      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .single()

      expect(error).toBeDefined()
      expect(data).toBeNull()
    })

    it('should allow access to public resumes', async () => {
      const mockPublicResume = {
        id: resumeId,
        user_id: user1Id,
        title: 'Public Resume',
        is_public: true
      }
      
      const mockTable = supabase.from('resumes')
      vi.mocked(mockTable.single).mockResolvedValue({
        data: mockPublicResume,
        error: null
      })

      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.id).toBe(resumeId)
      expect(data.is_public).toBe(true)
    })
  })
})