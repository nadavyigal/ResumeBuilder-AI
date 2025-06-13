import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TemplatePreview from '@/components/TemplatePreview';
import { templates } from '@/lib/templates';

describe('TemplatePreview', () => {
  const mockResumeData = {
    personal: {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      location: 'New York, NY',
      summary: 'Experienced software developer with a passion for building great products.',
    },
    experience: [
      {
        title: 'Senior Developer',
        company: 'Tech Corp',
        duration: '2020-Present',
        description: 'Led development of key features and mentored junior developers.',
      },
    ],
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        school: 'University of Technology',
        year: '2018',
        details: 'Graduated with honors',
      },
    ],
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
  };

  it('renders resume data with default template styles', () => {
    const template = templates[0]; // Professional template

    render(
      <TemplatePreview
        template={template}
        resumeData={mockResumeData}
        className="test-preview"
      />
    );

    // Check if resume sections are rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.getByText(/Led development of key features/)).toBeInTheDocument();
    expect(screen.getByText('Bachelor of Science in Computer Science')).toBeInTheDocument();
    expect(screen.getByText(/JavaScript/)).toBeInTheDocument();

    // Check if template styles are applied
    const previewElement = screen.getByTestId('resume-preview');
    const styles = window.getComputedStyle(previewElement);
    expect(styles.fontFamily).toContain(template.styles.fontFamily);
    expect(styles.fontSize).toBe(template.styles.fontSize.base);
  });

  it('applies customizations correctly', () => {
    const template = templates[0];
    const customizations = {
      fontFamily: 'Times New Roman, serif',
      colors: {
        primary: '#ff0000',
        secondary: '#000000',
        text: '#333333',
        background: '#ffffff',
        accent: '#0000ff',
      },
    };

    render(
      <TemplatePreview
        template={template}
        resumeData={mockResumeData}
        customizations={customizations}
      />
    );

    const previewElement = screen.getByTestId('resume-preview');
    const styles = window.getComputedStyle(previewElement);
    expect(styles.fontFamily).toContain('Times New Roman');
    
    // Check if custom colors are applied
    const heading = screen.getByRole('heading', { name: 'John Doe' });
    const headingStyles = window.getComputedStyle(heading);
    expect(headingStyles.color).toBe('rgb(255, 0, 0)'); // #ff0000
  });

  it('handles missing resume data gracefully', () => {
    const template = templates[0];
    const incompleteData = {
      personal: {
        fullName: 'John Doe',
      },
    };

    render(
      <TemplatePreview
        template={template}
        resumeData={incompleteData}
        className="test-preview"
      />
    );

    // Should render name but not missing data
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('undefined')).not.toBeInTheDocument();
    expect(screen.queryByText('null')).not.toBeInTheDocument();
  });

  it('renders two-column layout correctly for modern template', () => {
    const modernTemplate = templates.find(t => t.id === 'modern');
    if (!modernTemplate) {
      throw new Error('Modern template not found');
    }

    render(
      <TemplatePreview
        template={modernTemplate}
        resumeData={mockResumeData}
      />
    );

    const contentWrapper = screen.getByTestId('content-wrapper');
    const styles = window.getComputedStyle(contentWrapper);
    expect(styles.display).toBe('grid');
    expect(styles.gridTemplateColumns).toMatch(/1fr 2fr|2fr 1fr/);
  });

  it('applies print-specific styles', () => {
    const template = templates[0];

    render(
      <TemplatePreview
        template={template}
        resumeData={mockResumeData}
      />
    );

    // Get the style tag content
    const styleTag = document.querySelector('style');
    const styleContent = styleTag?.textContent || '';

    // Check if print media query is present
    expect(styleContent).toContain('@media print');
    expect(styleContent).toContain('margin: 0');
    expect(styleContent).toContain('padding: 0');
  });
}); 