'use client';

import { useState } from 'react';
import { ResumeTemplate } from '@/types/template';
import { EyeIcon, CheckIcon } from '@heroicons/react/24/outline';

interface TemplateCardProps {
  template: ResumeTemplate;
  selected?: boolean;
  onSelect?: (templateId: string) => void;
  onPreview?: (templateId: string) => void;
  showActions?: boolean;
}

export default function TemplateCard({ 
  template, 
  selected = false, 
  onSelect, 
  onPreview,
  showActions = true 
}: TemplateCardProps) {
  const [imageError, setImageError] = useState(false);

  const handlePreview = () => {
    onPreview?.(template.id);
  };

  const handleSelect = () => {
    onSelect?.(template.id);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
      selected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Template Preview */}
      <div className="relative aspect-[3/4] bg-gray-50 rounded-t-lg overflow-hidden group">
        {!imageError ? (
          <img
            src={template.thumbnail}
            alt={`${template.name} template preview`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center p-6">
              <div className="w-16 h-20 mx-auto mb-3 bg-white border border-gray-300 rounded shadow-sm flex items-center justify-center">
                <div className="text-xs text-gray-400 font-mono">
                  {template.name.slice(0, 3).toUpperCase()}
                </div>
              </div>
              <div className="text-sm text-gray-500">{template.name} Template</div>
            </div>
          </div>
        )}
        
        {/* Hover Actions */}
        {showActions && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <button
                onClick={handlePreview}
                className="bg-white text-gray-800 px-3 py-2 rounded-md shadow-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-1 text-sm font-medium"
              >
                <EyeIcon className="h-4 w-4" />
                Preview
              </button>
              <button
                onClick={handleSelect}
                className="bg-indigo-600 text-white px-3 py-2 rounded-md shadow-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-1 text-sm font-medium"
              >
                <CheckIcon className="h-4 w-4" />
                Select
              </button>
            </div>
          </div>
        )}

        {/* ATS Optimized Badge */}
        {template.isAtsOptimized && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ATS Optimized
            </span>
          </div>
        )}

        {/* Selected Indicator */}
        {selected && (
          <div className="absolute top-2 left-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
              <CheckIcon className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Template Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
          {template.layout.columns > 1 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {template.layout.columns} Column
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {template.description}
        </p>

        {/* Template Features */}
        <div className="flex flex-wrap gap-1 mb-3">
          {template.customizationOptions.allowColorChange && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              Color Customizable
            </span>
          )}
          {template.customizationOptions.allowFontChange && (
            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
              Font Options
            </span>
          )}
          {template.customizationOptions.allowLayoutChange && (
            <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
              Layout Flexible
            </span>
          )}
        </div>

        {/* Action Buttons (Mobile/Always Visible) */}
        {showActions && (
          <div className="flex gap-2 lg:hidden">
            <button
              onClick={handlePreview}
              className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-1 text-sm font-medium"
            >
              <EyeIcon className="h-4 w-4" />
              Preview
            </button>
            <button
              onClick={handleSelect}
              className={`flex-1 px-3 py-2 rounded-md transition-colors duration-200 flex items-center justify-center gap-1 text-sm font-medium ${
                selected
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <CheckIcon className="h-4 w-4" />
              {selected ? 'Selected' : 'Select'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}