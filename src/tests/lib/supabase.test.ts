import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { supabase, getServiceClient } from '@/lib/supabase'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { Database } from '@/types/supabase'

describe('Supabase Integration Tests', () => {
  describe('Client Initialization', () => {
    it('should initialize supabase client with correct env vars', () => {
      expect(supabase).toBeDefined()
      expect(supabase.auth).toBeDefined()
      expect(supabase.from('profiles')).toBeDefined()
    })

    it('should initialize browser client with correct env vars', () => {
      expect(supabaseBrowser).toBeDefined()
      expect(supabaseBrowser.auth).toBeDefined()
    })

    it('should initialize service client with role key', async () => {
      const serviceClient = await getServiceClient()
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
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      })
      expect(error).toBeNull()
      expect(data.user).toBeDefined()
      expect(data.user?.email).toBe(testEmail)
    })

    it('should sign in an existing user', async () => {
      // First create the user
      await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      })

      // Then try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      })
      expect(error).toBeNull()
      expect(data.user).toBeDefined()
      expect(data.session).toBeDefined()
    })

    it('should handle session refresh', async () => {
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      })

      const { data, error } = await supabase.auth.refreshSession()
      expect(error).toBeNull()
      expect(data.session?.access_token).toBeDefined()
      expect(data.session?.access_token).not.toBe(signInData.session?.access_token)
    })
  })

  describe('Database Operations', () => {
    let userId: string

    beforeEach(async () => {
      // Create a test user and get their ID
      const { data } = await supabase.auth.signUp({
        email: `test-${Date.now()}@example.com`,
        password: 'Test123!@#',
      })
      userId = data.user!.id
    })

    it('should create a profile', async () => {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: 'test@example.com',
          full_name: 'Test User',
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.id).toBe(userId)
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

      // Insert resume
      const { data: insertData, error: insertError } = await supabase
        .from('resumes')
        .insert(resumeData)
        .select()
        .single()

      expect(insertError).toBeNull()
      expect(insertData).toBeDefined()
      expect(insertData.title).toBe('Test Resume')

      // Retrieve resume
      const { data: retrieveData, error: retrieveError } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', insertData.id)
        .single()

      expect(retrieveError).toBeNull()
      expect(retrieveData).toBeDefined()
      expect(retrieveData.title).toBe('Test Resume')
    })
  })

  describe('RLS Policies', () => {
    let user1Id: string
    let user2Id: string
    let resumeId: string

    beforeEach(async () => {
      // Create two test users
      const { data: user1 } = await supabase.auth.signUp({
        email: `test1-${Date.now()}@example.com`,
        password: 'Test123!@#',
      })
      user1Id = user1.user!.id

      const { data: user2 } = await supabase.auth.signUp({
        email: `test2-${Date.now()}@example.com`,
        password: 'Test123!@#',
      })
      user2Id = user2.user!.id

      // Create a resume for user1
      const { data: resume } = await supabase
        .from('resumes')
        .insert({
          user_id: user1Id,
          title: 'Test Resume',
          content: { test: 'data' },
          is_public: false,
        })
        .select()
        .single()

      resumeId = resume!.id
    })

    it('should prevent unauthorized access to private resumes', async () => {
      // Sign in as user2
      await supabase.auth.signInWithPassword({
        email: `test2-${Date.now()}@example.com`,
        password: 'Test123!@#',
      })

      // Try to access user1's private resume
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .single()

      expect(error).toBeDefined()
      expect(data).toBeNull()
    })

    it('should allow access to public resumes', async () => {
      // Make the resume public
      await supabase
        .from('resumes')
        .update({ is_public: true })
        .eq('id', resumeId)

      // Sign in as user2
      await supabase.auth.signInWithPassword({
        email: `test2-${Date.now()}@example.com`,
        password: 'Test123!@#',
      })

      // Try to access the now-public resume
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.id).toBe(resumeId)
    })
  })
}) 