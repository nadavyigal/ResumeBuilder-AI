'use client';

import { ResumeTemplate, TemplateStyles } from '@/types/template';
import { useEffect, useRef } from 'react';

interface TemplatePreviewProps {
  template: ResumeTemplate;
  resumeData: any;
  customizations?: Partial<TemplateStyles>;
  className?: string;
}

export default function TemplatePreview({
  template,
  resumeData,
  customizations = {},
  className = '',
}: TemplatePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Merge template styles with customizations
  const styles = {
    ...template.styles,
    ...customizations,
  };

  // Generate CSS for the template
  const generateTemplateCSS = () => {
    return `
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        .no-print {
          display: none !important;
        }
        .resume-preview {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
      
      .resume-preview {
        font-family: ${styles.fontFamily};
        font-size: ${styles.fontSize.base};
        color: ${styles.colors.text};
        background-color: ${styles.colors.background};
        line-height: ${styles.spacing.line};
        padding: ${template.layout.margins.top} ${template.layout.margins.right} ${template.layout.margins.bottom} ${template.layout.margins.left};
      }
      
      .resume-preview h1 {
        font-size: ${styles.fontSize.heading1};
        color: ${styles.colors.primary};
        margin-bottom: 0.5rem;
      }
      
      .resume-preview h2 {
        font-size: ${styles.fontSize.heading2};
        color: ${styles.colors.primary};
        margin-top: ${styles.spacing.section};
        margin-bottom: 0.75rem;
        ${styles.borders ? `border-bottom: ${styles.borders.width} ${styles.borders.style} ${styles.borders.color};` : ''}
        padding-bottom: ${styles.borders ? '0.5rem' : '0'};
      }
      
      .resume-preview h3 {
        font-size: ${styles.fontSize.heading3};
        color: ${styles.colors.secondary};
        margin-bottom: 0.5rem;
      }
      
      .resume-preview p {
        margin-bottom: ${styles.spacing.paragraph};
      }
      
      .resume-preview .section {
        margin-bottom: ${styles.spacing.section};
      }
      
      .resume-preview .accent {
        color: ${styles.colors.accent};
      }
      
      ${template.layout.columns === 2 ? `
        .resume-preview .content-wrapper {
          display: grid;
          grid-template-columns: ${template.layout.headerPosition === 'left' ? '1fr 2fr' : '2fr 1fr'};
          gap: 2rem;
        }
      ` : ''}
    `;
  };

  // Render resume sections based on template layout
  const renderSection = (sectionType: string) => {
    switch (sectionType) {
      case 'header':
        return (
          <div key="header" className="section header">
            <h1>{resumeData.personal?.fullName || 'Your Name'}</h1>
            <div className="contact-info">
              {resumeData.personal?.email && <span>{resumeData.personal.email}</span>}
              {resumeData.personal?.phone && <span> | {resumeData.personal.phone}</span>}
              {resumeData.personal?.location && <span> | {resumeData.personal.location}</span>}
            </div>
          </div>
        );
      
      case 'summary':
        return resumeData.personal?.summary ? (
          <div key="summary" className="section">
            <h2>Professional Summary</h2>
            <p>{resumeData.personal.summary}</p>
          </div>
        ) : null;
      
      case 'experience':
        return resumeData.experience?.length > 0 ? (
          <div key="experience" className="section">
            <h2>Work Experience</h2>
            {resumeData.experience.map((exp: any, index: number) => (
              <div key={index} className="experience-item">
                <h3>{exp.title}</h3>
                <div className="accent">{exp.company} | {exp.duration}</div>
                <p>{exp.description}</p>
              </div>
            ))}
          </div>
        ) : null;
      
      case 'education':
        return resumeData.education?.length > 0 ? (
          <div key="education" className="section">
            <h2>Education</h2>
            {resumeData.education.map((edu: any, index: number) => (
              <div key={index} className="education-item">
                <h3>{edu.degree}</h3>
                <div className="accent">{edu.school} | {edu.year}</div>
                {edu.details && <p>{edu.details}</p>}
              </div>
            ))}
          </div>
        ) : null;
      
      case 'skills':
        return resumeData.skills?.length > 0 ? (
          <div key="skills" className="section">
            <h2>Skills</h2>
            <p>{resumeData.skills.join(' • ')}</p>
          </div>
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <div className={`template-preview ${className}`}>
      <style dangerouslySetInnerHTML={{ __html: generateTemplateCSS() }} />
      <div ref={previewRef} className="resume-preview" data-testid="resume-preview">
        {template.layout.columns === 1 ? (
          // Single column layout
          <div>
            {template.layout.sectionOrder.map(section => renderSection(section))}
          </div>
        ) : (
          // Two column layout
          <div className="content-wrapper" data-testid="content-wrapper">
            {template.layout.headerPosition === 'left' ? (
              <>
                <div className="sidebar">
                  {renderSection('header')}
                  {template.layout.sectionOrder.includes('skills') && renderSection('skills')}
                  {template.layout.sectionOrder.includes('education') && renderSection('education')}
                </div>
                <div className="main">
                  {template.layout.sectionOrder
                    .filter(s => !['header', 'skills', 'education'].includes(s))
                    .map(section => renderSection(section))}
                </div>
              </>
            ) : (
              <>
                <div className="main">
                  {renderSection('header')}
                  {template.layout.sectionOrder
                    .filter(s => s !== 'header')
                    .map(section => renderSection(section))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 