export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto"></div>
        <h2 className="mt-4 text-lg font-medium text-gray-900">Loading...</h2>
        <p className="mt-2 text-sm text-gray-500">Please wait while we prepare your content.</p>
      </div>
    </div>
  )
} 