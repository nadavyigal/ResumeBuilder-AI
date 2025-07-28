'use client'

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  const handleRetry = () => {
    // Global error boundaries don't get a reset function
    // The only way to recover is to reload the page
    window.location.reload()
  }

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
            <p className="text-gray-600 mb-4">
              {error.message || 'A critical error occurred that requires a page reload'}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-400 mb-4">
                Error ID: {error.digest}
              </p>
            )}
            <div className="space-y-2">
              <button
                onClick={handleRetry}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
} 