'use client';

import { useState, useEffect, useCallback } from 'react';
import ResumeSection, { ResumeSectionData } from './ResumeSection';
import { supabase } from '@/lib/supabase';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { Save, AlertCircle } from 'lucide-react';

interface ResumeEditorProps {
  resumeId: string;
  initialSections?: ResumeSectionData[];
  jobDescription?: string;
}

export default function ResumeEditor({
  resumeId,
  initialSections = [],
  jobDescription,
}: ResumeEditorProps) {
  const [sections, setSections] = useState<ResumeSectionData[]>(initialSections);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedSections = useDebounce(sections, 1000); // Auto-save after 1 second of inactivity

  // Auto-save functionality
  useEffect(() => {
    if (debouncedSections.length > 0 && resumeId) {
      saveResume();
    }
  }, [debouncedSections]);

  const saveResume = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('resumes')
        .update({
          sections: sections,
          updated_at: new Date().toISOString(),
        })
        .eq('id', resumeId);

      if (error) throw error;
      
      setLastSaved(new Date());
    } catch (err) {
      console.error('Failed to save resume:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = useCallback((sectionId: string, content: string) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId ? { ...section, content } : section
      )
    );
  }, []);

  const handleRegenerate = async (sectionId: string) => {
    if (!jobDescription) {
      throw new Error('Job description is required for regeneration');
    }

    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    try {
      const response = await fetch('/api/regenerate-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId,
          sectionType: section.type,
          currentContent: section.content,
          jobDescription,
          resumeId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate section');
      }

      const { content } = await response.json();
      
      // Update the section with new content
      setSections((prevSections) =>
        prevSections.map((s) =>
          s.id === sectionId ? { ...s, content } : s
        )
      );
    } catch (error) {
      console.error('Regeneration error:', error);
      throw error;
    }
  };

  return (
    <div className="resume-editor max-w-4xl mx-auto p-4">
      {/* Header with save status */}
      <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">Resume Editor</h2>
        <div className="flex items-center gap-3">
          {error && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {isSaving ? (
              <>
                <Save className="w-4 h-4 animate-pulse" />
                <span>Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <Save className="w-4 h-4 text-green-600" />
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </>
            ) : (
              <span>Not saved</span>
            )}
          </div>
        </div>
      </div>

      {/* Job Description Info */}
      {jobDescription && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Job Description:</strong> {jobDescription.substring(0, 150)}...
          </p>
        </div>
      )}

      {/* Resume Sections */}
      <div className="space-y-4">
        {sections.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No sections available. Please generate a resume first.</p>
          </div>
        ) : (
          sections.map((section) => (
            <ResumeSection
              key={section.id}
              section={section}
              onContentChange={handleContentChange}
              onRegenerate={handleRegenerate}
              jobDescription={jobDescription}
            />
          ))
        )}
      </div>
    </div>
  );
} 