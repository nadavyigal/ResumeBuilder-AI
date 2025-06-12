import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../../app/api/generate/route';
import { generateResumeContent } from '../../lib/openai';
import { extractKeywords } from '../../lib/jobDescriptionParser';
import { analyzeResume } from '../../lib/resumeAnalyzer';

// Mock dependencies
vi.mock('../../lib/openai');
vi.mock('../../lib/jobDescriptionParser');
vi.mock('../../lib/resumeAnalyzer');

describe('Generate API Endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate optimized resume content', async () => {
    const mockRequest = new NextRequest('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        resume: 'Sample resume content',
        jobDescription: 'Looking for React Developer'
      })
    });

    // Mock responses
    (extractKeywords as any).mockReturnValue(['React', 'Developer']);
    (analyzeResume as any).mockReturnValue(['React']);
    (generateResumeContent as any).mockResolvedValue('Optimized content');

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('optimizedContent', 'Optimized content');
  });

  it('should handle invalid request body', async () => {
    const mockRequest = new NextRequest('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);
  });

  it('should handle API errors gracefully', async () => {
    const mockRequest = new NextRequest('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        resume: 'Sample resume content',
        jobDescription: 'Looking for React Developer'
      })
    });

    (generateResumeContent as any).mockRejectedValue(new Error('API Error'));

    const response = await POST(mockRequest);
    expect(response.status).toBe(500);
  });
}); 