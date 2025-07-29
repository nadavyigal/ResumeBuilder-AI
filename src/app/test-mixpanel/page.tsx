'use client'

import { useEffect, useState } from 'react'
import { mixpanel } from '@/lib/mixpanel'
import { env } from '@/lib/env'

export default function TestMixpanel() {
  const [eventsSent, setEventsSent] = useState(0)
  const [mixpanelLoaded, setMixpanelLoaded] = useState(false)

  useEffect(() => {
    // Check if Mixpanel is loaded and initialized
    if (mixpanel && typeof mixpanel.get_distinct_id === 'function') {
      setMixpanelLoaded(true)
      // Test pageview event
      mixpanel.track('Test Page Loaded', {
        test_property: 'This is a test event',
        timestamp: new Date().toISOString()
      })
      setEventsSent(prev => prev + 1)
    }
  }, [])

  const sendTestEvent = () => {
    if (mixpanel) {
      mixpanel.track('Test Button Clicked', {
        button_name: 'Test Event Button',
        events_sent_so_far: eventsSent
      })
      setEventsSent(prev => prev + 1)
    }
  }

  const identifyUser = () => {
    if (mixpanel) {
      mixpanel.identify('test-user-123')
      mixpanel.people.set({
        $name: 'Test User',
        $email: 'test@example.com',
        plan: 'free'
      })
    }
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Mixpanel Test Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <p><strong>Mixpanel Status:</strong> {mixpanelLoaded ? '✅ Loaded' : '❌ Not Loaded'}</p>
          <p><strong>Mixpanel Instance:</strong> {mixpanel ? '✅ Available' : '❌ Not Available'}</p>
          <p><strong>Events Sent:</strong> {eventsSent}</p>
        </div>

        <div className="p-4 bg-blue-50 rounded">
          <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
          <p><strong>NEXT_PUBLIC_MIXPANEL_TOKEN:</strong> {env.NEXT_PUBLIC_MIXPANEL_TOKEN ? '✅ Set' : '❌ Not Set'}</p>
        </div>

        <div className="space-x-4">
          <button
            onClick={sendTestEvent}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Send Test Event
          </button>

          <button
            onClick={identifyUser}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Identify Test User
          </button>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 rounded">
          <h3 className="font-semibold">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Make sure your .env.local file contains NEXT_PUBLIC_MIXPANEL_TOKEN</li>
            <li>Restart the development server after adding environment variables</li>
            <li>Click the buttons to send test events</li>
            <li>Check your Mixpanel dashboard to see the events</li>
          </ol>
        </div>
      </div>
    </div>
  )
} 