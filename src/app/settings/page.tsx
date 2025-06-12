'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { 
  BellIcon, 
  KeyIcon, 
  UserCircleIcon, 
  CreditCardIcon,
  ShieldCheckIcon,
  CogIcon
} from '@heroicons/react/24/outline'

const settingsSections = [
  {
    name: 'Account',
    description: 'Manage your account settings and preferences',
    icon: UserCircleIcon,
    status: 'Coming Soon'
  },
  {
    name: 'Notifications',
    description: 'Configure how you receive notifications',
    icon: BellIcon,
    status: 'Coming Soon'
  },
  {
    name: 'Security',
    description: 'Update your password and security settings',
    icon: KeyIcon,
    status: 'Coming Soon'
  },
  {
    name: 'Billing',
    description: 'Manage your subscription and payment methods',
    icon: CreditCardIcon,
    status: 'Coming Soon'
  },
  {
    name: 'Privacy',
    description: 'Control your data and privacy preferences',
    icon: ShieldCheckIcon,
    status: 'Coming Soon'
  },
  {
    name: 'Advanced',
    description: 'Advanced settings and configurations',
    icon: CogIcon,
    status: 'Coming Soon'
  }
]

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        setUser(user)
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2F80ED] border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-[calc(100vh-64px-80px)] bg-[#FAFAFA] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Settings</h1>
          <p className="mt-2 text-base text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {settingsSections.map((section) => (
            <div
              key={section.name}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <section.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-lg font-medium text-[#1A1A1A]">{section.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">{section.description}</p>
                  <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {section.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current Settings Info */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Current Account Info</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Email</span>
              <span className="text-sm font-medium text-[#1A1A1A]">{user.email}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Account Type</span>
              <span className="text-sm font-medium text-[#1A1A1A]">Free</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Member Since</span>
              <span className="text-sm font-medium text-[#1A1A1A]">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <Link
            href="/profile"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2F80ED] hover:bg-blue-600 transition-colors"
          >
            Go to Profile
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
} 