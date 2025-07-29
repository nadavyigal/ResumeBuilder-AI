import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/export-pdf/route';
import { createClient } from '@/utils/supabase/server';
import { getTemplateById } from '@/lib/templates';
import { PDFGenerator } from '@/lib/pdf/generator';
import { renderToStaticMarkup } from 'react-dom/server';
import puppeteer from 'puppeteer';

// Mock Supabase server client
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Mock templates
vi.mock('@/lib/templates', () => ({
  getTemplateById: vi.fn(),
}));

// Mock PDF Generator
vi.mock('@/lib/pdf/generator', () => ({
  PDFGenerator: {
    generatePDF: vi.fn(),
  },
}));

// Mock React DOM server
vi.mock('react-dom/server', () => ({
  renderToStaticMarkup: vi.fn(),
}));

// Mock template renderers
vi.mock('@/lib/templates/renderer', () => ({
  ProfessionalTemplate: vi.fn(() => '<div>Professional Template</div>'),
  ModernTemplate: vi.fn(() => '<div>Modern Template</div>'),
  MinimalistTemplate: vi.fn(() => '<div>Minimalist Template</div>'),
}));

// Mock Puppeteer
vi.mock('puppeteer', () => ({
  default: {
    launch: vi.fn(),
  },
}));

// Mock data
const mockResumeData = {
  id: '123',
  content: {
    personal: {
      fullName: 'John Doe',
      email: 'john@example.com',
    },
  },
};

describe('PDF Export API', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    // Mock authenticated user
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user123' } },
          error: null,
        }),
      },
    } as any);
    
    // Mock template
    vi.mocked(getTemplateById).mockReturnValue({
      id: 'professional',
      name: 'Professional',
      styles: {
        fontFamily: 'Arial, sans-serif',
        fontSize: { base: '14px', heading1: '24px', heading2: '18px', heading3: '16px' },
        colors: { primary: '#000', secondary: '#666', text: '#333', background: '#fff', accent: '#0066cc' },
        spacing: { line: '1.6', paragraph: '1rem', section: '1.5rem' },
      },
      layout: {
        columns: 1,
        margins: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
        sectionOrder: ['header', 'summary', 'experience', 'education', 'skills'],
      },
    } as any);
    
    // Mock PDF generator
    vi.mocked(PDFGenerator.generatePDF).mockResolvedValue('<html><body><h1>John Doe</h1><p>john@example.com</p></body></html>');
  });

  it('returns 401 if user is not authenticated', async () => {
    // Mock unauthenticated user
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Not authenticated'),
        }),
      },
    } as any);

    const request = new NextRequest('http://localhost:3000/api/export-pdf', {
      method: 'POST',
      body: JSON.stringify({ resumeId: '123', templateId: 'professional' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Authentication required');
  });

  it('returns 400 if resumeId or templateId is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/export-pdf', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Resume ID and Template ID are required');
  });

  it('returns 404 if template is not found', async () => {
    // Mock template not found
    vi.mocked(getTemplateById).mockReturnValue(null);

    const request = new NextRequest('http://localhost:3000/api/export-pdf', {
      method: 'POST',
      body: JSON.stringify({
        resumeId: '123',
        templateId: 'non-existent-template',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Template not found');
  });

  it('returns 404 if resume is not found', async () => {
    // Mock valid template
    vi.mocked(getTemplateById).mockReturnValue({
      id: 'professional',
      name: 'Professional',
    } as any);

    // Mock resume not found
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user123' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: new Error('Not found'),
              }),
            }),
          }),
        }),
      }),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/export-pdf', {
      method: 'POST',
      body: JSON.stringify({
        resumeId: 'non-existent',
        templateId: 'professional',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Resume not found');
  });

  it('generates PDF HTML successfully', async () => {
    // Mock successful resume fetch
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user123' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockResumeData,
                error: null,
              }),
            }),
          }),
        }),
      }),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/export-pdf', {
      method: 'POST',
      body: JSON.stringify({
        resumeId: '123',
        templateId: 'professional',
        customizations: {
          fontFamily: 'Arial, sans-serif',
          colors: {
            primary: '#000000',
          },
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.html).toBeDefined();
    expect(data.validation).toBeDefined();
    expect(data.message).toContain('PDF generation successful');

    // Check if HTML contains resume data
    expect(data.html).toContain('John Doe');
    expect(data.html).toContain('john@example.com');
  });

  it('includes ATS validation results', async () => {
    // Mock successful resume fetch
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user123' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockResumeData,
                error: null,
              }),
            }),
          }),
        }),
      }),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/export-pdf', {
      method: 'POST',
      body: JSON.stringify({
        resumeId: '123',
        templateId: 'professional',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.validation).toHaveProperty('isValid');
    expect(data.validation).toHaveProperty('issues');
  });

  it('handles server errors gracefully', async () => {
    // Mock Supabase to throw an error
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user123' } },
          error: null,
        }),
      },
      from: vi.fn().mockImplementation(() => {
        throw new Error('Database error');
      }),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/export-pdf', {
      method: 'POST',
      body: JSON.stringify({
        resumeId: '123',
        templateId: 'professional',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to generate PDF');
  });
}); 