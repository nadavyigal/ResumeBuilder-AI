import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { withEnvironmentValidation } from '@/lib/api-protection';
import { scrapeJobDescription, validateJobUrl } from '@/lib/jobScraper';
import { z } from 'zod';

const requestSchema = z.object({
  url: z.string().url()
});

export const runtime = 'nodejs';

async function handler(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = requestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validation.error.errors
        },
        { status: 400 }
      );
    }

    const { url } = validation.data;

    // Validate job URL
    const urlValidation = validateJobUrl(url);
    if (!urlValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Invalid job URL',
          details: urlValidation.error
        },
        { status: 400 }
      );
    }

    // Scrape job description
    const scrapingResult = await scrapeJobDescription(url);
    
    if (!scrapingResult.success) {
      return NextResponse.json(
        { 
          error: 'Failed to scrape job posting',
          details: scrapingResult.error
        },
        { status: 422 }
      );
    }

    // Optional: Store scraping result for analytics/caching
    try {
      await supabase
        .from('job_scrapings')
        .insert({
          user_id: user.id,
          url: url,
          title: scrapingResult.title,
          company: scrapingResult.company,
          location: scrapingResult.location,
          description: scrapingResult.jobDescription,
          source: scrapingResult.source,
          scraped_at: new Date().toISOString()
        });
    } catch (dbError) {
      // Don't fail the request if we can't store the result
      console.warn('Failed to store scraping result:', dbError);
    }

    return NextResponse.json({
      success: true,
      data: {
        title: scrapingResult.title,
        company: scrapingResult.company,
        location: scrapingResult.location,
        jobDescription: scrapingResult.jobDescription,
        source: scrapingResult.source,
        url: url
      }
    });

  } catch (error) {
    console.error('Job scraping API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const POST = withEnvironmentValidation(handler);

// OPTIONS for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}