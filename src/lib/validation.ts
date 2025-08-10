import { z } from 'zod';

/**
 * File upload validation schema
 */
export const FileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 10 * 1024 * 1024, 
      'File size must be less than 10MB'
    )
    .refine(
      (file) => [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ].includes(file.type),
      'Only PDF and DOCX files are allowed'
    )
    .refine(
      (file) => file.name.length <= 255,
      'File name must be less than 255 characters'
    )
    .refine(
      (file) => !/[<>:"/\\|?*]/.test(file.name),
      'File name contains invalid characters'
    )
});

/**
 * Resume content validation schema
 */
export const ResumeContentSchema = z.object({
  personalInfo: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().max(20, 'Phone number too long').optional(),
    location: z.string().max(100, 'Location too long').optional(),
    website: z.string().url('Invalid URL').optional(),
    linkedin: z.string().url('Invalid LinkedIn URL').optional()
  }),
  summary: z.string()
    .max(1000, 'Summary must be less than 1000 characters')
    .optional(),
  experience: z.array(
    z.object({
      title: z.string().min(1, 'Job title is required').max(100, 'Job title too long'),
      company: z.string().min(1, 'Company is required').max(100, 'Company name too long'),
      location: z.string().max(100, 'Location too long').optional(),
      startDate: z.string().min(1, 'Start date is required'),
      endDate: z.string().optional(),
      description: z.string().max(2000, 'Description too long').optional(),
      achievements: z.array(z.string().max(500, 'Achievement too long')).optional()
    })
  ).optional(),
  education: z.array(
    z.object({
      degree: z.string().min(1, 'Degree is required').max(100, 'Degree too long'),
      school: z.string().min(1, 'School is required').max(100, 'School name too long'),
      location: z.string().max(100, 'Location too long').optional(),
      graduationDate: z.string().optional(),
      gpa: z.string().max(10, 'GPA too long').optional()
    })
  ).optional(),
  skills: z.array(
    z.string().min(1, 'Skill name required').max(50, 'Skill name too long')
  ).max(50, 'Too many skills').optional(),
  projects: z.array(
    z.object({
      name: z.string().min(1, 'Project name is required').max(100, 'Project name too long'),
      description: z.string().max(1000, 'Description too long').optional(),
      technologies: z.array(z.string().max(30, 'Technology name too long')).optional(),
      url: z.string().url('Invalid URL').optional()
    })
  ).optional()
});

/**
 * AI generation request validation schema
 */
export const GenerateRequestSchema = z.object({
  resume: z.string()
    .min(10, 'Resume content is too short')
    .max(10000, 'Resume content is too long')
    .refine(
      (content) => content.trim().length > 0,
      'Resume content cannot be empty'
    ),
  jobDescription: z.string()
    .min(10, 'Job description is too short')
    .max(5000, 'Job description is too long')
    .refine(
      (content) => content.trim().length > 0,
      'Job description cannot be empty'
    ),
  optimizationType: z.enum(['keywords', 'content', 'full'], {
    errorMap: () => ({ message: 'Invalid optimization type' })
  }).optional().default('full')
});

/**
 * Resume update validation schema
 */
export const ResumeUpdateSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title is too long')
    .optional(),
  content: ResumeContentSchema.optional()
});

/**
 * User profile validation schema
 */
export const UserProfileSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark']).optional(),
    defaultTemplate: z.string().max(50, 'Template name too long').optional(),
    emailNotifications: z.boolean().optional()
  }).optional()
});

/**
 * Search/filter validation schema
 */
export const SearchRequestSchema = z.object({
  query: z.string()
    .max(100, 'Search query too long')
    .optional(),
  filters: z.object({
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    tags: z.array(z.string().max(30, 'Tag too long')).max(10, 'Too many tags').optional()
  }).optional(),
  limit: z.number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional()
    .default(10),
  offset: z.number()
    .min(0, 'Offset cannot be negative')
    .optional()
    .default(0)
});

/**
 * Rate limiting validation
 */
export const RateLimitSchema = z.object({
  ip: z.string().ip('Invalid IP address'),
  userAgent: z.string().max(500, 'User agent too long').optional(),
  endpoint: z.string().max(100, 'Endpoint path too long')
});

/**
 * Environment variable validation schema
 */
export const EnvValidationSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),
  PRODUCTION_DOMAIN: z.string().url('Invalid production domain').optional(),
  ALLOWED_ORIGINS: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional().default('info'),
  ENABLE_ERROR_REPORTING: z.enum(['true', 'false']).optional().default('false')
});

/**
 * Sanitize and validate input data
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated and sanitized data
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

/**
 * Validate file upload with detailed error messages
 * @param file - File to validate
 * @returns Validation result
 */
export function validateFileUpload(file: File): { isValid: boolean; errors: string[] } {
  const result = FileUploadSchema.safeParse({ file });
  
  if (result.success) {
    return { isValid: true, errors: [] };
  }
  
  return {
    isValid: false,
    errors: result.error.errors.map(err => err.message)
  };
}

/**
 * Sanitize string input to prevent XSS
 * @param input - String to sanitize
 * @param maxLength - Maximum allowed length
 * @returns Sanitized string
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

/**
 * Validate and sanitize user-generated content
 * @param content - Content to validate
 * @returns Sanitized content
 */
export function sanitizeUserContent(content: any): any {
  if (typeof content === 'string') {
    return sanitizeString(content);
  }
  
  if (Array.isArray(content)) {
    return content.map(item => sanitizeUserContent(item));
  }
  
  if (typeof content === 'object' && content !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(content)) {
      const sanitizedKey = sanitizeString(key, 50);
      sanitized[sanitizedKey] = sanitizeUserContent(value);
    }
    return sanitized;
  }
  
  return content;
}