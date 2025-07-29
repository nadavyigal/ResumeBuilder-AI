import { load } from 'cheerio';
import fetch from 'node-fetch';
import { z } from 'zod';

// URL validation schema
const urlSchema = z.string().url().refine(
  (url) => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  },
  { message: 'Invalid URL format' }
);

// Job description extraction result
export interface JobScrapingResult {
  success: boolean;
  jobDescription?: string;
  title?: string;
  company?: string;
  location?: string;
  salary?: string;
  error?: string;
  source?: string;
}

// Common job site selectors
const JOB_SITE_SELECTORS = {
  linkedin: {
    domain: 'linkedin.com',
    selectors: {
      title: '[data-automation-id="job-title"], .top-card-layout__title, .job-details-jobs-unified-top-card__job-title',
      company: '[data-automation-id="job-details-company-name"], .top-card-layout__card .top-card-layout__title, .job-details-jobs-unified-top-card__company-name',
      location: '[data-automation-id="job-details-location"], .top-card-layout__card .top-card-layout__second-subline, .job-details-jobs-unified-top-card__bullet',
      description: '[data-automation-id="job-details-description"], .description__text, .job-details-jobs-unified-top-card__job-description'
    }
  },
  indeed: {
    domain: 'indeed.com',
    selectors: {
      title: '[data-testid="jobsearch-JobInfoHeader-title"], .jobsearch-JobInfoHeader-title',
      company: '[data-testid="inlineHeader-companyName"], .jobsearch-InlineCompanyRating',
      location: '[data-testid="job-location"], .jobsearch-JobInfoHeader-subtitle',
      description: '[data-testid="jobsearch-jobDescriptionText"], .jobsearch-jobDescriptionText'
    }
  },
  glassdoor: {
    domain: 'glassdoor.com',
    selectors: {
      title: '[data-test="job-title"], .jobTitle',
      company: '[data-test="employer-name"], .employerName',
      location: '[data-test="job-location"], .location',
      description: '[data-test="jobDescriptionContent"], .jobDescriptionContent'
    }
  },
  workday: {
    domain: 'workday.com',
    selectors: {
      title: '[data-automation-id="jobPostingHeader"], .css-1id4k0',
      company: '[data-automation-id="jobPostingCompany"], .css-1t92pv',
      location: '[data-automation-id="locations"], .css-cygeeu',
      description: '[data-automation-id="jobPostingDescription"], .css-1uqhpru'
    }
  },
  lever: {
    domain: 'lever.co',
    selectors: {
      title: '.posting-headline h2',
      company: '.posting-headline .company-name',
      location: '.posting-categories .location',
      description: '.posting-content .section-wrapper'
    }
  },
  greenhouse: {
    domain: 'greenhouse.io',
    selectors: {
      title: '.app-title',
      company: '.company-name',
      location: '.location',
      description: '.job-post-content'
    }
  }
};

// Generic fallback selectors
const GENERIC_SELECTORS = {
  title: [
    'h1',
    '[class*="title"]',
    '[class*="job-title"]',
    '[id*="title"]',
    '[data-testid*="title"]'
  ],
  company: [
    '[class*="company"]',
    '[class*="employer"]',
    '[data-testid*="company"]',
    '[id*="company"]'
  ],
  location: [
    '[class*="location"]',
    '[class*="address"]',
    '[data-testid*="location"]',
    '[id*="location"]'
  ],
  description: [
    '[class*="description"]',
    '[class*="content"]',
    '[class*="details"]',
    'main',
    '.job-description',
    '#job-description'
  ]
};

/**
 * Validates if a URL is safe to scrape
 */
export function validateJobUrl(url: string): { valid: boolean; error?: string } {
  try {
    urlSchema.parse(url);
    
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    
    // Check if it's a known job site or has job-related keywords
    const isJobSite = Object.values(JOB_SITE_SELECTORS).some(site => 
      hostname.includes(site.domain)
    ) || hostname.includes('job') || hostname.includes('career');
    
    if (!isJobSite) {
      return {
        valid: false,
        error: 'URL does not appear to be from a job posting site'
      };
    }
    
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid URL'
    };
  }
}

/**
 * Fetches HTML content from a URL with proper headers
 */
async function fetchJobPageContent(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    },
    timeout: 10000, // 10 second timeout
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('text/html')) {
    throw new Error('Response is not HTML content');
  }

  return await response.text();
}

/**
 * Extracts text content using selectors with fallbacks
 */
function extractTextWithSelectors(
  $: any,
  selectors: string[],
  fallbackSelectors?: string[]
): string {
  // Try specific selectors first
  for (const selector of selectors) {
    const element = $(selector).first();
    if (element.length > 0) {
      const text = element.text().trim();
      if (text && text.length > 3) {
        return text;
      }
    }
  }

  // Try fallback selectors if provided
  if (fallbackSelectors) {
    for (const selector of fallbackSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        const text = element.text().trim();
        if (text && text.length > 3) {
          return text;
        }
      }
    }
  }

  return '';
}

/**
 * Determines the job site type from URL
 */
function getJobSiteConfig(url: string) {
  const hostname = new URL(url).hostname.toLowerCase();
  
  for (const [key, config] of Object.entries(JOB_SITE_SELECTORS)) {
    if (hostname.includes(config.domain)) {
      return { type: key, config };
    }
  }
  
  return { type: 'generic', config: null };
}

/**
 * Extracts job information from parsed HTML
 */
function extractJobInfo($: any, url: string): Partial<JobScrapingResult> {
  const { type, config } = getJobSiteConfig(url);
  
  let title = '';
  let company = '';
  let location = '';
  let description = '';

  if (config) {
    // Use site-specific selectors
    title = extractTextWithSelectors($, [config.selectors.title], GENERIC_SELECTORS.title);
    company = extractTextWithSelectors($, [config.selectors.company], GENERIC_SELECTORS.company);
    location = extractTextWithSelectors($, [config.selectors.location], GENERIC_SELECTORS.location);
    
    // For description, try to get HTML content for better formatting
    const descElement = $(config.selectors.description).first();
    if (descElement.length > 0) {
      description = descElement.text().trim();
    }
  }

  // Use generic selectors as fallback
  if (!title) {
    title = extractTextWithSelectors($, GENERIC_SELECTORS.title);
  }
  if (!company) {
    company = extractTextWithSelectors($, GENERIC_SELECTORS.company);
  }
  if (!location) {
    location = extractTextWithSelectors($, GENERIC_SELECTORS.location);
  }
  if (!description) {
    description = extractTextWithSelectors($, GENERIC_SELECTORS.description);
  }

  // Clean up description
  if (description) {
    // Remove excessive whitespace and normalize
    description = description
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
    
    // Limit description length
    if (description.length > 5000) {
      description = description.substring(0, 5000) + '...';
    }
  }

  return {
    title: title || undefined,
    company: company || undefined,
    location: location || undefined,
    jobDescription: description || undefined,
    source: type
  };
}

/**
 * Main function to scrape job description from URL
 */
export async function scrapeJobDescription(url: string): Promise<JobScrapingResult> {
  try {
    // Validate URL
    const validation = validateJobUrl(url);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'Invalid URL'
      };
    }

    // Fetch page content
    const html = await fetchJobPageContent(url);
    
    // Parse HTML
    const $ = load(html);
    
    // Extract job information
    const jobInfo = extractJobInfo($, url);
    
    // Check if we got meaningful content
    if (!jobInfo.jobDescription || jobInfo.jobDescription.length < 100) {
      return {
        success: false,
        error: 'Could not extract meaningful job description from the page'
      };
    }

    return {
      success: true,
      ...jobInfo
    };

  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: `Failed to scrape job posting: ${error.message}`
      };
    }
    
    return {
      success: false,
      error: 'Unknown error occurred while scraping'
    };
  }
}

/**
 * Test function to verify scraping works with a given URL
 */
export async function testJobScraping(url: string): Promise<JobScrapingResult> {
  const result = await scrapeJobDescription(url);
  
  // Add additional validation for testing
  if (result.success) {
    const stats = {
      titleLength: result.title?.length || 0,
      companyLength: result.company?.length || 0,
      locationLength: result.location?.length || 0,
      descriptionLength: result.jobDescription?.length || 0,
      totalWords: result.jobDescription?.split(/\s+/).length || 0
    };
    
    console.log('Scraping test results:', {
      url,
      success: result.success,
      source: result.source,
      stats
    });
  }
  
  return result;
}