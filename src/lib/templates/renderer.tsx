import React from 'react';
import { ResumeTemplate } from '@/types/template';

export interface ResumeData {
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description: string;
    location?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    graduationDate?: string;
    gpa?: string;
    location?: string;
  }>;
  skills: Array<{
    name: string;
    category?: string;
    level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies?: string[];
    url?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date?: string;
    url?: string;
  }>;
}

export interface TemplateRendererProps {
  template: ResumeTemplate;
  data: ResumeData;
  customizations?: Partial<ResumeTemplate['styles']>;
}

// Professional Template Component
export const ProfessionalTemplate: React.FC<TemplateRendererProps> = ({ template, data, customizations }) => {
  const styles = { ...template.styles, ...customizations };
  
  return (
    <div className="resume-professional" style={{
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize.base,
      color: styles.colors.text,
      backgroundColor: styles.colors.background,
      lineHeight: styles.spacing.line,
      maxWidth: '8.5in',
      margin: '0 auto',
      padding: `${template.layout.margins.top} ${template.layout.margins.right} ${template.layout.margins.bottom} ${template.layout.margins.left}`,
    }}>
      {/* Header */}
      <header className="resume-header" style={{ marginBottom: styles.spacing.section }}>
        <h1 style={{
          fontSize: styles.fontSize.heading1,
          color: styles.colors.primary,
          margin: '0 0 0.5rem 0',
          fontWeight: 'bold'
        }}>
          {data.personalInfo.name || 'Your Name'}
        </h1>
        <div className="contact-info" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: styles.fontSize.base,
          color: styles.colors.secondary
        }}>
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.address && <span>{data.personalInfo.address}</span>}
          {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="resume-summary" style={{ marginBottom: styles.spacing.section }}>
          <h2 style={{
            fontSize: styles.fontSize.heading2,
            color: styles.colors.primary,
            margin: '0 0 0.75rem 0',
            borderBottom: `2px solid ${styles.colors.accent}`,
            paddingBottom: '0.25rem'
          }}>
            Professional Summary
          </h2>
          <p style={{ margin: 0, lineHeight: styles.spacing.line }}>
            {data.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className="resume-experience" style={{ marginBottom: styles.spacing.section }}>
          <h2 style={{
            fontSize: styles.fontSize.heading2,
            color: styles.colors.primary,
            margin: '0 0 0.75rem 0',
            borderBottom: `2px solid ${styles.colors.accent}`,
            paddingBottom: '0.25rem'
          }}>
            Professional Experience
          </h2>
          {data.experience.map((exp, index) => (
            <div key={index} style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{
                    fontSize: styles.fontSize.heading3,
                    color: styles.colors.primary,
                    margin: '0 0 0.25rem 0',
                    fontWeight: 'bold'
                  }}>
                    {exp.position}
                  </h3>
                  <h4 style={{
                    fontSize: styles.fontSize.base,
                    color: styles.colors.secondary,
                    margin: '0 0 0.5rem 0',
                    fontWeight: 'normal'
                  }}>
                    {exp.company} {exp.location && `• ${exp.location}`}
                  </h4>
                </div>
                <div style={{
                  fontSize: styles.fontSize.base,
                  color: styles.colors.secondary,
                  textAlign: 'right'
                }}>
                  {exp.startDate} - {exp.endDate || 'Present'}
                </div>
              </div>
              <div style={{
                marginTop: '0.5rem',
                whiteSpace: 'pre-line',
                lineHeight: styles.spacing.line
              }}>
                {exp.description}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section className="resume-education" style={{ marginBottom: styles.spacing.section }}>
          <h2 style={{
            fontSize: styles.fontSize.heading2,
            color: styles.colors.primary,
            margin: '0 0 0.75rem 0',
            borderBottom: `2px solid ${styles.colors.accent}`,
            paddingBottom: '0.25rem'
          }}>
            Education
          </h2>
          {data.education.map((edu, index) => (
            <div key={index} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{
                    fontSize: styles.fontSize.heading3,
                    color: styles.colors.primary,
                    margin: '0 0 0.25rem 0',
                    fontWeight: 'bold'
                  }}>
                    {edu.degree}
                  </h3>
                  <h4 style={{
                    fontSize: styles.fontSize.base,
                    color: styles.colors.secondary,
                    margin: 0,
                    fontWeight: 'normal'
                  }}>
                    {edu.institution} {edu.location && `• ${edu.location}`}
                  </h4>
                </div>
                <div style={{
                  fontSize: styles.fontSize.base,
                  color: styles.colors.secondary,
                  textAlign: 'right'
                }}>
                  {edu.graduationDate}
                  {edu.gpa && <div>GPA: {edu.gpa}</div>}
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <section className="resume-skills" style={{ marginBottom: styles.spacing.section }}>
          <h2 style={{
            fontSize: styles.fontSize.heading2,
            color: styles.colors.primary,
            margin: '0 0 0.75rem 0',
            borderBottom: `2px solid ${styles.colors.accent}`,
            paddingBottom: '0.25rem'
          }}>
            Skills
          </h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            {data.skills.map((skill, index) => (
              <span key={index} style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                backgroundColor: '#f8f9fa',
                border: `1px solid ${styles.colors.accent}`,
                borderRadius: '4px',
                fontSize: styles.fontSize.base,
                color: styles.colors.text
              }}>
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// Modern Template Component (Two-column layout)
export const ModernTemplate: React.FC<TemplateRendererProps> = ({ template, data, customizations }) => {
  const styles = { ...template.styles, ...customizations };
  
  return (
    <div className="resume-modern" style={{
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize.base,
      color: styles.colors.text,
      backgroundColor: styles.colors.background,
      lineHeight: styles.spacing.line,
      maxWidth: '8.5in',
      margin: '0 auto',
      padding: `${template.layout.margins.top} ${template.layout.margins.right} ${template.layout.margins.bottom} ${template.layout.margins.left}`,
      display: 'grid',
      gridTemplateColumns: '1fr 2fr',
      gap: '2rem'
    }}>
      {/* Left Column */}
      <div className="left-column" style={{
        backgroundColor: '#f8f9fa',
        padding: '1.5rem',
        borderRadius: '8px'
      }}>
        {/* Header */}
        <header className="resume-header" style={{ marginBottom: styles.spacing.section }}>
          <h1 style={{
            fontSize: styles.fontSize.heading1,
            color: styles.colors.primary,
            margin: '0 0 1rem 0',
            fontWeight: 'bold'
          }}>
            {data.personalInfo.name || 'Your Name'}
          </h1>
          <div className="contact-info" style={{
            fontSize: styles.fontSize.base,
            color: styles.colors.secondary,
            lineHeight: '1.6'
          }}>
            {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
            {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
            {data.personalInfo.address && <div>{data.personalInfo.address}</div>}
            {data.personalInfo.linkedin && <div>{data.personalInfo.linkedin}</div>}
          </div>
        </header>

        {/* Skills */}
        {data.skills.length > 0 && (
          <section className="resume-skills" style={{ marginBottom: styles.spacing.section }}>
            <h2 style={{
              fontSize: styles.fontSize.heading2,
              color: styles.colors.primary,
              margin: '0 0 1rem 0',
              borderBottom: `2px solid ${styles.colors.accent}`,
              paddingBottom: '0.25rem'
            }}>
              Skills
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {data.skills.map((skill, index) => (
                <div key={index} style={{
                  padding: '0.5rem',
                  backgroundColor: styles.colors.background,
                  borderRadius: '4px',
                  fontSize: styles.fontSize.base
                }}>
                  {skill.name}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <section className="resume-education">
            <h2 style={{
              fontSize: styles.fontSize.heading2,
              color: styles.colors.primary,
              margin: '0 0 1rem 0',
              borderBottom: `2px solid ${styles.colors.accent}`,
              paddingBottom: '0.25rem'
            }}>
              Education
            </h2>
            {data.education.map((edu, index) => (
              <div key={index} style={{ marginBottom: '1rem' }}>
                <h3 style={{
                  fontSize: styles.fontSize.heading3,
                  color: styles.colors.primary,
                  margin: '0 0 0.25rem 0',
                  fontWeight: 'bold'
                }}>
                  {edu.degree}
                </h3>
                <h4 style={{
                  fontSize: styles.fontSize.base,
                  color: styles.colors.secondary,
                  margin: '0 0 0.25rem 0',
                  fontWeight: 'normal'
                }}>
                  {edu.institution}
                </h4>
                <div style={{
                  fontSize: styles.fontSize.base,
                  color: styles.colors.secondary
                }}>
                  {edu.graduationDate}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>

      {/* Right Column */}
      <div className="right-column">
        {/* Summary */}
        {data.summary && (
          <section className="resume-summary" style={{ marginBottom: styles.spacing.section }}>
            <h2 style={{
              fontSize: styles.fontSize.heading2,
              color: styles.colors.primary,
              margin: '0 0 1rem 0',
              borderBottom: `2px solid ${styles.colors.accent}`,
              paddingBottom: '0.25rem'
            }}>
              Professional Summary
            </h2>
            <p style={{ margin: 0, lineHeight: styles.spacing.line }}>
              {data.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <section className="resume-experience">
            <h2 style={{
              fontSize: styles.fontSize.heading2,
              color: styles.colors.primary,
              margin: '0 0 1rem 0',
              borderBottom: `2px solid ${styles.colors.accent}`,
              paddingBottom: '0.25rem'
            }}>
              Professional Experience
            </h2>
            {data.experience.map((exp, index) => (
              <div key={index} style={{ marginBottom: '2rem' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <h3 style={{
                    fontSize: styles.fontSize.heading3,
                    color: styles.colors.primary,
                    margin: '0 0 0.25rem 0',
                    fontWeight: 'bold'
                  }}>
                    {exp.position}
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4 style={{
                      fontSize: styles.fontSize.base,
                      color: styles.colors.secondary,
                      margin: 0,
                      fontWeight: 'normal'
                    }}>
                      {exp.company}
                    </h4>
                    <span style={{
                      fontSize: styles.fontSize.base,
                      color: styles.colors.secondary
                    }}>
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </span>
                  </div>
                </div>
                <div style={{
                  whiteSpace: 'pre-line',
                  lineHeight: styles.spacing.line
                }}>
                  {exp.description}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

// Minimalist Template Component
export const MinimalistTemplate: React.FC<TemplateRendererProps> = ({ template, data, customizations }) => {
  const styles = { ...template.styles, ...customizations };
  
  return (
    <div className="resume-minimalist" style={{
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize.base,
      color: styles.colors.text,
      backgroundColor: styles.colors.background,
      lineHeight: styles.spacing.line,
      maxWidth: '8.5in',
      margin: '0 auto',
      padding: `${template.layout.margins.top} ${template.layout.margins.right} ${template.layout.margins.bottom} ${template.layout.margins.left}`,
    }}>
      {/* Header */}
      <header className="resume-header" style={{ 
        marginBottom: styles.spacing.section,
        textAlign: 'center',
        borderBottom: `1px solid ${styles.colors.secondary}`,
        paddingBottom: '1rem'
      }}>
        <h1 style={{
          fontSize: styles.fontSize.heading1,
          color: styles.colors.primary,
          margin: '0 0 0.5rem 0',
          fontWeight: 'normal',
          letterSpacing: '2px'
        }}>
          {data.personalInfo.name || 'YOUR NAME'}
        </h1>
        <div className="contact-info" style={{
          fontSize: styles.fontSize.base,
          color: styles.colors.secondary,
          letterSpacing: '1px'
        }}>
          {[data.personalInfo.email, data.personalInfo.phone, data.personalInfo.address]
            .filter(Boolean)
            .join(' • ')}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="resume-summary" style={{ marginBottom: styles.spacing.section }}>
          <p style={{ 
            margin: 0, 
            lineHeight: styles.spacing.line,
            fontStyle: 'italic',
            textAlign: 'center',
            color: styles.colors.secondary
          }}>
            {data.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className="resume-experience" style={{ marginBottom: styles.spacing.section }}>
          <h2 style={{
            fontSize: styles.fontSize.heading2,
            color: styles.colors.primary,
            margin: '0 0 1.5rem 0',
            textAlign: 'center',
            letterSpacing: '3px',
            fontWeight: 'normal'
          }}>
            EXPERIENCE
          </h2>
          {data.experience.map((exp, index) => (
            <div key={index} style={{ marginBottom: '2rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h3 style={{
                  fontSize: styles.fontSize.heading3,
                  color: styles.colors.primary,
                  margin: '0 0 0.5rem 0',
                  fontWeight: 'bold',
                  letterSpacing: '1px'
                }}>
                  {exp.position}
                </h3>
                <div style={{
                  fontSize: styles.fontSize.base,
                  color: styles.colors.secondary,
                  letterSpacing: '1px'
                }}>
                  {exp.company} • {exp.startDate} - {exp.endDate || 'Present'}
                </div>
              </div>
              <div style={{
                whiteSpace: 'pre-line',
                lineHeight: styles.spacing.line,
                textAlign: 'justify'
              }}>
                {exp.description}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Education & Skills in two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        {/* Education */}
        {data.education.length > 0 && (
          <section className="resume-education">
            <h2 style={{
              fontSize: styles.fontSize.heading2,
              color: styles.colors.primary,
              margin: '0 0 1rem 0',
              textAlign: 'center',
              letterSpacing: '3px',
              fontWeight: 'normal'
            }}>
              EDUCATION
            </h2>
            {data.education.map((edu, index) => (
              <div key={index} style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <h3 style={{
                  fontSize: styles.fontSize.heading3,
                  color: styles.colors.primary,
                  margin: '0 0 0.25rem 0',
                  fontWeight: 'bold'
                }}>
                  {edu.degree}
                </h3>
                <div style={{
                  fontSize: styles.fontSize.base,
                  color: styles.colors.secondary
                }}>
                  {edu.institution}
                </div>
                <div style={{
                  fontSize: styles.fontSize.base,
                  color: styles.colors.secondary
                }}>
                  {edu.graduationDate}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <section className="resume-skills">
            <h2 style={{
              fontSize: styles.fontSize.heading2,
              color: styles.colors.primary,
              margin: '0 0 1rem 0',
              textAlign: 'center',
              letterSpacing: '3px',
              fontWeight: 'normal'
            }}>
              SKILLS
            </h2>
            <div style={{ textAlign: 'center' }}>
              {data.skills.map((skill, index) => (
                <span key={index}>
                  {skill.name}
                  {index < data.skills.length - 1 && ' • '}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

// Template renderer factory
export const renderTemplate = (templateId: string, template: ResumeTemplate, data: ResumeData, customizations?: Partial<ResumeTemplate['styles']>) => {
  const props = { template, data, customizations };
  
  switch (templateId) {
    case 'professional':
      return React.createElement(ProfessionalTemplate, props);
    case 'modern':
      return React.createElement(ModernTemplate, props);
    case 'minimalist':
      return React.createElement(MinimalistTemplate, props);
    default:
      return React.createElement(ProfessionalTemplate, props);
  }
};