'use client'

import { useState, useEffect } from 'react'
import { ChartBarIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

interface ScoreMetric {
  name: string
  score: number
  maxScore: number
  status: 'excellent' | 'good' | 'needs-improvement' | 'poor'
  suggestions: string[]
}

interface ResumeScore {
  overall: number
  metrics: ScoreMetric[]
  recommendations: string[]
}

interface ResumeScoreCardProps {
  resumeContent?: string
  jobDescription?: string
  className?: string
}

export default function ResumeScoreCard({ 
  resumeContent = '', 
  jobDescription = '', 
  className = '' 
}: ResumeScoreCardProps) {
  const [score, setScore] = useState<ResumeScore | null>(null)
  const [loading, setLoading] = useState(false)

  // Mock scoring logic - replace with actual API call
  const calculateScore = (resume: string, job: string): ResumeScore => {
    const hasKeywords = resume.toLowerCase().includes('react') || resume.toLowerCase().includes('javascript')
    const hasQuantifiableResults = /\d+%|\$\d+|increased|improved|reduced/i.test(resume)
    const hasActionVerbs = /\b(managed|developed|implemented|created|led|optimized)\b/i.test(resume)
    const hasEducation = /education|degree|university|college/i.test(resume)
    const hasContactInfo = /@/.test(resume) // Basic email check

    const metrics: ScoreMetric[] = [
      {
        name: 'Keyword Optimization',
        score: hasKeywords ? 85 : 45,
        maxScore: 100,
        status: hasKeywords ? 'good' : 'needs-improvement',
        suggestions: hasKeywords 
          ? ['Great keyword usage! Consider adding more industry-specific terms.']
          : ['Add relevant keywords from the job description', 'Include technical skills and tools']
      },
      {
        name: 'Quantifiable Results',
        score: hasQuantifiableResults ? 90 : 30,
        maxScore: 100,
        status: hasQuantifiableResults ? 'excellent' : 'poor',
        suggestions: hasQuantifiableResults
          ? ['Excellent use of metrics and numbers!']
          : ['Add specific numbers and percentages', 'Quantify your achievements with data']
      },
      {
        name: 'Action-Oriented Language',
        score: hasActionVerbs ? 80 : 50,
        maxScore: 100,
        status: hasActionVerbs ? 'good' : 'needs-improvement',
        suggestions: hasActionVerbs
          ? ['Good use of action verbs. Consider varying them more.']
          : ['Start bullet points with strong action verbs', 'Use words like "achieved", "spearheaded", "optimized"']
      },
      {
        name: 'Professional Completeness',
        score: (hasEducation ? 30 : 0) + (hasContactInfo ? 30 : 0) + 40,
        maxScore: 100,
        status: (hasEducation && hasContactInfo) ? 'excellent' : 'needs-improvement',
        suggestions: [
          ...(hasEducation ? [] : ['Add education section']),
          ...(hasContactInfo ? [] : ['Include professional email address']),
          'Ensure all sections are complete'
        ]
      }
    ]

    const overall = Math.round(metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length)

    return {
      overall,
      metrics,
      recommendations: [
        overall < 60 ? 'Your resume needs significant improvements to compete effectively' : '',
        overall >= 60 && overall < 80 ? 'Good foundation! Focus on the highlighted areas for improvement' : '',
        overall >= 80 ? 'Strong resume! Fine-tune the remaining areas for maximum impact' : ''
      ].filter(Boolean)
    }
  }

  useEffect(() => {
    if (resumeContent) {
      setLoading(true)
      // Simulate API delay
      setTimeout(() => {
        const newScore = calculateScore(resumeContent, jobDescription)
        setScore(newScore)
        setLoading(false)
      }, 1000)
    }
  }, [resumeContent, jobDescription])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-600'
    if (score >= 60) return 'bg-yellow-600'
    return 'bg-red-600'
  }

  const getStatusIcon = (status: ScoreMetric['status']) => {
    switch (status) {
      case 'excellent':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'good':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />
      case 'needs-improvement':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'poor':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
    }
  }

  if (!resumeContent) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <ChartBarIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Add content to see your resume score</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2" />
          Resume Score
        </h3>
        {loading && (
          <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Analyzing your resume...</p>
        </div>
      ) : score && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${getScoreColor(score.overall)}`}>
              {score.overall}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ${getScoreBgColor(score.overall)}`}
                style={{ width: `${score.overall}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {score.recommendations[0]}
            </p>
          </div>

          {/* Metrics Breakdown */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Detailed Analysis</h4>
            {score.metrics.map((metric, index) => (
              <div key={index} className="border-l-4 border-gray-100 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {getStatusIcon(metric.status)}
                    <span className="ml-2 font-medium text-gray-900">{metric.name}</span>
                  </div>
                  <span className={`font-semibold ${getScoreColor(metric.score)}`}>
                    {metric.score}/{metric.maxScore}
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-700 ${getScoreBgColor(metric.score)}`}
                    style={{ width: `${(metric.score / metric.maxScore) * 100}%` }}
                  />
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  {metric.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start">
                      <InformationCircleIcon className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 opacity-60" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Action Items */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="font-medium text-gray-900 mb-2">Priority Actions</h4>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Focus on improving your lowest-scoring areas first for maximum impact.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}