import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateResumeContent } from '../../../lib/openai';
import { extractKeywords, extractSkillRequirements } from '../../../lib/jobDescriptionParser';
import { analyzeResume, scoreResumeRelevance } from '../../../lib/resumeAnalyzer';
import { withEnvironmentValidation } from '@/lib/api-protection';
import { createHash } from 'crypto';
import { createCORSResponse } from '@/lib/cors';
import { GenerateRequestSchema, validateInput } from '@/lib/validation';
import { createValidationErrorResponse } from '@/lib/error-responses';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

// In-memory rate limiting (consider using Redis for production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface CachedResponse {
  response: {
    optimizedContent: string
    analysis: {
      keywords: string[]
      relevantSections: string[]
      relevanceScore: number
      skillRequirements: {
        required: string[]
        preferred: string[]
        experience: string[]
      }
      suggestions: string[]
    }
  }
  timestamp: number
}

// Response cache for identical requests
const responseCache = new Map<string, CachedResponse>();
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
  const hash = createHash('sha256')
    .update(resume + jobDescription)
    .digest('hex');
  return hash.substring(0, 16);
}

/**
 * POST /api/generate
 * Generate optimized resume content based on job description
 */
async function generateHandler(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check authentication first
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

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

    // Parse and validate request body
    const body = await request.json();
    
    try {
      const validatedData = validateInput(GenerateRequestSchema, body);
      const { resume, jobDescription } = validatedData;
    } catch (error) {
      return createValidationErrorResponse(
        [{ message: (error as Error).message, path: ['body'] }],
        error as Error,
        { path: '/api/generate' }
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

    // Analysis results for monitoring (logged appropriately in production)

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
    // Log error appropriately in production environment

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

// Wrap the handler with environment validation
export const POST = withEnvironmentValidation(generateHandler, ['OPENAI_API_KEY']);

// GET method for API information
export async function GET(_request: NextRequest) {
  return NextResponse.json({
    endpoint: '/api/generate',
    method: 'POST',
    description: 'Generate optimized resume content based on job description',
    parameters: {
      resume: 'string (required) - Original resume content',
      jobDescription: 'string (required) - Job description to optimize for'
    },
    authentication: 'required',
    rateLimit: `${MAX_REQUESTS_PER_WINDOW} requests per ${RATE_LIMIT_WINDOW / 1000} seconds`
  });
}

// OPTIONS method for CORS preflight
export async function OPTIONS(_request: NextRequest) {
  return createCORSResponse();
} 