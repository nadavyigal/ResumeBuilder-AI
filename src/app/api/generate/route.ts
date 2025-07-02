import { NextRequest, NextResponse } from 'next/server';
import { generateResumeContent } from '../../../lib/openai';
import { extractKeywords, extractSkillRequirements } from '../../../lib/jobDescriptionParser';
import { analyzeResume, scoreResumeRelevance } from '../../../lib/resumeAnalyzer';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

// In-memory rate limiting (consider using Redis for production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Response cache for identical requests
const responseCache = new Map<string, { response: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
 * Clean up old rate limit entries and cache
 */
function cleanup() {
  const now = Date.now();
  
  // Clean rate limits
  const rateLimitEntriesToDelete: string[] = [];
  rateLimitMap.forEach((limit, ip) => {
    if (now > limit.resetTime) {
      rateLimitEntriesToDelete.push(ip);
    }
  });
  rateLimitEntriesToDelete.forEach(ip => rateLimitMap.delete(ip));

  // Clean cache
  const cacheEntriesToDelete: string[] = [];
  responseCache.forEach((cached, key) => {
    if (now - cached.timestamp > CACHE_TTL) {
      cacheEntriesToDelete.push(key);
    }
  });
  cacheEntriesToDelete.forEach(key => responseCache.delete(key));
}

/**
 * Generate cache key for request
 */
function generateCacheKey(resume: string, jobDescription: string): string {
  const hash = require('crypto')
    .createHash('sha256')
    .update(resume + jobDescription)
    .digest('hex');
  return hash.substring(0, 16);
}

/**
 * POST /api/generate
 * Generate optimized resume content based on job description
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': '60'
          }
        }
      );
    }

    // Clean up old entries periodically
    if (Math.random() < 0.1) { // 10% chance to clean up
      cleanup();
    }

    // Parse request body efficiently
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

    // Check cache for identical requests
    const cacheKey = generateCacheKey(resume.trim(), jobDescription.trim());
    const cached = responseCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && now - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.response, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=300',
          'X-Processing-Time': `${Date.now() - startTime}ms`
        }
      });
    }

    // Extract keywords from job description (parallelizable)
    const [keywords, skillRequirements] = await Promise.all([
      Promise.resolve(extractKeywords(jobDescription)),
      Promise.resolve(extractSkillRequirements(jobDescription))
    ]);
    
    // Analyze resume against keywords
    const relevantSections = analyzeResume(resume, keywords);
    const relevanceScore = scoreResumeRelevance(resume, keywords);

    // Log analysis results for monitoring
    console.log('Resume analysis:', {
      keywords: keywords.length,
      relevantSections: relevantSections.length,
      relevanceScore,
      processingTime: Date.now() - startTime
    });

    // Generate optimized content using OpenAI
    const optimizedContent = await generateResumeContent(
      resume,
      jobDescription,
      relevantSections
    );

    const response = {
      optimizedContent,
      analysis: {
        keywords,
        relevantSections,
        relevanceScore,
        skillRequirements,
        suggestions: generateSuggestions(relevantSections, keywords)
      }
    };

    // Cache the response
    responseCache.set(cacheKey, {
      response,
      timestamp: now
    });

    // Return response with optimized headers
    return NextResponse.json(response, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=300',
        'X-Processing-Time': `${Date.now() - startTime}ms`,
        'Content-Type': 'application/json; charset=utf-8'
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
      { 
        status: 500,
        headers: {
          'X-Processing-Time': `${Date.now() - startTime}ms`
        }
      }
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

  const matchPercentage = foundKeywords.length / allKeywords.length;
  
  if (matchPercentage < 0.3) {
    suggestions.push('Your resume could better match the job description. Consider highlighting more relevant experience.');
  }

  if (matchPercentage > 0.7) {
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
      'Access-Control-Max-Age': '86400'
    },
  });
} 