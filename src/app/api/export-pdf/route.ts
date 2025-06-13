import { NextRequest, NextResponse } from 'next/server';
import { PDFGenerator } from '@/lib/pdf/generator';
import { getTemplateById } from '@/lib/templates';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get request data
    const { resumeId, templateId, customizations } = await request.json();

    if (!resumeId || !templateId) {
      return NextResponse.json(
        { error: 'Resume ID and Template ID are required' },
        { status: 400 }
      );
    }

    // Get the template
    const template = getTemplateById(templateId);
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Get the resume data
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    // Generate the PDF HTML
    const html = await PDFGenerator.generatePDF({
      template,
      resumeData: resume.content,
      customizations,
    });

    // Validate ATS compatibility
    const validation = PDFGenerator.validateATSCompatibility(html);

    // For now, return the HTML and validation results
    // In production, this would use Puppeteer to generate actual PDF
    return NextResponse.json({
      html,
      validation,
      message: 'PDF generation successful. Use browser print function to save as PDF.',
    });

  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
} 