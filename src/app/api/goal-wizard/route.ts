import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { openai } from '@/lib/openai'

interface GoalWizardRequest {
  goal: string
  context: {
    userExperience?: string
    targetIndustry?: string
    targetRole?: string
    careerLevel?: 'entry' | 'mid' | 'senior'
    currentResume?: any
    jobDescription?: string
  }
  action: 'analyze' | 'recommend' | 'optimize' | 'suggest'
}

interface WizardStep {
  id: string
  title: string
  description: string
  action: string
  priority: number
  estimatedTime: string
}

const GOAL_ANALYZERS = {
  'get-hired': {
    focus: 'landing a specific job',
    priorities: ['ATS optimization', 'keyword matching', 'achievement highlighting']
  },
  'career-change': {
    focus: 'transitioning to new field',
    priorities: ['transferable skills', 'relevant projects', 'industry alignment']
  },
  'promotion': {
    focus: 'advancing in current field',
    priorities: ['leadership examples', 'quantified achievements', 'strategic impact']
  },
  'first-job': {
    focus: 'entering workforce',
    priorities: ['education focus', 'internships/projects', 'soft skills']
  },
  'freelance': {
    focus: 'attracting clients',
    priorities: ['portfolio emphasis', 'client results', 'specialized skills']
  }
}

const CAREER_LEVEL_GUIDANCE = {
  entry: {
    focus: 'education, internships, projects',
    template_preference: 'clean, simple layouts',
    content_emphasis: 'academic achievements, relevant coursework, volunteer work'
  },
  mid: {
    focus: 'quantified achievements, technical skills',
    template_preference: 'professional, structured layouts',
    content_emphasis: 'project outcomes, team leadership, technical expertise'
  },
  senior: {
    focus: 'strategic impact, leadership, business value',
    template_preference: 'executive, sophisticated layouts',
    content_emphasis: 'business impact, team management, strategic initiatives'
  }
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

    const body: GoalWizardRequest = await request.json()
    const { goal, context, action } = body

    if (!goal) {
      return NextResponse.json(
        { error: 'Goal is required' },
        { status: 400 }
      )
    }

    // Analyze user's goal and context
    const goalAnalysis = await analyzeGoal(goal, context)
    
    // Generate personalized recommendations
    const recommendations = await generateRecommendations(goalAnalysis, context, action)
    
    // Create action plan
    const actionPlan = createActionPlan(recommendations, context)

    return NextResponse.json({
      analysis: goalAnalysis,
      recommendations,
      actionPlan,
      nextSteps: actionPlan.steps.slice(0, 3) // Show next 3 steps
    })

  } catch (error) {
    console.error('Goal Wizard error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process goal analysis',
        fallback: {
          analysis: { type: 'general', confidence: 0.5 },
          recommendations: [
            'Focus on ATS optimization',
            'Include relevant keywords',
            'Highlight quantifiable achievements'
          ],
          actionPlan: {
            steps: [
              { id: 'upload', title: 'Upload Resume', description: 'Start with your existing resume', priority: 1 },
              { id: 'job-match', title: 'Add Job Description', description: 'Input the job you\'re targeting', priority: 2 },
              { id: 'optimize', title: 'AI Optimization', description: 'Let AI improve your content', priority: 3 }
            ]
          }
        }
      },
      { status: 200 } // Return fallback rather than error
    )
  }
}

async function analyzeGoal(goal: string, context: any) {
  const prompt = `Analyze this resume creation goal: "${goal}"

Context:
- Experience level: ${context.userExperience || 'Not specified'}
- Target industry: ${context.targetIndustry || 'Not specified'}
- Target role: ${context.targetRole || 'Not specified'}
- Career level: ${context.careerLevel || 'Not specified'}

Provide analysis in JSON format:
{
  "type": "goal type (get-hired, career-change, promotion, first-job, freelance)",
  "confidence": 0.0-1.0,
  "keyPriorities": ["priority1", "priority2", "priority3"],
  "challenges": ["challenge1", "challenge2"],
  "opportunities": ["opportunity1", "opportunity2"]
}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.3
    })

    const response = completion.choices[0]?.message?.content
    return JSON.parse(response || '{"type": "general", "confidence": 0.5}')
  } catch (error) {
    console.error('Goal analysis error:', error)
    return { type: 'general', confidence: 0.5 }
  }
}

async function generateRecommendations(analysis: any, context: any, action: string) {
  const goalType = analysis.type || 'general'
  const goalConfig = GOAL_ANALYZERS[goalType as keyof typeof GOAL_ANALYZERS] || GOAL_ANALYZERS['get-hired']
  const levelConfig = CAREER_LEVEL_GUIDANCE[context.careerLevel as keyof typeof CAREER_LEVEL_GUIDANCE] || CAREER_LEVEL_GUIDANCE.mid

  const prompt = `Generate personalized resume recommendations for:
Goal: ${goalType}
Action: ${action}
Career Level: ${context.careerLevel || 'mid'}
Industry: ${context.targetIndustry || 'general'}

Focus areas: ${goalConfig.priorities.join(', ')}
Level guidance: ${levelConfig.focus}

Provide 5-7 specific, actionable recommendations in JSON format:
{
  "recommendations": [
    {
      "category": "content|format|strategy",
      "title": "Recommendation title",
      "description": "Detailed explanation",
      "priority": 1-5,
      "estimatedImpact": "high|medium|low"
    }
  ]
}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.4
    })

    const response = completion.choices[0]?.message?.content
    return JSON.parse(response || '{"recommendations": []}')
  } catch (error) {
    console.error('Recommendation generation error:', error)
    return { recommendations: [] }
  }
}

function createActionPlan(recommendations: any, context: any) {
  const steps: WizardStep[] = []

  // Always start with resume upload if not provided
  if (!context.currentResume) {
    steps.push({
      id: 'upload-resume',
      title: 'Upload Your Resume',
      description: 'Start with your existing resume or create from scratch',
      action: 'upload',
      priority: 1,
      estimatedTime: '2-3 minutes'
    })
  }

  // Add job matching step
  if (!context.jobDescription) {
    steps.push({
      id: 'add-job',
      title: 'Add Target Job',
      description: 'Input the job description for AI optimization',
      action: 'job-match',
      priority: 2,
      estimatedTime: '1-2 minutes'
    })
  }

  // Add optimization step
  steps.push({
    id: 'ai-optimize',
    title: 'AI Optimization',
    description: 'Let AI improve your resume for the target job',
    action: 'optimize',
    priority: 3,
    estimatedTime: '3-5 minutes'
  })

  // Add template selection
  steps.push({
    id: 'choose-template',
    title: 'Select Template',
    description: 'Choose a professional template that matches your industry',
    action: 'template',
    priority: 4,
    estimatedTime: '1-2 minutes'
  })

  // Add content editing
  steps.push({
    id: 'edit-content',
    title: 'Review & Edit',
    description: 'Review AI suggestions and make final adjustments',
    action: 'edit',
    priority: 5,
    estimatedTime: '5-10 minutes'
  })

  // Add export step
  steps.push({
    id: 'export-pdf',
    title: 'Export PDF',
    description: 'Download your ATS-optimized resume',
    action: 'export',
    priority: 6,
    estimatedTime: '1 minute'
  })

  return {
    steps: steps.sort((a, b) => a.priority - b.priority),
    totalEstimatedTime: '15-25 minutes',
    keyRecommendations: recommendations.recommendations?.slice(0, 3) || []
  }
} 