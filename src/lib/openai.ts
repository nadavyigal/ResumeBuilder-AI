import OpenAI from 'openai';

// Initialize OpenAI client with fallback for testing
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'test-key',
});

// Token counting utility
export function countTokens(text: string): number {
  // Simple approximation: ~4 characters per token
  return Math.ceil(text.length / 4);
}

// Generate optimized resume content using OpenAI
export async function generateResumeContent(
  resume: string,
  jobDescription?: string,
  relevantSections?: string[]
): Promise<string> {
  try {
    // For test compatibility - if only prompt is provided
    if (!jobDescription && !relevantSections) {
      return generateResumeContentSimple(resume);
    }

    // Build the prompt
    const prompt = `You are an expert resume writer. Analyze the following resume and job description, then rewrite the resume to better match the job requirements while maintaining accuracy.

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

    // Check token count to manage costs
    const estimatedTokens = countTokens(prompt);
    if (estimatedTokens > 3000) {
      throw new Error('Input too large. Please provide a shorter resume or job description.');
    }

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
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

    // Log usage for cost tracking
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
    
    // Provide specific error messages
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI configuration.');
      }
    }
    
    throw new Error('Failed to generate resume content');
  }
}

// Calculate estimated cost based on token usage
function calculateCost(tokens: number): string {
  // GPT-3.5-turbo pricing: $0.0010 per 1K tokens
  const costPer1kTokens = 0.0010;
  const cost = (tokens / 1000) * costPer1kTokens;
  return `$${cost.toFixed(4)}`;
}

// Export simple wrapper for backward compatibility with tests
export async function generateResumeContentSimple(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    return content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate resume content');
  }
}

 