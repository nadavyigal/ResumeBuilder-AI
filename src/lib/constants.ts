export const STOP_WORDS = new Set([
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

export const IMPORTANT_KEYWORDS = new Set([
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
