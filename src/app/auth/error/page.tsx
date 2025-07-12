export default function AuthError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
      <p className="text-gray-600 mb-4">
        There was an error authenticating your account. Please try again.
      </p>
      <a
        href="/login"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Back to Login
      </a>
    </div>
  )
} 