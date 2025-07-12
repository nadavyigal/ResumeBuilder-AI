import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-gray-600 mb-4 sm:mb-0">
            © 2025 ResumeBuilder AI. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link href="/support" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              Need Help?
            </Link>
            <Link href="/terms" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
} 