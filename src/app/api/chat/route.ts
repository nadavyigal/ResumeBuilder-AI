import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { openai } from '@/lib/openai'

interface ResumeData {
  personalInfo?: {
    fullName?: string
    email?: string
    phone?: string
    location?: string
  }
  sections?: {
    [key: string]: unknown
  }
}

interface ChatContext {
  step?: string
  resumeData?: ResumeData
  templateId?: string
  conversationHistory?: Array<{
    type: 'user' | 'assistant'
    content: string
  }>
}

interface ChatRequest {
  message: string
  context: ChatContext
}

const SYSTEM_PROMPT = `You are an AI assistant helping users create professional, ATS-optimized resumes. You provide contextual, actionable advice based on the user's current step in the resume creation process.

Key principles:
- Be helpful, encouraging, and professional
- Provide specific, actionable advice
- Consider the user's current step and context
- Focus on ATS optimization and best practices
- Keep responses concise but informative
- Use a friendly, supportive tone

Current context: The user is in the {step} step of resume creation.`

const STEP_PROMPTS = {
  onboarding: `The user is just starting their resume creation journey. Focus on:
- Explaining the process clearly
- Building confidence
- Highlighting the benefits of AI optimization
- Guiding them through initial steps`,
  
  'template-selection': `The user is choosing a resume template. Help them understand:
- What makes a template ATS-friendly
- How to choose based on their industry/role
- Template customization options
- Preview and selection process`,
  
  'resume-upload': `The user is uploading an existing resume. Guide them on:
- File format requirements
- What happens during parsing
- How to handle parsing issues
- Next steps after upload`,
  
  'job-matching': `The user is inputting job information. Assist with:
- How to find and input job URLs
- What the AI will analyze
- How job matching improves the resume
- Common job description elements`,
  
  'content-editing': `The user is editing their resume content. Provide advice on:
- ATS optimization techniques
- Content structure best practices
- How to highlight achievements
- Common editing mistakes to avoid`,
  
  'pdf-export': `The user is ready to export their resume. Help with:
- PDF quality and formatting
- ATS compatibility checks
- Download and sharing options
- Next steps after export`
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body: ChatRequest = await request.json()
    const { message, context } = body

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Build context-aware system prompt
    const step = context.step || 'general'
    const stepPrompt = STEP_PROMPTS[step as keyof typeof STEP_PROMPTS] || ''
    const fullSystemPrompt = SYSTEM_PROMPT.replace('{step}', step) + '\n\n' + stepPrompt

    // Build conversation history for context
    const conversationHistory = context.conversationHistory || []
    const messages = [
      { role: 'system' as const, content: fullSystemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      })),
      { role: 'user' as const, content: message }
    ]

    // Add resume context if available
    if (context.resumeData) {
      const resumeContext = `User's current resume data: ${JSON.stringify(context.resumeData, null, 2)}`
      messages[0].content += `\n\n${resumeContext}`
    }

    // Add template context if available
    if (context.templateId) {
      const templateContext = `User has selected template ID: ${context.templateId}`
      messages[0].content += `\n\n${templateContext}`
    }

    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    })

    const response = completion.choices[0]?.message?.content || 'I apologize, but I\'m having trouble generating a response right now. Please try again.'

    // Log the interaction for analytics (optional)
    try {
      await supabase
        .from('chat_interactions')
        .insert({
          user_id: user.id,
          message: message,
          response: response,
          step: context.step,
          template_id: context.templateId,
          created_at: new Date().toISOString()
        })
    } catch (logError) {
      // Non-blocking error - chat still works
      // Log error appropriately in production
    }

    return NextResponse.json({ response })

  } catch (error) {
    // Log error appropriately in production environment
    
    // Provide helpful fallback response
    const fallbackResponse = `I'm experiencing some technical difficulties right now. Here are some general tips for resume creation:

1. **ATS Optimization**: Use standard fonts (Arial, Calibri) and avoid graphics
2. **Keywords**: Include relevant keywords from the job description
3. **Achievements**: Focus on quantifiable achievements rather than just responsibilities
4. **Formatting**: Keep it clean and professional

Please try again in a moment, or continue with your resume creation.`

    return NextResponse.json(
      { response: fallbackResponse },
      { status: 200 } // Return 200 with fallback rather than error
    )
  }
} 