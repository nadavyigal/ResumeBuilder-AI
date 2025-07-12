export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-blue max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing and using ResumeBuilder AI, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Use License</h2>
            <p className="text-gray-600 mb-4">
              Permission is granted to temporarily use ResumeBuilder AI for personal, non-commercial transitory viewing only.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Disclaimer</h2>
            <p className="text-gray-600 mb-4">
              The materials on ResumeBuilder AI are provided on an 'as is' basis. ResumeBuilder AI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Limitations</h2>
            <p className="text-gray-600 mb-4">
              In no event shall ResumeBuilder AI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use ResumeBuilder AI.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Privacy</h2>
            <p className="text-gray-600 mb-4">
              Your use of ResumeBuilder AI is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the Site and informs users of our data collection practices.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Contact Information</h2>
            <p className="text-gray-600">
              If you have any questions about these Terms of Service, please contact us at:
              <br />
              Email: legal@resumebuilder.ai
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 