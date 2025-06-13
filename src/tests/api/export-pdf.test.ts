import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/export-pdf/route';
import { supabase } from '@/lib/supabase';

// Mock the entire Supabase module
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
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
    // Mock successful resume fetch
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockResumeData,
            error: null,
          }),
        }),
      }),
    } as any);

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
    // Mock resume not found
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Not found'),
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
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockResumeData,
            error: null,
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
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockResumeData,
            error: null,
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
    vi.mocked(supabase.from).mockImplementation(() => {
      throw new Error('Database error');
    });

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