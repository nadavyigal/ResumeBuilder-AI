import { ResumeTemplate } from '@/types/template';

interface GeneratePDFOptions {
  template: ResumeTemplate;
  resumeData: any;
  customizations?: any;
}

export class PDFGenerator {
  /**
   * Generate PDF from resume data and template
   * For now, this will generate HTML that can be printed to PDF
   * In production, we would use Puppeteer or similar
   */
  static async generatePDF(options: GeneratePDFOptions): Promise<string> {
    const { template, resumeData, customizations = {} } = options;
    
    // Merge template styles with customizations
    const styles = {
      ...template.styles,
      ...customizations,
    };

    // Generate HTML content
    const html = this.generateHTML(template, resumeData, styles);
    
    // Return HTML for now - in production, this would use Puppeteer to generate actual PDF
    return html;
  }

  private static generateHTML(template: ResumeTemplate, resumeData: any, styles: any): string {
    const sections = this.generateSections(template, resumeData);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${resumeData.personal?.fullName || 'Resume'}</title>
  <style>
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
    
    body {
      font-family: ${styles.fontFamily};
      font-size: ${styles.fontSize.base};
      color: ${styles.colors.text};
      background-color: ${styles.colors.background};
      line-height: ${styles.spacing.line};
      margin: 0;
      padding: 0;
    }
    
    .resume-container {
      max-width: 8.5in;
      margin: 0 auto;
      padding: ${template.layout.margins.top} ${template.layout.margins.right} ${template.layout.margins.bottom} ${template.layout.margins.left};
      background: white;
      min-height: 11in;
    }
    
    h1 {
      font-size: ${styles.fontSize.heading1};
      color: ${styles.colors.primary};
      margin: 0 0 0.5rem 0;
    }
    
    h2 {
      font-size: ${styles.fontSize.heading2};
      color: ${styles.colors.primary};
      margin: ${styles.spacing.section} 0 0.75rem 0;
      ${styles.borders ? `border-bottom: ${styles.borders.width} ${styles.borders.style} ${styles.borders.color};` : ''}
      padding-bottom: ${styles.borders ? '0.5rem' : '0'};
    }
    
    h3 {
      font-size: ${styles.fontSize.heading3};
      color: ${styles.colors.secondary};
      margin: 0 0 0.5rem 0;
    }
    
    p {
      margin: 0 0 ${styles.spacing.paragraph} 0;
    }
    
    .section {
      margin-bottom: ${styles.spacing.section};
    }
    
    .accent {
      color: ${styles.colors.accent};
    }
    
    .contact-info {
      color: ${styles.colors.secondary};
      margin-bottom: 1rem;
    }
    
    .experience-item, .education-item {
      margin-bottom: 1.5rem;
    }
    
    ${template.layout.columns === 2 ? `
      .content-wrapper {
        display: grid;
        grid-template-columns: ${template.layout.headerPosition === 'left' ? '1fr 2fr' : '2fr 1fr'};
        gap: 2rem;
      }
    ` : ''}
    
    ul {
      margin: 0;
      padding-left: 1.5rem;
    }
    
    li {
      margin-bottom: 0.25rem;
    }
  </style>
</head>
<body>
  <div class="resume-container">
    ${template.layout.columns === 1 ? sections.join('') : this.generateTwoColumnLayout(template, sections)}
  </div>
</body>
</html>
    `;
  }

  private static generateSections(template: ResumeTemplate, resumeData: any): string[] {
    const sectionGenerators: Record<string, () => string> = {
      header: () => `
        <div class="section header">
          <h1>${resumeData.personal?.fullName || 'Your Name'}</h1>
          <div class="contact-info">
            ${[
              resumeData.personal?.email,
              resumeData.personal?.phone,
              resumeData.personal?.location
            ].filter(Boolean).join(' | ')}
          </div>
        </div>
      `,
      
      summary: () => resumeData.personal?.summary ? `
        <div class="section">
          <h2>Professional Summary</h2>
          <p>${resumeData.personal.summary}</p>
        </div>
      ` : '',
      
      experience: () => resumeData.experience?.length > 0 ? `
        <div class="section">
          <h2>Work Experience</h2>
          ${resumeData.experience.map((exp: any) => `
            <div class="experience-item">
              <h3>${exp.title}</h3>
              <div class="accent">${exp.company} | ${exp.duration}</div>
              <p>${exp.description}</p>
            </div>
          `).join('')}
        </div>
      ` : '',
      
      education: () => resumeData.education?.length > 0 ? `
        <div class="section">
          <h2>Education</h2>
          ${resumeData.education.map((edu: any) => `
            <div class="education-item">
              <h3>${edu.degree}</h3>
              <div class="accent">${edu.school} | ${edu.year}</div>
              ${edu.details ? `<p>${edu.details}</p>` : ''}
            </div>
          `).join('')}
        </div>
      ` : '',
      
      skills: () => resumeData.skills?.length > 0 ? `
        <div class="section">
          <h2>Skills</h2>
          <p>${resumeData.skills.join(' • ')}</p>
        </div>
      ` : '',
    };

    return template.layout.sectionOrder
      .map(section => sectionGenerators[section]?.() || '')
      .filter(Boolean);
  }

  private static generateTwoColumnLayout(template: ResumeTemplate, sections: string[]): string {
    // For two-column layouts, we need to reorganize sections
    // This is a simplified version - in production, this would be more sophisticated
    return `<div class="content-wrapper">${sections.join('')}</div>`;
  }

  /**
   * Validate that the generated PDF will be ATS-friendly
   */
  static validateATSCompatibility(html: string): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check for images (ATS systems often can't read images)
    if (html.includes('<img')) {
      issues.push('Contains images which may not be readable by ATS');
    }
    
    // Check for tables (complex tables can confuse ATS)
    if (html.includes('<table')) {
      issues.push('Contains tables which may cause parsing issues');
    }
    
    // Check for special characters that might cause issues
    const problematicChars = /[^\x00-\x7F]/g;
    if (problematicChars.test(html)) {
      issues.push('Contains special characters that may not be parsed correctly');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
    };
  }
} 