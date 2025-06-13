import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    // TODO: Integrate with your LLM service here
    // For now, we'll return a mock regenerated content
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

// Mock function for section regeneration
// Replace this with your actual LLM integration
async function regenerateSection({
  sectionType,
  currentContent,
  jobDescription,
}: {
  sectionType: string;
  currentContent: string;
  jobDescription: string;
}): Promise<string> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return mock content based on section type
  const mockContent: Record<string, string> = {
    summary: `<p>Experienced professional with proven expertise aligned with the requirements outlined in the job description. ${jobDescription.substring(0, 100)}...</p>`,
    experience: `<p><strong>Senior Developer</strong> - Tech Company (2020-Present)</p><ul><li>Led development initiatives that align with ${jobDescription.substring(0, 50)}...</li><li>Implemented solutions resulting in improved efficiency</li></ul>`,
    education: `<p><strong>Bachelor of Science in Computer Science</strong></p><p>University Name, 2019</p><p>Relevant coursework aligned with job requirements</p>`,
    skills: `<ul><li>Programming Languages: JavaScript, TypeScript, Python</li><li>Frameworks: React, Next.js, Node.js</li><li>Tools: Git, Docker, AWS</li></ul>`,
    other: `<p>Additional qualifications relevant to ${jobDescription.substring(0, 50)}...</p>`,
  };

  return mockContent[sectionType] || mockContent.other;
} 