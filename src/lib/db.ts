import { supabase } from './supabase'
import { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type Resume = Database['public']['Tables']['resumes']['Row']
type ResumeInsert = Database['public']['Tables']['resumes']['Insert']
type ResumeUpdate = Database['public']['Tables']['resumes']['Update']

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (error) throw error
}

export async function getResumes(userId: string): Promise<Resume[]> {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getResume(id: string, userId: string): Promise<Resume | null> {
  console.log('🔍 getResume called with:', { id, userId })
  
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('❌ getResume error:', error)
    throw error
  }
  
  console.log('✅ getResume result:', data)
  return data
}

export async function createResume(resume: ResumeInsert): Promise<Resume> {
  const { data, error } = await supabase
    .from('resumes')
    .insert(resume)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateResume(id: string, userId: string, updates: ResumeUpdate): Promise<Resume> {
  const { data, error } = await supabase
    .from('resumes')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteResume(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw error
} 