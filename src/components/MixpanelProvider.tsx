'use client'

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initMixpanel, mixpanel } from '@/lib/mixpanel'

function MixpanelPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      mixpanel.track('Page View', {
        url: url,
        path: pathname,
        search_params: searchParams.toString() || undefined
      })
    }
  }, [pathname, searchParams])

  return null
}

export function MixpanelProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initMixpanel()
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        <MixpanelPageView />
      </Suspense>
      {children}
    </>
  )
} 