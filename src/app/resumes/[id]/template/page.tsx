'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getResume, updateResume } from '@/lib/db';
import { Database } from '@/types/supabase';
import { ResumeTemplate, TemplateStyles } from '@/types/template';
import { getTemplateById, getDefaultTemplate } from '@/lib/templates';
import TemplateSelector from '@/components/TemplateSelector';
import TemplatePreview from '@/components/TemplatePreview';
import TemplateCustomizer from '@/components/TemplateCustomizer';
import { Download, Save, ArrowLeft } from 'lucide-react';

type Resume = Database['public']['Tables']['resumes']['Row'];

export default function TemplateSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const resumeId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('professional');
  const [customizations, setCustomizations] = useState<Partial<TemplateStyles>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserAndResume() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/');
          return;
        }

        setUser(user);
        
        const resumeData = await getResume(resumeId, user.id);
        if (!resumeData) {
          router.push('/resumes');
          return;
        }
        
        setResume(resumeData);
        
        // Load saved template preferences if any
        const savedPrefs = (resumeData.content as any)?.templatePreferences;
        if (savedPrefs) {
          setSelectedTemplateId(savedPrefs.templateId || 'professional');
          setCustomizations(savedPrefs.customizations || {});
        }
      } catch (error) {
        console.error('Error loading resume:', error);
        router.push('/resumes');
      } finally {
        setLoading(false);
      }
    }

    loadUserAndResume();
  }, [router, resumeId]);

  const handleSaveTemplate = async () => {
    if (!user || !resume) return;

    setSaving(true);
    try {
      const updatedContent = {
        ...(resume.content as any),
        templatePreferences: {
          templateId: selectedTemplateId,
          customizations,
        },
      };

      await updateResume(resume.id, user.id, {
        content: updatedContent as any,
      });

      // Show success message
      alert('Template preferences saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!resume) return;

    setExporting(true);
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId: resume.id,
          templateId: selectedTemplateId,
          customizations,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const { html, validation } = await response.json();

      // Show validation warnings if any
      if (!validation.isValid) {
        const confirmExport = confirm(
          `ATS Compatibility Warning:\n${validation.issues.join('\n')}\n\nDo you want to continue with the export?`
        );
        if (!confirmExport) {
          setExporting(false);
          return;
        }
      }

      // Open print dialog for PDF generation
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handlePreview = (templateId: string) => {
    setPreviewTemplateId(templateId);
    setShowPreview(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (!user || !resume) {
    return null;
  }

  const selectedTemplate = getTemplateById(selectedTemplateId) || getDefaultTemplate();
  const previewTemplate = previewTemplateId ? getTemplateById(previewTemplateId) : selectedTemplate;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/resumes/${resumeId}/edit`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Editor
              </button>
              <h1 className="text-xl font-semibold">Choose Template - {resume.title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveTemplate}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Template'}
              </button>
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Exporting...' : 'Export PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Template Selection and Customization */}
          <div className="lg:col-span-1 space-y-6">
            <TemplateSelector
              selectedTemplateId={selectedTemplateId}
              onSelectTemplate={setSelectedTemplateId}
              onPreview={handlePreview}
            />
            
            <TemplateCustomizer
              template={selectedTemplate}
              customizations={customizations}
              onCustomizationChange={setCustomizations}
            />
          </div>

          {/* Right Column - Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">
                Preview {showPreview && previewTemplateId !== selectedTemplateId ? '(Preview Mode)' : ''}
              </h3>
              
              {showPreview && previewTemplateId !== selectedTemplateId && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
                  <span className="text-sm text-blue-800">
                    Previewing "{previewTemplate?.name}" template
                  </span>
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      setPreviewTemplateId(null);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Close Preview
                  </button>
                </div>
              )}
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="transform scale-75 origin-top">
                  <TemplatePreview
                    template={previewTemplate || selectedTemplate}
                    resumeData={resume.content}
                    customizations={showPreview && previewTemplateId !== selectedTemplateId ? {} : customizations}
                    className="bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 