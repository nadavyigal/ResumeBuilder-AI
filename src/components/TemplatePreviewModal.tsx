'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { ResumeTemplate } from '@/types/template';
import TemplatePreview from './TemplatePreview';

interface TemplatePreviewModalProps {
  template: ResumeTemplate;
  isOpen: boolean;
  onClose: () => void;
  onSelect: () => void;
}

// Sample resume data for preview
const sampleResumeData = {
  personal: {
    fullName: 'John Doe',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    location: 'New York, NY',
    summary: 'Experienced software developer with 5+ years of expertise in building scalable web applications using modern technologies. Passionate about creating efficient, user-friendly solutions and leading development teams.'
  },
  experience: [
    {
      title: 'Senior Software Developer',
      company: 'Tech Corporation',
      duration: '2020 - Present',
      description: '• Led development of key product features serving 100K+ users\n• Mentored 3 junior developers and improved team productivity by 30%\n• Implemented CI/CD pipeline reducing deployment time by 50%'
    },
    {
      title: 'Full Stack Developer',
      company: 'StartupCo',
      duration: '2018 - 2020',
      description: '• Built responsive web applications using React and Node.js\n• Collaborated with design team to implement pixel-perfect UI components\n• Optimized application performance resulting in 40% faster load times'
    }
  ],
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      school: 'University of Technology',
      year: '2018',
      details: 'Graduated Magna Cum Laude with a focus on software engineering and data structures.'
    }
  ],
  skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'Git']
};

export default function TemplatePreviewModal({ template, isOpen, onClose, onSelect }: TemplatePreviewModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                      {template.name} Template Preview
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 mt-1">
                      {template.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={onSelect}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      <CheckIcon className="h-4 w-4" />
                      Select Template
                    </button>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Template Features */}
                <div className="mb-6 flex flex-wrap gap-2">
                  {template.isAtsOptimized && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ATS Optimized
                    </span>
                  )}
                  {template.layout.columns > 1 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {template.layout.columns} Column Layout
                    </span>
                  )}
                  {template.customizationOptions.allowColorChange && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Color Customizable
                    </span>
                  )}
                  {template.customizationOptions.allowFontChange && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Font Options
                    </span>
                  )}
                </div>

                {/* Template Preview */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <p className="text-sm text-gray-600">
                      Preview with sample data • Actual content will use your resume information
                    </p>
                  </div>
                  
                  <div className="overflow-auto max-h-[60vh] bg-white">
                    <div className="transform scale-75 origin-top-left" style={{ width: '133.33%' }}>
                      <TemplatePreview
                        template={template}
                        resumeData={sampleResumeData}
                        className="min-h-[11in] bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Template Specifications */}
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Design Details</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>Font: {template.styles.fontFamily}</li>
                      <li>Layout: {template.layout.columns} column{template.layout.columns > 1 ? 's' : ''}</li>
                      <li>Margins: {template.layout.margins.top}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Customization</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>Colors: {template.customizationOptions.allowColorChange ? 'Customizable' : 'Fixed'}</li>
                      <li>Fonts: {template.customizationOptions.allowFontChange ? 'Multiple options' : 'Fixed'}</li>
                      <li>Layout: {template.customizationOptions.allowLayoutChange ? 'Flexible' : 'Fixed'}</li>
                    </ul>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Select this template to start building your resume
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={onSelect}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      <CheckIcon className="h-4 w-4" />
                      Use This Template
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}