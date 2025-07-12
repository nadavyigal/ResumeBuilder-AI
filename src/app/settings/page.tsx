'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/DashboardLayout'
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
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-2 text-sm text-gray-600">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout 
      title="Settings" 
      description="Manage your account settings and preferences"
    >
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
                <h3 className="text-lg font-medium text-gray-900">{section.name}</h3>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Account Info</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Email</span>
            <span className="text-sm font-medium text-gray-900">{user.email}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Account Type</span>
            <span className="text-sm font-medium text-gray-900">Free</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Member Since</span>
            <span className="text-sm font-medium text-gray-900">
              {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <Link
          href="/profile"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
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
    </DashboardLayout>
  )
} 