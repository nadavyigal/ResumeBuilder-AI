'use client'

import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'

interface Step {
  id: string
  name: string
  description?: string
  status: 'completed' | 'current' | 'upcoming'
}

interface ProgressTrackerProps {
  steps: Step[]
  className?: string
}

export default function ProgressTracker({ steps, className = '' }: ProgressTrackerProps) {
  return (
    <nav aria-label="Progress" className={className}>
      <ol className="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className="relative md:flex md:flex-1">
            <div className="group flex w-full items-center">
              <span className="flex items-center px-6 py-4 text-sm font-medium">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                  {step.status === 'completed' ? (
                    <CheckCircleSolid className="h-6 w-6 text-green-600" aria-hidden="true" />
                  ) : step.status === 'current' ? (
                    <span className="h-6 w-6 rounded-full border-2 border-blue-600 bg-white flex items-center justify-center">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    </span>
                  ) : (
                    <ClockIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  )}
                </span>
                <span className="ml-4 min-w-0 flex flex-col">
                  <span
                    className={`text-sm font-medium ${
                      step.status === 'completed'
                        ? 'text-green-600'
                        : step.status === 'current'
                        ? 'text-blue-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </span>
                  {step.description && (
                    <span className="text-sm text-gray-500">{step.description}</span>
                  )}
                </span>
              </span>
            </div>

            {stepIdx !== steps.length - 1 ? (
              <>
                {/* Arrow separator for lg screens and up */}
                <div className="absolute right-0 top-0 hidden h-full w-5 md:block" aria-hidden="true">
                  <svg
                    className="h-full w-full text-gray-300"
                    viewBox="0 0 22 80"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="m0 72 8 8 8-8V8l-8-8-8 8v64z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function useProgressTracker(totalSteps: string[]) {
  const [currentStep, setCurrentStep] = useState(0)
  
  const steps = totalSteps.map((name, index) => ({
    id: `step-${index + 1}`,
    name,
    status: index < currentStep ? 'completed' : index === currentStep ? 'current' : 'upcoming'
  })) as Step[]

  return {
    steps,
    currentStep,
    setCurrentStep,
    nextStep: () => setCurrentStep(prev => Math.min(prev + 1, totalSteps.length - 1)),
    prevStep: () => setCurrentStep(prev => Math.max(prev - 1, 0)),
    isComplete: currentStep >= totalSteps.length - 1
  }
}

// Import useState for the hook
import { useState } from 'react'