'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { supabase } from '@/lib/supabase'
import { getProfile } from '@/lib/db'
import { ProfileForm } from '@/components/ProfileForm'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUserAndProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        setUser(user)
        const profile = await getProfile(user.id)
        setProfile(profile)
      } catch (error) {
        console.error('Error loading user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserAndProfile()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2F80ED] border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Router will handle redirect
  }

  return (
    <div className="min-h-[calc(100vh-64px-80px)] bg-[#FAFAFA] py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="mb-6 text-2xl font-bold text-[#1A1A1A]">Profile Settings</h1>
            <ProfileForm user={user} profile={profile} />
          </div>
        </div>

        {/* Account Settings */}
        <div className="mt-6 bg-white shadow-sm rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Account Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Account Created</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={async () => {
                    await supabase.auth.signOut()
                    router.push('/')
                  }}
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Status (Placeholder) */}
        <div className="mt-6 bg-white shadow-sm rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Subscription</h2>
            
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-[#2F80ED]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-[#2F80ED]">Free Plan</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>You're currently on the free plan. Upgrade to unlock premium features!</p>
                  </div>
                  <div className="mt-4">
                    <button className="inline-flex items-center justify-center rounded-md bg-[#2F80ED] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 transition-colors">
                      Upgrade to Premium
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 