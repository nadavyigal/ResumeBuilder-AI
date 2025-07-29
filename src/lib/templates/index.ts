import { ResumeTemplate } from '@/types/template';

export const templates: ResumeTemplate[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'A clean, traditional resume template perfect for corporate positions',
    thumbnail: '/templates/professional-thumb.svg',
    isAtsOptimized: true,
    styles: {
      fontFamily: 'Arial, sans-serif',
      fontSize: {
        base: '11pt',
        heading1: '16pt',
        heading2: '14pt',
        heading3: '12pt',
      },
      colors: {
        primary: '#2c3e50',
        secondary: '#34495e',
        text: '#333333',
        background: '#ffffff',
        accent: '#3498db',
      },
      spacing: {
        section: '1.5rem',
        paragraph: '0.75rem',
        line: '1.5',
      },
    },
    layout: {
      columns: 1,
      sectionOrder: ['header', 'summary', 'experience', 'education', 'skills'],
      headerPosition: 'top',
      margins: {
        top: '1in',
        right: '1in',
        bottom: '1in',
        left: '1in',
      },
    },
    customizationOptions: {
      allowColorChange: true,
      allowFontChange: true,
      allowLayoutChange: false,
      colorPresets: ['#2c3e50', '#27ae60', '#e74c3c', '#8e44ad'],
      fontPresets: ['Arial', 'Times New Roman', 'Calibri', 'Georgia'],
    },
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'A contemporary design with a sidebar layout for tech and creative roles',
    thumbnail: '/templates/modern-thumb.svg',
    isAtsOptimized: true,
    styles: {
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontSize: {
        base: '10pt',
        heading1: '18pt',
        heading2: '14pt',
        heading3: '12pt',
      },
      colors: {
        primary: '#1a1a1a',
        secondary: '#4a4a4a',
        text: '#333333',
        background: '#ffffff',
        accent: '#0066cc',
      },
      spacing: {
        section: '2rem',
        paragraph: '1rem',
        line: '1.6',
      },
      borders: {
        style: 'solid',
        width: '2px',
        color: '#e0e0e0',
      },
    },
    layout: {
      columns: 2,
      sectionOrder: ['header', 'summary', 'experience', 'skills', 'education'],
      headerPosition: 'left',
      margins: {
        top: '0.75in',
        right: '0.75in',
        bottom: '0.75in',
        left: '0.75in',
      },
    },
    customizationOptions: {
      allowColorChange: true,
      allowFontChange: true,
      allowLayoutChange: true,
      colorPresets: ['#0066cc', '#00a86b', '#ff6b6b', '#4ecdc4'],
      fontPresets: ['Helvetica', 'Roboto', 'Open Sans', 'Lato'],
    },
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'A simple, elegant template that focuses on content clarity',
    thumbnail: '/templates/minimalist-thumb.svg',
    isAtsOptimized: true,
    styles: {
      fontFamily: 'Georgia, serif',
      fontSize: {
        base: '11pt',
        heading1: '20pt',
        heading2: '14pt',
        heading3: '12pt',
      },
      colors: {
        primary: '#000000',
        secondary: '#666666',
        text: '#333333',
        background: '#ffffff',
        accent: '#000000',
      },
      spacing: {
        section: '2.5rem',
        paragraph: '1rem',
        line: '1.8',
      },
    },
    layout: {
      columns: 1,
      sectionOrder: ['header', 'summary', 'experience', 'education', 'skills'],
      headerPosition: 'top',
      margins: {
        top: '1.25in',
        right: '1.25in',
        bottom: '1.25in',
        left: '1.25in',
      },
    },
    customizationOptions: {
      allowColorChange: false,
      allowFontChange: true,
      allowLayoutChange: false,
      fontPresets: ['Georgia', 'Garamond', 'Times New Roman', 'Baskerville'],
    },
  },
];

export function getTemplateById(id: string): ResumeTemplate | undefined {
  return templates.find(template => template.id === id);
}

export function getDefaultTemplate(): ResumeTemplate {
  return templates[0];
} 