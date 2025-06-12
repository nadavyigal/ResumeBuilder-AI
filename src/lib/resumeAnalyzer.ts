/**
 * Analyze resume to find relevant sections based on keywords
 * @param resume - The resume text to analyze
 * @param keywords - Keywords to search for in the resume
 * @returns Array of matched keywords found in the resume
 */
export function analyzeResume(resume: string, keywords: string[]): string[] {
  if (!resume || !keywords || keywords.length === 0) {
    return [];
  }

  // Convert resume to lowercase for case-insensitive matching
  const lowerResume = resume.toLowerCase();
  
  // Track which keywords were found
  const foundKeywords = new Set<string>();
  
  // Check each keyword
  keywords.forEach(keyword => {
    if (!keyword) return;
    
    // Create regex for whole word matching (with word boundaries)
    // This prevents matching 'Java' in 'JavaScript'
    const keywordRegex = new RegExp(`\\b${escapeRegex(keyword.toLowerCase())}\\b`, 'i');
    
    if (keywordRegex.test(lowerResume)) {
      // Preserve original case of the keyword
      foundKeywords.add(keyword);
    }
  });
  
  return Array.from(foundKeywords);
}

/**
 * Escape special regex characters in a string
 * @param str - String to escape
 * @returns Escaped string safe for regex
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract specific sections from resume
 * @param resume - The resume text
 * @returns Object containing different resume sections
 */
export function extractResumeSections(resume: string): {
  experience: string;
  skills: string;
  education: string;
  summary: string;
  other: string;
} {
  const sections = {
    experience: '',
    skills: '',
    education: '',
    summary: '',
    other: ''
  };

  if (!resume) {
    return sections;
  }

  // Common section headers (case-insensitive)
  const sectionPatterns = {
    experience: /(?:work\s*)?experience|employment|career|professional\s*background/i,
    skills: /skills|technical\s*skills|competencies|expertise|technologies/i,
    education: /education|academic|qualifications|certifications?/i,
    summary: /summary|objective|profile|about|introduction/i
  };

  // Split resume into lines for processing
  const lines = resume.split('\n');
  let currentSection = 'other';
  let currentContent: string[] = [];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Check if this line is a section header
    let foundSection = false;
    for (const [section, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(trimmedLine) && trimmedLine.length < 50) { // Headers are usually short
        // Save previous section content
        if (currentContent.length > 0) {
          sections[currentSection as keyof typeof sections] += currentContent.join('\n') + '\n';
        }
        
        // Start new section
        currentSection = section;
        currentContent = [];
        foundSection = true;
        break;
      }
    }
    
    // Add line to current section if it's not a header
    if (!foundSection && trimmedLine) {
      currentContent.push(line);
    }
  });

  // Save final section
  if (currentContent.length > 0) {
    sections[currentSection as keyof typeof sections] += currentContent.join('\n');
  }

  return sections;
}

/**
 * Score resume relevance based on keyword matches
 * @param resume - The resume text
 * @param keywords - Keywords to match
 * @returns Relevance score (0-100)
 */
export function scoreResumeRelevance(resume: string, keywords: string[]): number {
  if (!resume || !keywords || keywords.length === 0) {
    return 0;
  }

  const foundKeywords = analyzeResume(resume, keywords);
  const matchPercentage = (foundKeywords.length / keywords.length) * 100;
  
  // Additional scoring factors
  const lowerResume = resume.toLowerCase();
  let bonusScore = 0;

  // Bonus for multiple occurrences of important keywords
  foundKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${escapeRegex(keyword.toLowerCase())}\\b`, 'gi');
    const matches = lowerResume.match(regex);
    if (matches && matches.length > 1) {
      bonusScore += Math.min(matches.length - 1, 5); // Cap bonus at 5 per keyword
    }
  });

  // Calculate final score (capped at 100)
  return Math.min(matchPercentage + bonusScore, 100);
}

/**
 * Identify skills gap between resume and job requirements
 * @param resumeSkills - Skills found in resume
 * @param requiredSkills - Skills required by job
 * @returns Object containing matched and missing skills
 */
export function identifySkillsGap(
  resumeSkills: string[],
  requiredSkills: string[]
): {
  matched: string[];
  missing: string[];
  matchRate: number;
} {
  const resumeSkillsSet = new Set(resumeSkills.map(s => s.toLowerCase()));
  const matched: string[] = [];
  const missing: string[] = [];

  requiredSkills.forEach(skill => {
    if (resumeSkillsSet.has(skill.toLowerCase())) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  });

  const matchRate = requiredSkills.length > 0 
    ? (matched.length / requiredSkills.length) * 100 
    : 0;

  return {
    matched,
    missing,
    matchRate
  };
} 