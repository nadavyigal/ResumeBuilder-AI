// Common stop words to filter out
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'the', 'we', 'you', 'your', 'our',
  'this', 'these', 'those', 'they', 'them', 'their', 'what', 'which',
  'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'some',
  'any', 'most', 'more', 'many', 'such', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 'can', 'will', 'just', 'should', 'would',
  'could', 'may', 'might', 'must', 'shall', 'should', 'would', 'am',
  'been', 'being', 'have', 'had', 'having', 'do', 'does', 'did',
  'doing', 'i', 'me', 'my', 'myself', 'we', 'us', 'or', 'but', 'if',
  'looking', 'seeking', 'experience', 'work', 'working', 'join', 'team'
]);

// Technical and professional keywords to prioritize
const IMPORTANT_KEYWORDS = new Set([
  // Programming languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php', 'swift', 'kotlin',
  
  // Frameworks and libraries
  'react', 'angular', 'vue', 'nextjs', 'express', 'django', 'flask', 'spring', 'laravel', 'rails',
  
  // Tools and technologies
  'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'git', 'ci/cd', 'devops', 'terraform',
  
  // Skills and qualifications
  'senior', 'junior', 'mid-level', 'lead', 'architect', 'developer', 'engineer', 'analyst', 'designer',
  'manager', 'director', 'agile', 'scrum', 'leadership', 'communication', 'problem-solving',
  
  // Degrees and certifications
  'bachelor', 'master', 'phd', 'degree', 'certification', 'certified', 'pmp', 'aws-certified',
  
  // Common technical terms
  'api', 'rest', 'graphql', 'microservices', 'database', 'sql', 'nosql', 'mongodb', 'postgresql',
  'frontend', 'backend', 'fullstack', 'full-stack', 'mobile', 'web', 'cloud', 'saas', 'paas'
]);

/**
 * Extract relevant keywords from a job description
 * @param jobDescription - The job description text to parse
 * @returns Array of unique keywords sorted by relevance
 */
export function extractKeywords(jobDescription: string): string[] {
  if (!jobDescription || typeof jobDescription !== 'string') {
    return [];
  }

  // Convert to lowercase for processing
  const lowerText = jobDescription.toLowerCase();
  
  // Split into words and clean
  const words = lowerText
    .replace(/[^\w\s\-+#]/g, ' ') // Keep alphanumeric, spaces, hyphens, plus, and hash
    .split(/\s+/)
    .filter(word => word.length > 0);

  // Track keyword frequency
  const keywordFrequency = new Map<string, number>();
  
  // Process each word
  words.forEach(word => {
    // Skip stop words
    if (STOP_WORDS.has(word)) {
      return;
    }
    
    // Skip very short words unless they're important (like 'c++')
    if (word.length < 3 && !IMPORTANT_KEYWORDS.has(word)) {
      return;
    }
    
    // Skip numbers unless they're part of a version (like 'es6')
    if (/^\d+$/.test(word)) {
      return;
    }
    
    // Count frequency
    const count = keywordFrequency.get(word) || 0;
    keywordFrequency.set(word, count + 1);
  });
  
  // Sort by frequency and importance
  const sortedKeywords = Array.from(keywordFrequency.entries())
    .sort((a, b) => {
      // Prioritize important keywords
      const aImportant = IMPORTANT_KEYWORDS.has(a[0]) ? 10 : 0;
      const bImportant = IMPORTANT_KEYWORDS.has(b[0]) ? 10 : 0;
      
      // Sort by importance + frequency
      return (bImportant + b[1]) - (aImportant + a[1]);
    })
    .map(([keyword]) => {
      // For important keywords, preserve them in lowercase
      if (IMPORTANT_KEYWORDS.has(keyword)) {
        return keyword;
      }
      
      // For other keywords, check if we should preserve original case
      // Look for the original word in the text
      const originalWord = words.find(w => w.toLowerCase() === keyword);
      if (originalWord && /^[A-Z]/.test(originalWord)) {
        // If original word started with capital letter, preserve it
        return originalWord;
      }
      
      // Otherwise return the keyword as-is (lowercase)
      return keyword;
    });
  
  // Remove duplicates while preserving order
  const uniqueKeywords = Array.from(new Set(sortedKeywords));
  
  // Return top keywords (limit to avoid too many)
  return uniqueKeywords.slice(0, 30);
}

/**
 * Extract skill requirements from job description
 * @param jobDescription - The job description text to parse
 * @returns Object containing categorized skills
 */
export function extractSkillRequirements(jobDescription: string): {
  required: string[];
  preferred: string[];
  experience: string[];
} {
  const lowerText = jobDescription.toLowerCase();
  
  // Patterns to identify different requirement levels
  const requiredPatterns = [
    /required:?\s*([^.]+)/gi,
    /must have:?\s*([^.]+)/gi,
    /requirements?:?\s*([^.]+)/gi,
    /essential:?\s*([^.]+)/gi
  ];
  
  const preferredPatterns = [
    /preferred:?\s*([^.]+)/gi,
    /nice to have:?\s*([^.]+)/gi,
    /bonus:?\s*([^.]+)/gi,
    /preferred qualifications?:?\s*([^.]+)/gi
  ];
  
  const experiencePatterns = [
    /(\d+)\+?\s*years?\s*(?:of\s*)?experience/gi,
    /experience with\s*([^.]+)/gi,
    /experienced in\s*([^.]+)/gi
  ];
  
  // Extract skills from patterns
  const extractFromPatterns = (patterns: RegExp[]): string[] => {
    const skills = new Set<string>();
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(lowerText)) !== null) {
        const extracted = match[1]?.trim();
        if (extracted) {
          // Split by common delimiters
          const items = extracted.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 2);
          items.forEach(skill => skills.add(skill));
        }
      }
    });
    
    return Array.from(skills);
  };
  
  return {
    required: extractFromPatterns(requiredPatterns),
    preferred: extractFromPatterns(preferredPatterns),
    experience: extractFromPatterns(experiencePatterns)
  };
} 