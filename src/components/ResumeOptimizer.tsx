'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { DocumentTextIcon, BriefcaseIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { createClient } from '@/utils/supabase/client';
import Toast from './Toast';
import JobUrlInput from './JobUrlInput';

// Lazy load heavy components
const OptimizeFromResume = dynamic(() => import('./OptimizeFromResume'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded-md"></div>,
  ssr: false
});

interface OptimizationResult {
  optimizedContent: string;
  analysis: {
    keywords: string[];
    relevantSections: string[];
    relevanceScore: number;
    skillRequirements?: {
      required: string[];
      preferred: string[];
      experience: string[];
    };
    suggestions: string[];
  };
}

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

const ResumeOptimizer = memo(() => {
  const searchParams = useSearchParams();
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobMetadata, setJobMetadata] = useState<{
    title?: string;
    company?: string;
    location?: string;
    source?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'result'>('input');
  const [showResumeSelector, setShowResumeSelector] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  // Memoize expensive calculations
  const isFormValid = useMemo(() => 
    resume.trim().length > 0 && jobDescription.trim().length > 0, 
    [resume, jobDescription]
  );

  const characterLimits = useMemo(() => ({
    resume: { current: resume.length, max: 10000 },
    jobDescription: { current: jobDescription.length, max: 5000 }
  }), [resume.length, jobDescription.length]);

  // Load user effect
  useEffect(() => {
    let mounted = true;
    
    async function loadUser() {
      try {
        const { data: { user } } = await createClient().auth.getUser();
        if (mounted) setUser(user);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    }
    
    loadUser();
    return () => { mounted = false; };
  }, []);

  // Load resume from URL params effect
  useEffect(() => {
    const resumeId = searchParams.get('resumeId');
    if (resumeId) {
      loadResume(resumeId);
    }
  }, [searchParams]);

  const loadResume = useCallback(async (resumeId: string) => {
    try {
      const { data, error } = await createClient()
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .single();

      if (error) throw error;

      if (data) {
        const resumeText = typeof data.content === 'string' 
          ? data.content 
          : JSON.stringify(data.content, null, 2);
        setResume(resumeText);
      }
    } catch (error) {
      console.error('Error loading resume:', error);
      setError('Failed to load resume');
    }
  }, []);

  const handleOptimize = useCallback(async () => {
    if (!isFormValid) {
      setError('Please provide both resume and job description');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use AbortController for request cancellation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume: resume.trim(),
          jobDescription: jobDescription.trim(),
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to optimize resume');
      }

      setResult(data);
      setActiveTab('result');
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Request timed out. Please try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isFormValid, resume, jobDescription]);

  const handleCopyOptimized = useCallback(() => {
    if (result?.optimizedContent) {
      navigator.clipboard.writeText(result.optimizedContent);
      setToast({ message: 'Resume copied to clipboard!', type: 'success' });
    }
  }, [result?.optimizedContent]);

  const handleResumeSelect = useCallback((text: string) => {
    setResume(text);
    setShowResumeSelector(false);
  }, []);

  const handleTabChange = useCallback((tab: 'input' | 'result') => {
    setActiveTab(tab);
  }, []);

  const handleToastClose = useCallback(() => {
    setToast(null);
  }, []);

  const handleJobDescriptionExtracted = useCallback((description: string, metadata?: {
    title?: string;
    company?: string;
    location?: string;
    source?: string;
  }) => {
    setJobDescription(description);
    setJobMetadata(metadata || null);
    setError(null);
  }, []);

  // Memoized components
  const TabNavigation = useMemo(() => (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => handleTabChange('input')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'input'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Input
        </button>
        <button
          onClick={() => handleTabChange('result')}
          disabled={!result}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'result'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } ${!result ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Results
        </button>
      </nav>
    </div>
  ), [activeTab, result, handleTabChange]);

  const ErrorMessage = useMemo(() => error ? (
    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
      <div className="flex">
        <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
        <div className="ml-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    </div>
  ) : null, [error]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleToastClose}
        />
      )}
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Resume Optimizer</h1>
        <p className="mt-2 text-gray-600">
          Optimize your resume for specific job descriptions using AI
        </p>
      </div>

      {TabNavigation}
      {ErrorMessage}

      {activeTab === 'input' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resume Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                <DocumentTextIcon className="inline h-5 w-5 mr-1" />
                Your Resume
              </label>
              {user && (
                <button
                  onClick={() => setShowResumeSelector(!showResumeSelector)}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  {showResumeSelector ? 'Hide' : 'Select from'} existing resumes
                </button>
              )}
            </div>
            
            {showResumeSelector && user ? (
              <OptimizeFromResume
                userId={user.id}
                onResumeSelect={handleResumeSelect}
              />
            ) : (
              <>
                <textarea
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  placeholder="Paste your resume here..."
                  className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  maxLength={characterLimits.resume.max}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {characterLimits.resume.current}/{characterLimits.resume.max} characters
                </p>
              </>
            )}
          </div>

          {/* Job Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BriefcaseIcon className="inline h-5 w-5 mr-1" />
              Job Description
            </label>
            
            {/* Job URL Input */}
            <JobUrlInput 
              onJobDescriptionExtracted={handleJobDescriptionExtracted}
              className="mb-4"
            />
            
            {/* Job Metadata Display */}
            {jobMetadata && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Job Information</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  {jobMetadata.title && <p><strong>Title:</strong> {jobMetadata.title}</p>}
                  {jobMetadata.company && <p><strong>Company:</strong> {jobMetadata.company}</p>}
                  {jobMetadata.location && <p><strong>Location:</strong> {jobMetadata.location}</p>}
                  {jobMetadata.source && <p><strong>Source:</strong> {jobMetadata.source}</p>}
                </div>
              </div>
            )}
            
            {/* Manual Input Option */}
            <div className="mb-2">
              <label className="text-sm text-gray-600">
                Or paste job description manually:
              </label>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here or use the URL extractor above..."
              className="w-full h-72 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              maxLength={characterLimits.jobDescription.max}
            />
            <p className="mt-1 text-sm text-gray-500">
              {characterLimits.jobDescription.current}/{characterLimits.jobDescription.max} characters
            </p>
          </div>
        </div>
      )}

      {activeTab === 'result' && result && (
        <ResultsSection result={result} onCopyOptimized={handleCopyOptimized} />
      )}

      {/* Action Buttons */}
      {activeTab === 'input' && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleOptimize}
            disabled={isLoading || !isFormValid}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              isLoading || !isFormValid
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Optimizing...
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5 mr-2" />
                Optimize Resume
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
});

// Separate memoized results component
const ResultsSection = memo(({ result, onCopyOptimized }: {
  result: OptimizationResult;
  onCopyOptimized: () => void;
}) => (
  <div className="space-y-6">
    {/* Analysis Summary */}
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Analysis Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded p-4">
          <p className="text-sm text-gray-600">Relevance Score</p>
          <p className="text-2xl font-bold text-indigo-600">
            {result.analysis.relevanceScore || 'N/A'}%
          </p>
        </div>
        <div className="bg-gray-50 rounded p-4">
          <p className="text-sm text-gray-600">Keywords Found</p>
          <p className="text-2xl font-bold text-indigo-600">
            {result.analysis.relevantSections.length}
          </p>
        </div>
        <div className="bg-gray-50 rounded p-4">
          <p className="text-sm text-gray-600">Total Keywords</p>
          <p className="text-2xl font-bold text-indigo-600">
            {result.analysis.keywords.length}
          </p>
        </div>
      </div>
    </div>

    {/* Keywords */}
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Keywords Analysis</h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Job Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {result.analysis.keywords.map((keyword, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  result.analysis.relevantSections.includes(keyword)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {keyword}
                {result.analysis.relevantSections.includes(keyword) && (
                  <CheckCircleIcon className="ml-1 h-3 w-3" />
                )}
              </span>
            ))}
          </div>
        </div>

        {result.analysis.skillRequirements && (
          <>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {result.analysis.skillRequirements.required.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Preferred Skills</h3>
              <div className="flex flex-wrap gap-2">
                {result.analysis.skillRequirements.preferred.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>

    {/* Suggestions */}
    {result.analysis.suggestions.length > 0 && (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Suggestions</h2>
        <ul className="space-y-2">
          {result.analysis.suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start">
              <SparklesIcon className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* Optimized Resume */}
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Optimized Resume</h2>
        <button
          onClick={onCopyOptimized}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Copy to Clipboard
        </button>
      </div>
      <div className="bg-gray-50 rounded-md p-4">
        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
          {result.optimizedContent}
        </pre>
      </div>
    </div>
  </div>
));

ResultsSection.displayName = 'ResultsSection';
ResumeOptimizer.displayName = 'ResumeOptimizer';

export default ResumeOptimizer; 