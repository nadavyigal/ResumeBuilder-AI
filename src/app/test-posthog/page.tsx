'use client'

import { usePostHog } from 'posthog-js/react'
import { useEffect, useState } from 'react'

export default function TestPostHog() {
  const posthog = usePostHog()
  const [eventsSent, setEventsSent] = useState(0)
  const [posthogLoaded, setPosthogLoaded] = useState(false)

  useEffect(() => {
    if (posthog) {
      setPosthogLoaded(true)
      // Test pageview event
      posthog.capture('test_page_loaded', {
        test_property: 'This is a test event',
        timestamp: new Date().toISOString()
      })
      setEventsSent(prev => prev + 1)
    }
  }, [posthog])

  const sendTestEvent = () => {
    if (posthog) {
      posthog.capture('test_button_clicked', {
        button_name: 'Test Event Button',
        events_sent_so_far: eventsSent
      })
      setEventsSent(prev => prev + 1)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">PostHog Test Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <p><strong>PostHog Status:</strong> {posthogLoaded ? '✅ Loaded' : '❌ Not Loaded'}</p>
          <p><strong>PostHog Instance:</strong> {posthog ? '✅ Available' : '❌ Not Available'}</p>
          <p><strong>Events Sent:</strong> {eventsSent}</p>
        </div>

        <div className="p-4 bg-blue-50 rounded">
          <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
          <p><strong>NEXT_PUBLIC_POSTHOG_KEY:</strong> {process.env.NEXT_PUBLIC_POSTHOG_KEY ? '✅ Set' : '❌ Not Set'}</p>
          <p><strong>NEXT_PUBLIC_POSTHOG_HOST:</strong> {process.env.NEXT_PUBLIC_POSTHOG_HOST || 'Using default'}</p>
        </div>

        <button
          onClick={sendTestEvent}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send Test Event
        </button>

        <div className="mt-8 p-4 bg-yellow-50 rounded">
          <h3 className="font-semibold">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Make sure your .env.local file contains NEXT_PUBLIC_POSTHOG_KEY</li>
            <li>Restart the development server after adding environment variables</li>
            <li>Click the button to send test events</li>
            <li>Check your PostHog dashboard to see the events</li>
          </ol>
        </div>
      </div>
    </div>
  )
} 