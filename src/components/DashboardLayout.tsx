'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { 
  HomeIcon, 
  DocumentTextIcon, 
  UserIcon, 
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'My Resumes', href: '/resumes', icon: DocumentTextIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export default function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/')
          return
        }

        setUser(user)
      } catch (error) {
        console.error('Error loading user:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Router will handle redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-sm">
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              ResumeBuilder AI
            </Link>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const current = pathname === item.href
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={classNames(
                            current
                              ? 'bg-indigo-50 text-indigo-600'
                              : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                          )}
                        >
                          <item.icon
                            className={classNames(
                              current ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                              'h-6 w-6 shrink-0'
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900">
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="sr-only">Your profile</span>
                  <span aria-hidden="true" className="truncate">{user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="group -mx-2 flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600"
                >
                  Sign out
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white px-4 py-4 shadow-sm">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            ResumeBuilder AI
          </Link>
          <button
            onClick={handleSignOut}
            className="text-sm font-semibold text-gray-700 hover:text-red-600"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {(title || description) && (
              <div className="mb-8">
                {title && (
                  <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {description}
                  </p>
                )}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 