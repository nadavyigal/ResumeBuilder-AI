'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { updateProfile } from '@/lib/db'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileFormProps {
  user: User
  profile: Profile | null
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    avatar_url: profile?.avatar_url || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      await updateProfile(user.id, formData)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <div className="mt-1">
          <input
            type="email"
            id="email"
            value={user.email}
            disabled
            className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Your email cannot be changed
        </p>
      </div>

      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="full_name"
            id="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2F80ED] focus:ring-[#2F80ED] sm:text-sm"
            placeholder="Enter your full name"
          />
        </div>
      </div>

      <div>
        <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700">
          Avatar URL
        </label>
        <div className="mt-1">
          <input
            type="url"
            name="avatar_url"
            id="avatar_url"
            value={formData.avatar_url}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2F80ED] focus:ring-[#2F80ED] sm:text-sm"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Enter a URL for your profile picture
        </p>
      </div>

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-[#27AE60]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-[#27AE60]">
                Profile updated successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-[#2F80ED] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  )
} 