'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/DashboardLayout'
import { DocumentTextIcon, SparklesIcon, ViewColumnsIcon, ChartBarIcon } from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalResumes: 0,
    lastUpdated: null as Date | null,
  })

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        setUser(user)

        // Load user statistics
        const { data: resumes } = await supabase
          .from('resumes')
          .select('id, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })

        if (resumes) {
          setStats({
            totalResumes: resumes.length,
            lastUpdated: resumes.length > 0 ? new Date(resumes[0].updated_at) : null,
          })
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return null // Router will handle redirect
  }

  const quickActions = [
    {
      title: 'Create New Resume',
      description: 'Start building your professional resume from scratch',
      href: '/resumes/new',
      icon: DocumentTextIcon,
      color: 'bg-blue-600',
    },
    {
      title: 'My Resumes',
      description: 'View and manage your existing resumes',
      href: '/resumes',
      icon: ViewColumnsIcon,
      color: 'bg-green-600',
    },
    {
      title: 'AI Optimizer',
      description: 'Optimize your resume for specific job postings',
      href: '/optimize',
      icon: SparklesIcon,
      color: 'bg-purple-600',
    },
    {
      title: 'Templates',
      description: 'Browse professional resume templates',
      href: '/templates',
      icon: ChartBarIcon,
      color: 'bg-orange-600',
    },
  ]

  return (
    <DashboardLayout 
      title={`Welcome back!`}
      description="Here's what you can do today"
    >
      {/* Stats Section */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-gray-600">Total Resumes</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalResumes}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm font-medium text-gray-600">Last Updated</p>
          <p className="mt-2 text-lg font-semibold text-gray-900">
            {stats.lastUpdated ? stats.lastUpdated.toLocaleDateString() : 'Never'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group relative rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex rounded-lg p-3 ${action.color}`}>
              <action.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
              {action.title}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {action.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      {stats.totalResumes > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Get Started</h2>
          <div className="bg-blue-50 rounded-lg p-6">
            <p className="text-sm text-blue-900">
              You have {stats.totalResumes} resume{stats.totalResumes !== 1 ? 's' : ''}. 
              {' '}Keep your resumes updated to increase your chances of landing your dream job!
            </p>
          <Link
            href="/resumes"
              className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all resumes →
          </Link>
        </div>
        </div>
      )}
    </DashboardLayout>
  )
} 