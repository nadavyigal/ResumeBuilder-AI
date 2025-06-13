import { describe, it, expect } from 'vitest';
import { PDFGenerator } from '@/lib/pdf/generator';
import { templates } from '@/lib/templates';

describe('PDFGenerator', () => {
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

  it('generates HTML with correct template styles', async () => {
    const template = templates[0]; // Professional template
    const customizations = {};

    const html = await PDFGenerator.generatePDF({
      template,
      resumeData: mockResumeData,
      customizations,
    });

    // Check if HTML contains template styles
    expect(html).toContain(`font-family: ${template.styles.fontFamily}`);
    expect(html).toContain(`color: ${template.styles.colors.primary}`);
    expect(html).toContain(`font-size: ${template.styles.fontSize.base}`);
  });

  it('applies customizations correctly', async () => {
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

    const html = await PDFGenerator.generatePDF({
      template,
      resumeData: mockResumeData,
      customizations,
    });

    // Check if customizations are applied
    expect(html).toContain('font-family: Times New Roman, serif');
    expect(html).toContain('color: #ff0000');
  });

  it('includes all resume sections in the output', async () => {
    const template = templates[0];
    const html = await PDFGenerator.generatePDF({
      template,
      resumeData: mockResumeData,
      customizations: {},
    });

    // Check if all sections are present
    expect(html).toContain('John Doe');
    expect(html).toContain('john@example.com');
    expect(html).toContain('Senior Developer');
    expect(html).toContain('Tech Corp');
    expect(html).toContain('Bachelor of Science');
    expect(html).toContain('JavaScript');
  });

  it('handles missing resume data gracefully', async () => {
    const template = templates[0];
    const incompleteData = {
      personal: {
        fullName: 'John Doe',
      },
    };

    const html = await PDFGenerator.generatePDF({
      template,
      resumeData: incompleteData,
      customizations: {},
    });

    // Should still render without errors
    expect(html).toContain('John Doe');
    expect(html).not.toContain('undefined');
    expect(html).not.toContain('null');
  });

  it('validates ATS compatibility correctly', () => {
    const htmlWithImages = `
      <div>
        <img src="profile.jpg" alt="Profile" />
        <p>Some text</p>
      </div>
    `;

    const htmlWithTables = `
      <div>
        <table>
          <tr><td>Some data</td></tr>
        </table>
      </div>
    `;

    const htmlWithSpecialChars = `
      <div>
        <p>Text with special characters: ★ ☆ ♥</p>
      </div>
    `;

    const cleanHtml = `
      <div>
        <p>Clean, ATS-friendly text</p>
      </div>
    `;

    // Test with images
    const imageValidation = PDFGenerator.validateATSCompatibility(htmlWithImages);
    expect(imageValidation.isValid).toBe(false);
    expect(imageValidation.issues).toContain('Contains images which may not be readable by ATS');

    // Test with tables
    const tableValidation = PDFGenerator.validateATSCompatibility(htmlWithTables);
    expect(tableValidation.isValid).toBe(false);
    expect(tableValidation.issues).toContain('Contains tables which may cause parsing issues');

    // Test with special characters
    const specialCharValidation = PDFGenerator.validateATSCompatibility(htmlWithSpecialChars);
    expect(specialCharValidation.isValid).toBe(false);
    expect(specialCharValidation.issues).toContain('Contains special characters that may not be parsed correctly');

    // Test with clean HTML
    const cleanValidation = PDFGenerator.validateATSCompatibility(cleanHtml);
    expect(cleanValidation.isValid).toBe(true);
    expect(cleanValidation.issues).toHaveLength(0);
  });
}); 