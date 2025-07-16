import OpenAI from 'openai';
import { validateOpenAIConfig } from '@/lib/api-protection';
import { env } from '@/lib/env';

// Validate OpenAI configuration on module load
const validation = validateOpenAIConfig();
if (!validation.success) {
  throw new Error(`OpenAI Configuration Error: ${validation.error}`);
}

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const countTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

const calculateCost = (tokens: number): string => {
  const costPer1kTokens = 0.0010;
  const cost = (tokens / 1000) * costPer1kTokens;
  return `$${cost.toFixed(4)}`;
};

const createResumeGenerationPrompt = (resume: string, jobDescription?: string, relevantSections?: string[]): string => {
  return `You are an expert resume writer. Analyze the following resume and job description, then rewrite the resume to better match the job requirements while maintaining accuracy.

IMPORTANT RULES:
1. Keep all factual information accurate
2. Highlight relevant experience and skills
3. Use keywords from the job description naturally
4. Maintain professional tone
5. Do not invent or exaggerate experience

Resume:
${resume}

Job Description:
${jobDescription}

Key sections to emphasize:
${relevantSections?.join(', ') || 'All relevant sections'}

Please provide an optimized version of the resume that better aligns with this job description.`;
};

const callOpenAI = async (prompt: string): Promise<string> => {
  const estimatedTokens = countTokens(prompt);
  if (estimatedTokens > 3000) {
    throw new Error('Input too large. Please provide a shorter resume or job description.');
  }

  try {
    const response = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume writer who optimizes resumes for specific job descriptions while maintaining factual accuracy.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    if (response.usage) {
      console.log('OpenAI API Usage:', {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens,
        estimated_cost: calculateCost(response.usage.total_tokens),
      });
    }

    return content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI configuration.');
      }
    }
    throw new Error('Failed to generate resume content');
  }
};

export const generateResumeContent = async (resume: string, jobDescription?: string, relevantSections?: string[]): Promise<string> => {
  const prompt = createResumeGenerationPrompt(resume, jobDescription, relevantSections);
  return await callOpenAI(prompt);
};