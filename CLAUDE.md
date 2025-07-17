# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests with Vitest
- `npm run test:watch` - Run tests in watch mode

### Supabase Integration
- `npm run validate:supabase` - Validate Supabase connection and schema
- `npm run test:supabase` - Run Supabase-specific tests
- `npm run validate:all` - Run all validation checks

### Testing Individual Components
- `npm run test src/tests/lib/supabase.test.ts` - Test Supabase integration
- `npm run test src/tests/api/generate.test.ts` - Test AI generation API
- `npm run test src/tests/api/upload.test.ts` - Test resume upload API

## Architecture Overview

### Application Structure
This is a Next.js 14 application with App Router using TypeScript, Tailwind CSS, and Supabase backend.

**Key Directories:**
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components
- `src/lib/` - Utilities, configurations, and core business logic
- `src/types/` - TypeScript type definitions

### Environment & Configuration
- Uses `envalid` for environment validation in `src/lib/env.ts`
- Environment variables are centralized and validated on application startup
- Critical env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENAI_API_KEY`

### Data Flow Architecture
1. **Resume Upload** → `src/app/api/upload/route.ts` → Supabase storage
2. **AI Generation** → `src/app/api/generate/route.ts` → OpenAI API → optimized content
3. **PDF Export** → `src/app/api/export-pdf/route.ts` → Puppeteer → PDF file

### Key Components
- **ResumeEditor**: WYSIWYG editor for resume content
- **ResumeUpload**: File upload with parsing (PDF/DOCX)
- **TemplateSelector**: Template gallery and preview
- **ResumeOptimizer**: AI-powered resume optimization

### Database Architecture
- **Supabase** for authentication and data storage
- **RLS policies** for secure data access
- **Client utilities** separated by context:
  - `src/utils/supabase/client.ts` - Browser client
  - `src/utils/supabase/server.ts` - Server-side client
  - `src/utils/supabase/middleware.ts` - Middleware client

### AI Integration
- **OpenAI GPT-3.5-turbo** for resume optimization
- **Job description parsing** in `src/lib/jobDescriptionParser.ts`
- **Resume analysis** in `src/lib/resumeAnalyzer.ts`
- Rate limiting implemented to control API costs

### Testing Strategy
- **Vitest** for unit and integration testing
- **Jest** configured for React component testing
- **Manual testing** documentation in `tests/MANUAL_TESTING.md`

## Important Implementation Notes

### Authentication
- Uses Supabase Auth with middleware protection
- Session management handled by `src/middleware.ts`
- User profile data stored in Supabase with RLS policies

### PDF Generation
- Uses Puppeteer for HTML-to-PDF conversion
- Templates designed for consistent PDF output
- Fallback mechanisms for PDF generation failures

### Error Handling
- Global error boundary in `src/app/error-boundary.tsx`
- API protection utilities in `src/lib/api-protection.ts`
- Graceful degradation when AI services are unavailable

### Performance Optimization
- Performance monitoring in development via `src/components/PerformanceMonitor.tsx`
- Dynamic imports for heavy components
- PostHog analytics integration (optional)

### Security
- API route protection with authentication checks
- Input validation using Zod schemas
- Secure environment variable handling
- No secrets in client-side code

## Development Workflow

1. **Environment Setup**: Copy `.env.example` to `.env.local` and configure required variables
2. **Database Setup**: Run Supabase migrations from `src/lib/migrations/`
3. **Validation**: Always run `npm run validate:all` before major changes
4. **Testing**: Run relevant tests before committing changes
5. **Build Check**: Run `npm run build` to ensure production readiness