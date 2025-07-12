import { escapeRegex } from './utils';

const SECTION_PATTERNS = {
  experience: /(work\s*)?experience|employment|career|professional\s*background/i,
  skills: /skills|technical\s*skills|competencies|expertise|technologies/i,
  education: /education|academic|qualifications|certifications?/i,
  summary: /summary|objective|profile|about|introduction/i
};

export const extractResumeSections = (resume: string): {
  experience: string;
  skills: string;
  education: string;
  summary: string;
  other: string;
} => {
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

  const lines = resume.split('\n');
  let currentSection = 'other';
  let currentContent: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    let foundSection = false;
    for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(trimmedLine) && trimmedLine.length < 50) {
        if (currentContent.length > 0) {
          sections[currentSection as keyof typeof sections] += currentContent.join('\n') + '\n';
        }
        currentSection = section;
        currentContent = [];
        foundSection = true;
        break;
      }
    }

    if (!foundSection) {
      currentContent.push(line);
    }
  }

  if (currentContent.length > 0) {
    sections[currentSection as keyof typeof sections] += currentContent.join('\n');
  }

  return sections;
};

export const analyzeResume = (resume: string, keywords: string[]): string[] => {
  if (!resume || !keywords || keywords.length === 0) {
    return [];
  }

  const lowerResume = resume.toLowerCase();
  const foundKeywords = new Set<string>();

  for (const keyword of keywords) {
    if (!keyword) continue;
    const keywordRegex = new RegExp(`\\b${escapeRegex(keyword.toLowerCase())}\\b`, 'i');
    if (keywordRegex.test(lowerResume)) {
      foundKeywords.add(keyword);
    }
  }

  return Array.from(foundKeywords);
};

export const scoreResumeRelevance = (resume: string, keywords: string[]): number => {
  if (!resume || !keywords || keywords.length === 0) {
    return 0;
  }

  const foundKeywords = analyzeResume(resume, keywords);
  return (foundKeywords.length / keywords.length) * 100;
};

export const identifySkillsGap = (resumeSkills: string[], requiredSkills: string[]): {
  matched: string[];
  missing: string[];
  matchRate: number;
} => {
  const resumeSkillsSet = new Set(resumeSkills.map(s => s.toLowerCase()));
  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of requiredSkills) {
    if (resumeSkillsSet.has(skill.toLowerCase())) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  const matchRate = requiredSkills.length > 0
    ? (matched.length / requiredSkills.length) * 100
    : 0;

  return {
    matched,
    missing,
    matchRate
  };
};