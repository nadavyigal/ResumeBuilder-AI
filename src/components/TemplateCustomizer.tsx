'use client';

import { useState } from 'react';
import { ResumeTemplate, TemplateStyles } from '@/types/template';
import { Palette, Type } from 'lucide-react';

interface TemplateCustomizerProps {
  template: ResumeTemplate;
  customizations: Partial<TemplateStyles>;
  onCustomizationChange: (customizations: Partial<TemplateStyles>) => void;
}

export default function TemplateCustomizer({
  template,
  customizations,
  onCustomizationChange,
}: TemplateCustomizerProps) {
  const [activeTab, setActiveTab] = useState<'colors' | 'fonts'>('colors');

  const handleColorChange = (colorKey: keyof TemplateStyles['colors'], value: string) => {
    onCustomizationChange({
      ...customizations,
      colors: {
        ...template.styles.colors,
        ...customizations.colors,
        [colorKey]: value,
      },
    });
  };

  const handleFontChange = (font: string) => {
    onCustomizationChange({
      ...customizations,
      fontFamily: font,
    });
  };

  if (!template.customizationOptions.allowColorChange && !template.customizationOptions.allowFontChange) {
    return null;
  }

  return (
    <div className="template-customizer bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Customize Template</h3>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        {template.customizationOptions.allowColorChange && (
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'colors'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('colors')}
          >
            <Palette className="w-4 h-4" />
            Colors
          </button>
        )}
        {template.customizationOptions.allowFontChange && (
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'fonts'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('fonts')}
          >
            <Type className="w-4 h-4" />
            Fonts
          </button>
        )}
      </div>

      {/* Color Customization */}
      {activeTab === 'colors' && template.customizationOptions.allowColorChange && (
        <div className="space-y-4">
          {template.customizationOptions.colorPresets && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Presets
              </label>
              <div className="flex gap-2">
                {template.customizationOptions.colorPresets.map((color) => (
                  <button
                    key={color}
                    className="w-10 h-10 rounded-md border-2 border-gray-300 hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange('primary', color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="primary-color" className="block text-sm font-medium text-gray-700 mb-1">
                Primary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="primary-color"
                  type="color"
                  value={customizations.colors?.primary || template.styles.colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="h-10 w-20"
                />
                <span className="text-sm text-gray-500">
                  {customizations.colors?.primary || template.styles.colors.primary}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="accent-color" className="block text-sm font-medium text-gray-700 mb-1">
                Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="accent-color"
                  type="color"
                  value={customizations.colors?.accent || template.styles.colors.accent}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  className="h-10 w-20"
                />
                <span className="text-sm text-gray-500">
                  {customizations.colors?.accent || template.styles.colors.accent}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Font Customization */}
      {activeTab === 'fonts' && template.customizationOptions.allowFontChange && (
        <div>
          <label htmlFor="font-family" className="block text-sm font-medium text-gray-700 mb-2">
            Font Family
          </label>
          <select
            id="font-family"
            value={customizations.fontFamily || template.styles.fontFamily}
            onChange={(e) => handleFontChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {template.customizationOptions.fontPresets?.map((font) => (
              <option key={font} value={`${font}, ${font.includes('Times') ? 'serif' : 'sans-serif'}`}>
                {font}
              </option>
            ))}
          </select>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <p style={{ fontFamily: customizations.fontFamily || template.styles.fontFamily }}>
              This is a preview of your selected font. The quick brown fox jumps over the lazy dog.
            </p>
          </div>
        </div>
      )}

      {/* Reset Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => onCustomizationChange({})}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
} 