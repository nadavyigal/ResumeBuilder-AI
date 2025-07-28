# ResumeBuilder AI – Product Requirements Document (PRD)

> **Version 0.6 – July 15 2025** – AI-Guided Onboarding added, Stripe deferred to Phase 2, Template Library brought forward, PDF‑upload & env‑validation added, KPIs updated.

## 1 Intro

ResumeBuilder AI is a freemium web app that helps job‑seekers craft ATS‑compliant resumes aligned to specific job posts. The application combines AI rewriting, a WYSIWYG editor and professional templates that export reliably to PDF.

## 2 Goals & Context

* **Project Objectives**

  * Empower users to create high‑quality, ATS‑safe resumes tailored to job descriptions.
  * Showcase visually appealing, professional templates before asking for payment.
  * Establish a sustainable freemium model; defer paid plans & Stripe integration to **Phase 2**.
* **Measurable Outcomes (MVP)**

  * 1 000 free users within 3 months of launch.
  * ≥ 4.0 ★ average satisfaction.
  * ≥ 60 % first‑session "successful PDF export".
  * ≥ 30 % users returning for a second edit session within 7 days.

## 3 Success Criteria

The MVP is successful when a new user can:

1. Upload an existing resume (PDF/DOCX), or start from scratch.
2. Paste a job‑post URL.
3. Get AI‑drafted content and edit it inline.
4. Choose a template from the gallery.
5. Export a pixel‑perfect PDF that passes an external ATS check.

## 4 Key Performance Indicators (KPIs)

| KPI                              | Target             |
| -------------------------------- | ------------------ |
| First successful PDF export      | ≥ 60 % of sign‑ups |
| Repeat edit sessions / resume    | ≥ 0.3              |
| Free → Paid conversion (Phase 2) | 5 %                |

## 5 Scope & Requirements – MVP

### 5.1 Functional

* **Resume Upload & Parsing**: Accept PDF/DOCX; extract structured data; clear error on unsupported files.
* **PDF Upload Support**: Parse uploaded PDFs back into editable form.
* **Job Description Ingestion**: Scrape job‑post URL; extract keywords.
* **AI Generation**: Rewrite resume sections to match role; safe fallback when LLM unavailable.
* **Interactive Editor**: Real‑time WYSIWYG edits & regenerate per‑section.
* **Template Library** *(new Epic 2)*:

  1. Gallery grid with thumbnails & ATS badge.
  2. Live preview pane.
  3. Persist user's chosen template.
* **PDF Export**: HTML→PDF with fidelity guardrails; retry fallback.
* **Account System**: Supabase Auth; projects saved per user.

### 5.2 Non‑Functional

* **Performance**: AI generation < 10 s; initial load < 2 s.
* **Reliability**: 99.5 % uptime; graceful degradation.
* **Scalability**: 10 000 MAU in month 1.
* **Security & Privacy**: GDPR‑compliant; encrypted storage.
* **Environment Validation**: Build/start must fail fast if required env vars (Supabase, OpenAI…) missing.
* **Accessibility**: WCAG 2.1 AA.

### 5.3 UX Vision

Friendly, professional UI with minimal friction; skeleton states; accessibility built‑in.

### 5.4 Integration

Supabase (DB/Auth/Storage), OpenAI & LangChain, browserless scraper, Stripe *(Phase 2)*.

### 5.5 Testing & Quality

* Unit tests for parsing, AI helpers.
* Integration tests for full job→resume flow.
* Visual regression for template rendering.
* CI guard checking `.env.*` completeness.

### 5.6 Support & Feedback

Embedded feedback when exporting PDF; email support tiered.

### 5.7 AI-Guided Onboarding *(new)*

**Goal**: Provide intelligent, contextual guidance to help users successfully create their first resume without overwhelming complexity.

#### 5.7.1 Onboarding Wizard Flow

**Progressive Disclosure Approach**:
1. **Welcome Screen**: Brief value proposition + "Get Started" CTA
2. **User Intent Capture**: 
   - "I have an existing resume to improve"
   - "I want to create a new resume from scratch"
   - "I need help choosing a template"
3. **Context Gathering** (conditional based on intent):
   - Resume upload OR job URL input
   - Career level selection (Entry, Mid, Senior)
   - Industry/role preferences
4. **Template Selection**: AI-recommended templates based on context
5. **Success Preview**: Show generated resume with clear next steps

#### 5.7.2 AI Chat Assistant

**Contextual Help System**:
- **Smart Suggestions**: Proactive tips based on user's current step
- **Contextual Q&A**: Answer questions about resume writing, ATS optimization
- **Progressive Guidance**: Escalate complexity as user demonstrates competence
- **Error Recovery**: Help users fix common issues (formatting, content gaps)

**Chat Features**:
- **Non-intrusive**: Collapsible chat widget, doesn't block workflow
- **Context-Aware**: Understands user's current step and resume content
- **Actionable**: Provide specific suggestions, not just explanations
- **Learning**: Adapts to user's skill level and preferences

#### 5.7.3 Onboarding Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Onboarding completion rate | ≥ 75% | Users reaching PDF export |
| Time to first export | ≤ 8 minutes | Average from start to PDF |
| Chat engagement rate | 15-25% | Users who open chat during onboarding |
| Template selection rate | ≥ 80% | Users who select a template vs. default |

#### 5.7.4 Technical Implementation

**Wizard Components**:
- Multi-step form with progress indicator
- Conditional logic based on user selections
- Integration with existing upload/parsing systems
- Template recommendation algorithm

**Chat System**:
- OpenAI integration for contextual responses
- Session-based conversation memory
- Integration with resume content for personalized advice
- Fallback to static help content when AI unavailable

**User Experience Principles**:
- **No Heavy Gamification**: Focus on utility, not points/badges
- **Progressive Disclosure**: Show complexity only when needed
- **Contextual Help**: Right information at the right time
- **Graceful Degradation**: Works without AI if needed

### 5.8 Integration

Supabase (DB/Auth/Storage), OpenAI & LangChain, browserless scraper, Stripe *(Phase 2)*.

### 5.9 Testing & Quality

* Unit tests for parsing, AI helpers.
* Integration tests for full job→resume flow.
* Visual regression for template rendering.
* CI guard checking `.env.*` completeness.

### 5.10 Support & Feedback

Embedded feedback when exporting PDF; email support tiered.

## 6 Epic Overview (MVP)

| # | Epic                              | Goal                                         | Phase   |
| - | --------------------------------- | -------------------------------------------- | ------- |
| 1 | **Infrastructure & Auth**         | Local login + env validation + Supabase auth | MVP     |
| 2 | **Template Library**              | Users browse, preview & select templates     | MVP     |
| 3 | **AI ⇄ PDF Flow**                 | Generate, edit & export resumes              | MVP     |
| 4 | **Resume Parsing & Job Matching** | Upload & analyse resumes vs job posts        | MVP     |
| 5 | **AI-Guided Onboarding**          | Wizard + chat for seamless user experience   | MVP     |
| 6 | **Payments & Freemium Gating**    | Stripe, entitlements, premium templates      | Phase 2 |

## 7 Post‑MVP Ideas

Cover‑letter generation, LinkedIn sync, interview prep bot, analytics dashboard.

## 8 Technology Stack (confirmed)

* **Frontend**: Next.js 14 + Tailwind CSS.
* **Backend**: Vercel Functions (Node.js) + Supabase Database/PostgREST.
* **PDF**: Puppeteer via serverless.
* **Monitoring**: PostHog (optional).

## 9 Change Log

| Date       | Ver | Description                                              | Author |
| ---------- | --- | -------------------------------------------------------- | ------ |
| 2025‑05‑22 | 0.4 | Fallbacks & support added                                | PM GPT |
| 2025‑07‑15 | 0.5 | Stripe deferred, Template Library & env‑validation added | PM GPT |
| 2025‑07‑15 | 0.6 | AI-Guided Onboarding added with wizard + chat approach   | PM GPT |
