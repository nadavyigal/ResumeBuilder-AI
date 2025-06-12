import { describe, it, expect } from 'vitest';
import { extractKeywords } from '../../lib/jobDescriptionParser';

describe('Job Description Parser', () => {
  it('should extract keywords from job description', () => {
    const jobDescription = 'Looking for a Senior React Developer with TypeScript experience';
    const keywords = extractKeywords(jobDescription);
    expect(keywords).toContain('senior');
    expect(keywords).toContain('react');
    expect(keywords).toContain('developer');
    expect(keywords).toContain('typescript');
  });

  it('should handle empty job description', () => {
    const keywords = extractKeywords('');
    expect(keywords).toEqual([]);
  });

  it('should remove duplicate keywords', () => {
    const jobDescription = 'React React Developer Developer';
    const keywords = extractKeywords(jobDescription);
    expect(keywords).toEqual(['react', 'developer']);
  });
}); 