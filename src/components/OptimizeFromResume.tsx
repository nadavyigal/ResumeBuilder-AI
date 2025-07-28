'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/types/supabase';
import { DocumentTextIcon, SparklesIcon } from '@heroicons/react/24/outline';

type Resume = Database['public']['Tables']['resumes']['Row'];

interface OptimizeFromResumeProps {
  userId: string;
  onResumeSelect?: (resumeText: string) => void;
}

export default function OptimizeFromResume({ userId, onResumeSelect }: OptimizeFromResumeProps) {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  useEffect(() => {
    async function loadResumes() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setResumes(data || []);
      } catch (error) {
        console.error('Error loading resumes:', error);
      } finally {
        setLoading(false);
      }
    }

    loadResumes();
  }, [userId]);

  const handleOptimize = async () => {
    if (!selectedResumeId) return;

    const selectedResume = resumes.find(r => r.id === selectedResumeId);
    if (!selectedResume) return;

    // Get the text content from the resume
    const resumeText = typeof selectedResume.content === 'string' 
      ? selectedResume.content 
      : JSON.stringify(selectedResume.content, null, 2);

    if (onResumeSelect) {
      onResumeSelect(resumeText);
    } else {
      // Navigate to optimizer with resume pre-filled
      router.push(`/optimize?resumeId=${selectedResumeId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        <DocumentTextIcon className="inline h-5 w-5 mr-2" />
        Select a Resume to Optimize
      </h3>

      {resumes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No resumes found. Create one first!</p>
          <button
            onClick={() => router.push('/resumes/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Create Resume
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-4">
            {resumes.map((resume) => (
              <label
                key={resume.id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedResumeId === resume.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="resume"
                  value={resume.id}
                  checked={selectedResumeId === resume.id}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {resume.title || 'Untitled Resume'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Created {new Date(resume.created_at).toLocaleDateString()}
                  </p>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handleOptimize}
            disabled={!selectedResumeId}
            className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              selectedResumeId
                ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            <SparklesIcon className="h-5 w-5 mr-2" />
            Optimize Selected Resume
          </button>
        </>
      )}
    </div>
  );
} 