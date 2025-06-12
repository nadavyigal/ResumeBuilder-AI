# ResumeBuilder AI Product Requirements Document (PRD)

## Intro

ResumeBuilder AI is a freemium web app that empowers job seekers to generate customized, ATS-optimized resumes quickly and easily. It uses AI to align users' existing resumes with job descriptions (via URL), outputting tailored content embedded in professionally designed templates. The MVP targets a 4-month launch window and prioritizes usability, content quality, and conversion to premium.

## Goals and Context

* **Project Objectives:**

  * Help users craft high-quality, ATS-compliant resumes tailored to job postings.
  * Provide interactive editing and visually appealing resume templates.
  * Establish a sustainable freemium model with upsell to premium features.
* **Measurable Outcomes:**

  * 1,000 free users within 3 months post-launch.
  * 5% free-to-paid conversion rate.
  * User satisfaction scores ≥ 4.0 stars.
  * Qualitative improvements in ATS success reported by users.
* **Success Criteria:**

  * Fully functional resume parsing, job description analysis, and AI rewriting.
  * PDF export with design fidelity.
  * Seamless account management and freemium gating.
* **Key Performance Indicators (KPIs):**

  * Monthly Recurring Revenue (MRR)
  * Free-to-paid conversion rate
  * User session time per resume
  * ATS optimization feedback ratings

## Scope and Requirements (MVP / Current Version)

### Functional Requirements (High-Level)

* **Resume Upload and Parsing**: Accept PDF/DOCX and extract structured content (roles, dates, skills). Handle invalid formats with clear error modals.
* **Job Description Ingestion**: Scrape job description from URL and extract keywords and role context. Show validation/loading errors if the URL is missing or fails to load.
* **AI-Powered Resume Generation**: Rewrites sections (summary, bullets) to align with job description. Gracefully degrade with fallback messaging if LLM is unavailable.
* **Interactive Resume Editor**: WYSIWYG-style interface for real-time edits and re-generation.
* **Template System**: ATS-safe, professional HTML/CSS-based templates with PDF export. Notify users of failures and provide retry/export as plain text fallback.
* **Account System**: Signup/login, save projects, track versions using Supabase Auth.
* **Freemium Model**: Usage caps on free tier, gated premium templates/downloads via Supabase row-level security.

### Non-Functional Requirements (NFRs)

* **Performance**: Resume generation < 10s, load time < 2s.
* **Scalability**: Handle up to 10,000 users in month 1 with growth.
* **Reliability**: 99.5% uptime, error-resilient parsing/generation.
* **Security**: GDPR-compliant data handling; Supabase Auth JWTs; encrypted storage.
* **Maintainability**: Modular services, documented codebase.
* **Usability/Accessibility**: Responsive web app, accessible forms and content.
* **Other Constraints**: PDF fidelity across browsers, LLM integration via API.

### User Experience (UX) Requirements (High-Level)

* **Overall Vision & Experience**: Friendly, professional, minimal interface guiding users clearly.
* **Key Interaction Paradigms**: Job-to-resume workflow; editable preview; dynamic content tweaks.
* **Core Screens/Views**:

  * Landing Page / Onboarding
  * Dashboard (Saved Resumes)
  * Resume Editor (upload, edit, preview)
  * Template Selector
  * Account / Subscription
* **Accessibility Aspirations**: WCAG 2.1 AA for all forms.
* **Branding Considerations**: Neutral, professional color scheme; logo to be developed.
* **Target Devices/Platforms**: Web-first, responsive (desktop/tablet priority).

### Integration Requirements (High-Level)

* Resume parsing & NLP (e.g., LangChain/OpenAI APIs)
* Job description scraping (browserless or scraper API)
* Stripe for payments
* Supabase (auth, database, storage)
* Email delivery (via Supabase or SendGrid)

### Testing Requirements (High-Level)

* Full unit test coverage for parsing and generation components.
* Integration tests for end-to-end job → resume flow.
* Manual QA for template rendering and PDF output.
* Load testing for generation endpoints.
* CI setup, test coverage targets, rollback/failure handling for deploys.

### Support and Feedback (MVP)

* Email-based support using contact form in Account area.
* Feedback module embedded in PDF export and onboarding screen.
* Tier 1: auto-responses + FAQ, Tier 2: manual triage via shared inbox.

### User Documentation

* Basic onboarding UI with tooltips.
* Planned stub: `docs/user-guide.md` to expand post-launch.

## Epic Overview (MVP / Current Version)

* **Epic 1: Infrastructure & User Onboarding** – Goal: Set up monorepo, deploy base app, Supabase auth, and initial UI structure.
* **Epic 2: Resume Parsing & Job Matching** – Goal: Ingest user resume and job post, extract structured data for AI processing.
* **Epic 3: AI Resume Generation & Editing** – Goal: Deliver AI-written resumes, enable user editing and iterative refinement.
* **Epic 4: Templates & PDF Export** – Goal: Apply professional templates and ensure reliable PDF output.
* **Epic 5: Freemium Gating & Payments** – Goal: Gate features by tier, integrate Stripe and Supabase RLS, manage entitlements.

## Key Reference Documents

* `docs/project-brief.md`
* `docs/architecture.md`
* `docs/epic1.md`, `docs/epic2.md`, ...
* `docs/tech-stack.md`
* `docs/api-reference.md`
* `docs/testing-strategy.md`
* `docs/environment-setup.md`
* `docs/coding-standards.md`
* `docs/project-structure.md`
* `docs/ui-ux-spec.md`
* `docs/user-guide.md`

## Post-MVP / Future Enhancements

* Resume-to-LinkedIn profile generator
* Cover letter generation
* Resume version tracking and A/B comparison
* AI interview prep assistant
* Inline user feedback (NPS, export ratings)
* Analytics setup (e.g., PostHog) and error logging
* **Technical Debt Tracker**: Track suboptimal implementations or deferred tasks.
* **Feature Roadmapping**: Validate feature demand before implementation (via analytics + user feedback).

## Technology Stack Selections

* **Backend**: Node.js (Express)
* **Frontend**: React (Next.js)
* **Database**: Supabase (PostgreSQL)
* **PDF Generator**: Puppeteer (HTML → PDF)
* **Auth**: Supabase Auth (JWT-based)
* **UI Library**: Tailwind CSS
* **Payment**: Stripe
* **Cloud**: Vercel (Frontend), Supabase (backend/db)

## Change Log

| Change              | Date       | Version | Description                                        | Author |
| ------------------- | ---------- | ------- | -------------------------------------------------- | ------ |
| Initial Draft       | 2025-05-22 | 0.1     | First full PRD for MVP                             | PM GPT |
| Checklist Edits     | 2025-05-22 | 0.2     | PO feedback integration                            | PM GPT |
| Supabase Migration  | 2025-05-22 | 0.3     | Updated from MongoDB/Auth0 to Supabase             | PM GPT |
| Fallbacks & Support | 2025-05-22 | 0.4     | Added edge-case handling, support model, user docs | PM GPT |