import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted to ensure this runs before any imports
const { mockCreate } = vi.hoisted(() => {
  const mockCreate = vi.fn();
  return { mockCreate };
});

// Mock OpenAI before importing the module that uses it
vi.mock('openai', () => {
  class MockAPIError extends Error {
    status: number;
    constructor(message: string, status: number = 500) {
      super(message);
      this.status = status;
    }
  }
  
  return {
    default: vi.fn(() => ({
      chat: {
        completions: {
          create: mockCreate
        }
      },
      apiKey: 'test-key'
    })),
    APIError: MockAPIError
  };
});

// Now import the module that uses OpenAI
import { generateResumeContent } from '../../lib/openai';

describe('OpenAI Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate resume content successfully', async () => {
    mockCreate.mockResolvedValue({
      choices: [{
        message: {
          content: 'Optimized resume content'
        }
      }],
      usage: {
        total_tokens: 100
      }
    });

    const result = await generateResumeContent('Test prompt');
    expect(result).toBe('Optimized resume content');
  });

  it('should handle API errors gracefully', async () => {
    mockCreate.mockRejectedValue(new Error('API Error'));

    await expect(generateResumeContent('Test prompt')).rejects.toThrow('Failed to generate resume content');
  });
}); 