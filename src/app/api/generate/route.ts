import { NextRequest, NextResponse } from 'next/server';
import { generateResumeContent } from '../../../lib/openai';
import { extractKeywords, extractSkillRequirements } from '../../../lib/jobDescriptionParser';
import { analyzeResume, scoreResumeRelevance } from '../../../lib/resumeAnalyzer';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

// In-memory rate limiting (consider using Redis for production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Check rate limit for a given IP
 * @param ip - Client IP address
 * @returns boolean indicating if request is allowed
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or initialize limit
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }

  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  userLimit.count++;
  return true;
}

/**
 * Clean up old rate limit entries
 */
function cleanupRateLimits() {
  const now = Date.now();
  const entriesToDelete: string[] = [];
  
  rateLimitMap.forEach((limit, ip) => {
    if (now > limit.resetTime) {
      entriesToDelete.push(ip);
    }
  });
  
  entriesToDelete.forEach(ip => rateLimitMap.delete(ip));
}

/**
 * POST /api/generate
 * Generate optimized resume content based on job description
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Clean up old rate limit entries periodically
    if (Math.random() < 0.1) { // 10% chance to clean up
      cleanupRateLimits();
    }

    // Parse request body
    const body = await request.json();
    const { resume, jobDescription } = body;

    // Validate input
    if (!resume || typeof resume !== 'string') {
      return NextResponse.json(
        { error: 'Resume is required and must be a string' },
        { status: 400 }
      );
    }

    if (!jobDescription || typeof jobDescription !== 'string') {
      return NextResponse.json(
        { error: 'Job description is required and must be a string' },
        { status: 400 }
      );
    }

    // Check input size limits
    if (resume.length > 10000) {
      return NextResponse.json(
        { error: 'Resume is too long. Maximum 10,000 characters allowed.' },
        { status: 400 }
      );
    }

    if (jobDescription.length > 5000) {
      return NextResponse.json(
        { error: 'Job description is too long. Maximum 5,000 characters allowed.' },
        { status: 400 }
      );
    }

    // Extract keywords from job description
    const keywords = extractKeywords(jobDescription);
    const skillRequirements = extractSkillRequirements(jobDescription);
    
    // Analyze resume against keywords
    const relevantSections = analyzeResume(resume, keywords);
    const relevanceScore = scoreResumeRelevance(resume, keywords);

    // Log analysis results
    console.log('Resume analysis:', {
      keywords: keywords.length,
      relevantSections: relevantSections.length,
      relevanceScore,
      skillRequirements
    });

    // Generate optimized content using OpenAI
    const optimizedContent = await generateResumeContent(
      resume,
      jobDescription,
      relevantSections
    );

    // Return response with generated content and analysis
    return NextResponse.json({
      optimizedContent,
      analysis: {
        keywords,
        relevantSections,
        relevanceScore,
        skillRequirements,
        suggestions: generateSuggestions(relevantSections, keywords)
      }
    });

  } catch (error) {
    console.error('Generate API Error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Rate limit exceeded')) {
        return NextResponse.json(
          { error: error.message },
          { status: 429 }
        );
      }
      
      if (error.message.includes('Invalid API key')) {
        return NextResponse.json(
          { error: 'API configuration error. Please contact support.' },
          { status: 500 }
        );
      }

      if (error.message.includes('Input too large')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Failed to generate resume content. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Generate improvement suggestions based on analysis
 * @param foundKeywords - Keywords found in resume
 * @param allKeywords - All keywords from job description
 * @returns Array of suggestions
 */
function generateSuggestions(foundKeywords: string[], allKeywords: string[]): string[] {
  const suggestions: string[] = [];
  const foundSet = new Set(foundKeywords.map(k => k.toLowerCase()));

  // Identify missing important keywords
  const missingKeywords = allKeywords.filter(k => !foundSet.has(k.toLowerCase()));
  
  if (missingKeywords.length > 0) {
    suggestions.push(`Consider adding these keywords to your resume: ${missingKeywords.slice(0, 5).join(', ')}`);
  }

  if (foundKeywords.length < allKeywords.length * 0.3) {
    suggestions.push('Your resume could better match the job description. Consider highlighting more relevant experience.');
  }

  if (foundKeywords.length > allKeywords.length * 0.7) {
    suggestions.push('Great keyword match! Your resume aligns well with the job requirements.');
  }

  return suggestions;
}

// OPTIONS method for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 