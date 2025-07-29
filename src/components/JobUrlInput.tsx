'use client';

import { useState, useCallback } from 'react';
import { LinkIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface JobUrlInputProps {
  onJobDescriptionExtracted: (jobDescription: string, metadata?: {
    title?: string;
    company?: string;
    location?: string;
    source?: string;
  }) => void;
  className?: string;
}

interface ScrapingResult {
  success: boolean;
  data?: {
    title?: string;
    company?: string;
    location?: string;
    jobDescription?: string;
    source?: string;
    url?: string;
  };
  error?: string;
  details?: string;
}

export default function JobUrlInput({ onJobDescriptionExtracted, className = '' }: JobUrlInputProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleScrapeJob = useCallback(async () => {
    if (!url.trim()) {
      setError('Please enter a job posting URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/scrape-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const result: ScrapingResult = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to scrape job posting');
      }

      if (result.success && result.data?.jobDescription) {
        const metadata = {
          title: result.data.title,
          company: result.data.company,
          location: result.data.location,
          source: result.data.source
        };

        onJobDescriptionExtracted(result.data.jobDescription, metadata);
        setSuccess(`Successfully extracted job description${result.data.title ? ` for "${result.data.title}"` : ''}`);
        setUrl(''); // Clear the input after successful extraction
      } else {
        throw new Error('No job description found in the scraped content');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [url, onJobDescriptionExtracted]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleScrapeJob();
    }
  }, [handleScrapeJob, isLoading]);

  const isValidUrl = useCallback((input: string) => {
    try {
      const url = new URL(input);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  }, []);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <LinkIcon className="inline h-4 w-4 mr-1" />
          Job Posting URL
        </label>
        <div className="flex space-x-2">
          <div className="flex-1">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="https://example.com/job-posting"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Supported sites: LinkedIn, Indeed, Glassdoor, Workday, Lever, Greenhouse
            </p>
          </div>
          <button
            onClick={handleScrapeJob}
            disabled={isLoading || !url.trim() || !isValidUrl(url)}
            className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm ${
              isLoading || !url.trim() || !isValidUrl(url)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Extracting...
              </div>
            ) : (
              'Extract'
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <ExclamationCircleIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-800 font-medium">Failed to extract job description</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-start space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-green-800 font-medium">Job description extracted successfully!</p>
            <p className="text-sm text-green-700 mt-1">{success}</p>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500">
        <p>💡 <strong>Tip:</strong> Make sure the job posting URL is publicly accessible and not behind a login wall.</p>
      </div>
    </div>
  );
}