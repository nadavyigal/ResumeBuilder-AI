import { STOP_WORDS, IMPORTANT_KEYWORDS } from './constants';

// Helper function to clean and tokenize text
const tokenize = (text: string): string[] => {
  if (!text || typeof text !== 'string') {
    return [];
  }
  return text
    .toLowerCase()
    .replace(/[\W_]+/g, ' ') // Replace non-alphanumeric characters with spaces
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
};

// Helper function to count keyword frequency
const getKeywordFrequency = (words: string[]): Map<string, number> => {
  const frequencyMap = new Map<string, number>();
  for (const word of words) {
    frequencyMap.set(word, (frequencyMap.get(word) || 0) + 1);
  }
  return frequencyMap;
};

// Helper function to rank keywords
const rankKeywords = (frequencyMap: Map<string, number>): string[] => {
  return Array.from(frequencyMap.entries())
    .sort((a, b) => {
      const aScore = (IMPORTANT_KEYWORDS.has(a[0]) ? 10 : 0) + a[1];
      const bScore = (IMPORTANT_KEYWORDS.has(b[0]) ? 10 : 0) + b[1];
      return bScore - aScore;
    })
    .map(([keyword]) => keyword);
};

// Refactored extractKeywords function
export const extractKeywords = (jobDescription: string): string[] => {
  const words = tokenize(jobDescription);
  const frequencyMap = getKeywordFrequency(words);
  const rankedKeywords = rankKeywords(frequencyMap);
  return rankedKeywords.slice(0, 30);
};

// Helper function to extract skills from text using regex patterns
const extractSkills = (text: string, patterns: RegExp[]): string[] => {
  const skills = new Set<string>();
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        const skill = match.replace(pattern, '$1').trim();
        if (skill) {
          skills.add(skill);
        }
      }
    }
  }
  return Array.from(skills);
};

// Refactored extractSkillRequirements function
export const extractSkillRequirements = (jobDescription: string): {
  required: string[];
  preferred: string[];
  experience: string[];
} => {
  const lowerText = jobDescription.toLowerCase();

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

  return {
    required: extractSkills(lowerText, requiredPatterns),
    preferred: extractSkills(lowerText, preferredPatterns),
    experience: extractSkills(lowerText, experiencePatterns)
  };
};