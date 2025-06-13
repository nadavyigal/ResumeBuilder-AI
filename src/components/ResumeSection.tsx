'use client';

import { useState } from 'react';
import WYSIWYGEditor from './WYSIWYGEditor';
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

export interface ResumeSectionData {
  id: string;
  title: string;
  type: 'experience' | 'education' | 'skills' | 'summary' | 'other';
  content: string;
  isCollapsed?: boolean;
}

interface ResumeSectionProps {
  section: ResumeSectionData;
  onContentChange: (sectionId: string, content: string) => void;
  onRegenerate: (sectionId: string) => Promise<void>;
  jobDescription?: string;
}

const sectionStyles = {
  experience: 'border-blue-200 bg-blue-50/30',
  education: 'border-green-200 bg-green-50/30',
  skills: 'border-yellow-200 bg-yellow-50/30',
  summary: 'border-purple-200 bg-purple-50/30',
  other: 'border-gray-200 bg-gray-50/30',
};

export default function ResumeSection({
  section,
  onContentChange,
  onRegenerate,
  jobDescription,
}: ResumeSectionProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(section.isCollapsed || false);

  const handleRegenerate = async () => {
    if (!jobDescription) {
      alert('Please provide a job description to regenerate this section.');
      return;
    }

    setIsRegenerating(true);
    try {
      await onRegenerate(section.id);
    } catch (error) {
      console.error('Failed to regenerate section:', error);
      alert('Failed to regenerate section. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div
      className={`resume-section border-2 rounded-lg p-4 mb-4 transition-all ${
        sectionStyles[section.type]
      }`}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
          >
            {isCollapsed ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronUp className="w-5 h-5" />
            )}
          </button>
          <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
        </div>
        
        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          title="Regenerate this section based on job description"
        >
          <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          {isRegenerating ? 'Regenerating...' : 'Regenerate'}
        </button>
      </div>

      {/* Section Content */}
      {!isCollapsed && (
        <div className="editor-container">
          {isRegenerating ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                <p className="text-gray-600">Regenerating section content...</p>
              </div>
            </div>
          ) : (
            <WYSIWYGEditor
              content={section.content}
              onChange={(content) => onContentChange(section.id, content)}
              placeholder={`Enter ${section.title.toLowerCase()} details...`}
            />
          )}
        </div>
      )}
    </div>
  );
} 