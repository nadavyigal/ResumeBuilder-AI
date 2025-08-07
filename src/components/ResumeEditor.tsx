import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { Save, AlertCircle } from 'lucide-react';

// Define the structure of the resume content
export interface EditorContent {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    year: string;
    details: string;
  }>;
  skills: string[];
}

interface ResumeEditorProps {
  resumeId: string;
  initialContent?: EditorContent;
  jobDescription?: string;
}

export default function ResumeEditor({
  resumeId,
  initialContent,
  jobDescription,
}: ResumeEditorProps) {
  const [content, setContent] = useState<EditorContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState<string>('');

  useEffect(() => {
    if (initialContent && typeof initialContent === 'object') {
      setContent(initialContent);
    } else {
      setError('Invalid resume data format.');
    }
  }, [initialContent]);
  
  const debouncedContent = useDebounce(content, 1000); // Auto-save after 1 second of inactivity

  // Auto-save functionality
  useEffect(() => {
    if (debouncedContent && resumeId) {
      saveResume();
    }
  }, [debouncedContent]);

  const saveResume = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('resumes')
        .update({
          content: content,
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

  const handleContentChange = useCallback((section: keyof EditorContent, data: any) => {
    setContent((prevContent) => {
      if (!prevContent) return null;
      return { ...prevContent, [section]: data };
    });
  }, []);

  if (!content) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Loading editor...</p>
      </div>
    );
  }

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
        {/* Personal Info Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={content.personal.name}
                onChange={(e) => handleContentChange('personal', { ...content.personal, name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={content.personal.email}
                onChange={(e) => handleContentChange('personal', { ...content.personal, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                id="phone"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={content.personal.phone}
                onChange={(e) => handleContentChange('personal', { ...content.personal, phone: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                id="location"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={content.personal.location}
                onChange={(e) => handleContentChange('personal', { ...content.personal, location: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700">Summary</label>
              <textarea
                id="summary"
                rows={5}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={content.personal.summary}
                onChange={(e) => handleContentChange('personal', { ...content.personal, summary: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Work Experience</h3>
          {content.experience.map((exp, index) => (
            <div key={index} className="mb-6 p-4 border border-gray-200 rounded-md relative">
              <h4 className="font-medium text-gray-800 mb-2">Experience #{index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`exp-title-${index}`} className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    id={`exp-title-${index}`}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={exp.title}
                    onChange={(e) => {
                      const updatedExperience = [...content.experience];
                      updatedExperience[index] = { ...exp, title: e.target.value };
                      handleContentChange('experience', updatedExperience);
                    }}
                  />
                </div>
                <div>
                  <label htmlFor={`exp-company-${index}`} className="block text-sm font-medium text-gray-700">Company</label>
                  <input
                    type="text"
                    id={`exp-company-${index}`}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={exp.company}
                    onChange={(e) => {
                      const updatedExperience = [...content.experience];
                      updatedExperience[index] = { ...exp, company: e.target.value };
                      handleContentChange('experience', updatedExperience);
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor={`exp-duration-${index}`} className="block text-sm font-medium text-gray-700">Duration</label>
                  <input
                    type="text"
                    id={`exp-duration-${index}`}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={exp.duration}
                    onChange={(e) => {
                      const updatedExperience = [...content.experience];
                      updatedExperience[index] = { ...exp, duration: e.target.value };
                      handleContentChange('experience', updatedExperience);
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor={`exp-description-${index}`} className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    id={`exp-description-${index}`}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={exp.description}
                    onChange={(e) => {
                      const updatedExperience = [...content.experience];
                      updatedExperience[index] = { ...exp, description: e.target.value };
                      handleContentChange('experience', updatedExperience);
                    }}
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  const updatedExperience = content.experience.filter((_, i) => i !== index);
                  handleContentChange('experience', updatedExperience);
                }}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                title="Remove Experience"
              >
                &times;
              </button>
            </div>
          ))}
          <button
            onClick={() => handleContentChange('experience', [...content.experience, { title: '', company: '', duration: '', description: '' }])}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Experience
          </button>
        </div>

        {/* Education Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Education</h3>
          {content.education.map((edu, index) => (
            <div key={index} className="mb-6 p-4 border border-gray-200 rounded-md relative">
              <h4 className="font-medium text-gray-800 mb-2">Education #{index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`edu-degree-${index}`} className="block text-sm font-medium text-gray-700">Degree</label>
                  <input
                    type="text"
                    id={`edu-degree-${index}`}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={edu.degree}
                    onChange={(e) => {
                      const updatedEducation = [...content.education];
                      updatedEducation[index] = { ...edu, degree: e.target.value };
                      handleContentChange('education', updatedEducation);
                    }}
                  />
                </div>
                <div>
                  <label htmlFor={`edu-school-${index}`} className="block text-sm font-medium text-gray-700">School</label>
                  <input
                    type="text"
                    id={`edu-school-${index}`}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={edu.school}
                    onChange={(e) => {
                      const updatedEducation = [...content.education];
                      updatedEducation[index] = { ...edu, school: e.target.value };
                      handleContentChange('education', updatedEducation);
                    }}
                  />
                </div>
                <div>
                  <label htmlFor={`edu-year-${index}`} className="block text-sm font-medium text-gray-700">Year</label>
                  <input
                    type="text"
                    id={`edu-year-${index}`}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={edu.year}
                    onChange={(e) => {
                      const updatedEducation = [...content.education];
                      updatedEducation[index] = { ...edu, year: e.target.value };
                      handleContentChange('education', updatedEducation);
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor={`edu-details-${index}`} className="block text-sm font-medium text-gray-700">Details</label>
                  <textarea
                    id={`edu-details-${index}`}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={edu.details}
                    onChange={(e) => {
                      const updatedEducation = [...content.education];
                      updatedEducation[index] = { ...edu, details: e.target.value };
                      handleContentChange('education', updatedEducation);
                    }}
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  const updatedEducation = content.education.filter((_, i) => i !== index);
                  handleContentChange('education', updatedEducation);
                }}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                title="Remove Education"
              >
                &times;
              </button>
            </div>
          ))}
          <button
            onClick={() => handleContentChange('education', [...content.education, { degree: '', school: '', year: '', details: '' }])}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Education
          </button>
        </div>

        {/* Skills Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {content.skills.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                {skill}
                <button
                  onClick={() => {
                    const updatedSkills = content.skills.filter((_, i) => i !== index);
                    handleContentChange('skills', updatedSkills);
                  }}
                  className="text-blue-500 hover:text-blue-700"
                  title="Remove Skill"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              className="flex-grow rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Add new skill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (newSkill.trim() && !content.skills.includes(newSkill.trim())) {
                    handleContentChange('skills', [...content.skills, newSkill.trim()]);
                    setNewSkill('');
                  }
                }
              }}
            />
            <button
              onClick={() => {
                if (newSkill.trim() && !content.skills.includes(newSkill.trim())) {
                  handleContentChange('skills', [...content.skills, newSkill.trim()]);
                  setNewSkill('');
                }
              }}
              className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Skill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}