# ResumeBuilder AI Architecture Document

## Technical Summary

ResumeBuilder AI is a freemium web application designed to help job seekers create ATS-optimized resumes tailored to job descriptions. The architecture is based on a serverless monorepo pattern using an NX workspace. It integrates a Next.js frontend hosted on Vercel, Node.js-based serverless API functions, and Supabase (PostgreSQL + Supabase Auth) for data persistence and authentication. Key functional components include resume parsing, job description ingestion, AI-driven content rewriting, and a template engine with PDF export. The platform integrates with LLMs, Stripe for payments, and ensures GDPR-compliant file handling and storage.

## High-Level Overview

The system adopts a serverless architecture with a modular monorepo layout. All core features are built as reusable packages shared between the frontend and backend. User interactions follow a linear workflow: upload resume → input job URL → generate content → edit → export PDF.

## Component View

```
User → Next.js Web App → Serverless API (Node.js)
                      ↓
                   Supabase/PostgreSQL
                      ↓
              Resume Parser Module
              Job Matcher Module
              AI Rewrite Module
              Template Renderer
```

## Key Architectural Decisions & Patterns

* **Monorepo with NX**: Centralized workspace for all frontend, backend, and shared logic.
* **Serverless API**: Scalable, low-maintenance backend using Vercel Functions.
* **LLM Integration via API**: Externalized for scalability and rapid iteration.
* **Template-Driven Rendering**: Ensures ATS compliance while supporting visual design.
* **Puppeteer-based PDF Generation**: Guarantees high-fidelity export.
* **Freemium Model with Stripe**: Feature and export gating tied to plan level.
* **Secure File Uploads**: Temporary processing with scan hooks (optional virus scan).
* **Monitoring**: PostHog for analytics; structured error logging.
* **Secure Key Handling**: Environment variables managed via `.env`, examples in `.env.example`.
* **Fallback Behavior**: Graceful degradation for external failures (Stripe, Supabase, LLM APIs).

## Supabase Considerations

* **Database Schema** (PostgreSQL):

  * `users`: id (uuid), email, stripe_customer_id, created_at
  * `resumes`: id, user_id, content (JSONB), title, created_at, updated_at
  * `jobs`: id, user_id, url, scraped_data (JSONB), created_at
  * `templates`: id, name, html, css
  * `sessions`, `logs`, `metrics` (optional for tracking/debugging)

* **Authentication Flow:**

  * Frontend handles sign-in/sign-up via Supabase Auth.
  * JWT is stored client-side and sent with each request to serverless APIs.
  * APIs use Supabase client to validate JWT, authorize user, and perform DB queries.

* **Environment Variables:**

  * `SUPABASE_URL`
  * `SUPABASE_ANON_KEY`
  * `SUPABASE_SERVICE_ROLE_KEY`
  * `DATABASE_URL` (optional direct Postgres connection)

## Infrastructure and Deployment Overview

* **Cloud Provider**: Vercel (frontend & serverless), Supabase (DB + Auth)
* **Core Services**:

  * Vercel Functions (API)
  * Supabase (Postgres, Auth)
  * Stripe (Billing)
  * OpenAI API (AI rewriting)
  * PostHog (Analytics)
* **IaC:**

  * Supabase CLI for DB setup and migrations
  * Manual dashboard edits discouraged; any change tracked in versioned SQL
  * Vercel managed via `vercel.json` and GitHub CI

## Monitoring and Alerting

* **Analytics:** PostHog embedded in frontend
* **Error Logging:** JSON structured logs from API via Vercel console
* **Alerts:** Vercel deploy and error alerts routed to Slack + email via webhook integration

## Change Log

| Change        | Date       | Version | Description                                                | Author          |
| ------------- | ---------- | ------- | ---------------------------------------------------------- | --------------- |
| Initial draft | 2025-05-22 | 0.1     | Initial draft based on PRD                                 | Architect Agent |
| Update 1      | 2025-05-22 | 0.2     | Migrated backend from MongoDB/Auth0 to Supabase            | Architect Agent |
| Update 2      | 2025-05-22 | 0.3     | Added migration, seed, LLM fallback, infra, and email info | Architect Agent |