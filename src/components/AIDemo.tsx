'use client'

import { useState } from 'react'
import { SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface DemoResult {
  score: number
  improvements: string[]
  keywords: string[]
}

export default function AIDemo() {
  const [demoText, setDemoText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<DemoResult | null>(null)

  const sampleResume = `John Smith
Software Engineer
Experience: Built web applications with React and Node.js
Education: Computer Science degree`

  const runDemo = async (text: string = demoText || sampleResume) => {
    setAnalyzing(true)
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockResult: DemoResult = {
        score: 73,
        improvements: [
          'Add quantifiable achievements (e.g., "Increased performance by 40%")',
          'Include relevant keywords: TypeScript, AWS, microservices',
          'Strengthen impact statements with action verbs',
          'Add technical certifications or projects'
        ],
        keywords: ['React', 'Node.js', 'JavaScript', 'Full-stack', 'Web Development']
      }
      setResult(mockResult)
      setAnalyzing(false)
    }, 2000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Try Our AI Resume Analyzer
          </h3>
          <p className="text-gray-600">
            See how our AI analyzes and improves resumes in real-time
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste your resume or try our sample:
            </label>
            <textarea
              value={demoText}
              onChange={(e) => setDemoText(e.target.value)}
              placeholder={sampleResume}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => runDemo()}
                disabled={analyzing}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Analyze Resume
                  </>
                )}
              </button>
              <button
                onClick={() => setDemoText(sampleResume)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Use Sample
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            {!result && !analyzing && (
              <div className="text-center text-gray-500 py-8">
                <SparklesIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Click "Analyze Resume" to see AI insights</p>
              </div>
            )}

            {analyzing && (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">AI is analyzing your resume...</p>
                <p className="text-sm text-gray-500 mt-2">Checking ATS compatibility, keyword optimization, and impact statements</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Score */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {result.score}%
                  </div>
                  <p className="text-sm text-gray-600">Resume Optimization Score</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${result.score}%` }}
                    />
                  </div>
                </div>

                {/* Keywords Found */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                    Keywords Found
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {result.keywords.map((keyword, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Improvements */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    AI Suggestions ({result.improvements.length})
                  </h4>
                  <ul className="space-y-2">
                    {result.improvements.slice(0, 3).map((improvement, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0" />
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center">
                    This is a demo. Sign up for full AI analysis and optimization.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}