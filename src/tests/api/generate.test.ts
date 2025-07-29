import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../../app/api/generate/route';
import { generateResumeContent } from '../../lib/openai';
import { extractKeywords, extractSkillRequirements } from '../../lib/jobDescriptionParser';
import { analyzeResume, scoreResumeRelevance } from '../../lib/resumeAnalyzer';

// Mock dependencies
vi.mock('../../lib/openai');
vi.mock('../../lib/jobDescriptionParser');
vi.mock('../../lib/resumeAnalyzer');
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn()
}));

describe('Generate API Endpoint', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Mock authenticated user
    const { createClient } = await import('@/utils/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user123' } },
          error: null,
        }),
      },
    } as any);
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
    (extractSkillRequirements as any).mockReturnValue(['React', 'JavaScript']);
    (analyzeResume as any).mockReturnValue(['React']);
    (scoreResumeRelevance as any).mockReturnValue(0.8);
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
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.error).toContain('Resume is required');
  });

  it('should handle API errors gracefully', async () => {
    const mockRequest = new NextRequest('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        resume: 'Different sample resume content to avoid cache',
        jobDescription: 'Looking for a unique position to avoid cache'
      })
    });

    // Mock the functions that run before generateResumeContent
    (extractKeywords as any).mockReturnValue(['React', 'Developer']);
    (extractSkillRequirements as any).mockReturnValue(['React', 'JavaScript']);
    (analyzeResume as any).mockReturnValue(['React']);
    (scoreResumeRelevance as any).mockReturnValue(0.8);
    (generateResumeContent as any).mockRejectedValue(new Error('API Error'));

    const response = await POST(mockRequest);
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });
}); 