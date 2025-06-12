import { describe, it, expect } from 'vitest';
import { analyzeResume } from '../../lib/resumeAnalyzer';

describe('Resume Analyzer', () => {
  it('should identify relevant sections based on keywords', () => {
    const resume = `
      Experience:
      - Senior React Developer at Tech Corp
      - Full Stack Developer at Startup Inc
      
      Skills:
      - React, TypeScript, Node.js
      - AWS, Docker, Kubernetes
    `;
    
    const keywords = ['React', 'TypeScript', 'AWS'];
    const relevantSections = analyzeResume(resume, keywords);
    
    expect(relevantSections).toContain('React');
    expect(relevantSections).toContain('TypeScript');
    expect(relevantSections).toContain('AWS');
  });

  it('should handle case-insensitive matching', () => {
    const resume = 'Experience with REACT and typescript';
    const keywords = ['react', 'TypeScript'];
    const relevantSections = analyzeResume(resume, keywords);
    
    expect(relevantSections).toContain('react');
    expect(relevantSections).toContain('TypeScript');
  });

  it('should return empty array when no matches found', () => {
    const resume = 'Experience with Python and Java';
    const keywords = ['React', 'TypeScript'];
    const relevantSections = analyzeResume(resume, keywords);
    
    expect(relevantSections).toEqual([]);
  });
}); 