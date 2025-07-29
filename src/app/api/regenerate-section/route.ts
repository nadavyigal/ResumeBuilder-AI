import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';
import { serverEnv } from '@/lib/server-env';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sectionId, sectionType, currentContent, jobDescription, resumeId } = body;

    // Validate required fields
    if (!sectionId || !sectionType || !jobDescription || !resumeId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate optimized content using OpenAI
    const regeneratedContent = await regenerateSection({
      sectionType,
      currentContent,
      jobDescription,
    });

    // Update the resume in the database
    const { data: resume, error: fetchError } = await supabase
      .from('resumes')
      .select('sections')
      .eq('id', resumeId)
      .single();

    if (fetchError) {
      throw new Error('Failed to fetch resume');
    }

    // Update the specific section
    const updatedSections = resume.sections.map((section: any) =>
      section.id === sectionId
        ? { ...section, content: regeneratedContent }
        : section
    );

    const { error: updateError } = await supabase
      .from('resumes')
      .update({
        sections: updatedSections,
        updated_at: new Date().toISOString(),
      })
      .eq('id', resumeId);

    if (updateError) {
      throw new Error('Failed to update resume');
    }

    return NextResponse.json({ content: regeneratedContent });
  } catch (error) {
    console.error('Section regeneration error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate section' },
      { status: 500 }
    );
  }
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: serverEnv.OPENAI_API_KEY,
});

// Function to regenerate a specific resume section using OpenAI
async function regenerateSection({
  sectionType,
  currentContent,
  jobDescription,
}: {
  sectionType: string;
  currentContent: string;
  jobDescription: string;
}): Promise<string> {
  try {
    const sectionPrompts: Record<string, string> = {
      summary: `Rewrite this professional summary to align with the job requirements while maintaining accuracy:
        
        Current Summary: ${currentContent}
        
        Job Description: ${jobDescription}
        
        Return an optimized professional summary that highlights relevant experience and skills from the job description. Format as HTML with <p> tags.`,
      
      experience: `Optimize this work experience section to better match the job requirements:
        
        Current Experience: ${currentContent}
        
        Job Description: ${jobDescription}
        
        Rewrite the experience section to emphasize accomplishments and responsibilities that align with the job requirements. Use relevant keywords naturally. Format as HTML with proper <p>, <strong>, and <ul>/<li> tags.`,
      
      education: `Enhance this education section to highlight relevant qualifications for the job:
        
        Current Education: ${currentContent}
        
        Job Description: ${jobDescription}
        
        Reformat the education section to emphasize relevant coursework, projects, or achievements that align with the job requirements. Format as HTML with <p> and <strong> tags.`,
      
      skills: `Optimize this skills section to match the job requirements:
        
        Current Skills: ${currentContent}
        
        Job Description: ${jobDescription}
        
        Reorganize and enhance the skills section to prominently feature skills mentioned in the job description. Group related skills logically. Format as HTML with <ul> and <li> tags.`,
    };

    const prompt = sectionPrompts[sectionType] || sectionPrompts.summary;

    const response = await openai.chat.completions.create({
      model: serverEnv.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume writer who optimizes resume sections for specific job descriptions while maintaining factual accuracy. Always return properly formatted HTML.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    return content;
  } catch (error) {
    console.error('OpenAI section regeneration error:', error);
    // Return original content if AI fails
    return currentContent;
  }
} 