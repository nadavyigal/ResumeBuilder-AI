'use client';

import { useState } from 'react';
import { ResumeTemplate } from '@/types/template';
import { templates } from '@/lib/templates';
import { Check, Eye } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  onPreview?: (templateId: string) => void;
}

export default function TemplateSelector({
  selectedTemplateId,
  onSelectTemplate,
  onPreview,
}: TemplateSelectorProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  return (
    <div className="template-selector">
      <h3 className="text-lg font-semibold mb-4">Choose a Template</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`template-card relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
              selectedTemplateId === template.id
                ? 'border-blue-500 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
            onClick={() => onSelectTemplate(template.id)}
            onMouseEnter={() => setHoveredTemplate(template.id)}
            onMouseLeave={() => setHoveredTemplate(null)}
          >
            {/* Template Thumbnail */}
            <div className="aspect-[8.5/11] bg-gray-100 relative">
              {/* Placeholder for template preview */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="w-32 h-40 bg-white shadow-sm rounded mx-auto mb-2">
                    {/* Simple template representation */}
                    <div className="p-2">
                      <div className="h-2 bg-gray-300 rounded mb-2"></div>
                      <div className="h-1 bg-gray-200 rounded mb-1"></div>
                      <div className="h-1 bg-gray-200 rounded mb-3"></div>
                      <div className="h-1 bg-gray-200 rounded mb-1"></div>
                      <div className="h-1 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected indicator */}
              {selectedTemplateId === template.id && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
              )}

              {/* Preview button */}
              {hoveredTemplate === template.id && onPreview && (
                <button
                  className="absolute bottom-2 right-2 bg-white text-gray-700 px-3 py-1 rounded-md shadow-md flex items-center gap-1 text-sm hover:bg-gray-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(template.id);
                  }}
                >
                  <Eye className="w-3 h-3" />
                  Preview
                </button>
              )}
            </div>

            {/* Template Info */}
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{template.description}</p>
              {template.isAtsOptimized && (
                <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                  ATS Optimized
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 