# Environment & API Diagnostic Report

## 🔴 High Severity

1. **Supabase URL misconfigured**
   - `resumebuilder-ai/.env.local` uses a dashboard URL instead of the project API endpoint.
   - Line reference: `NEXT_PUBLIC_SUPABASE_URL` line 3.
   - Fix: replace with `https://<project>.supabase.co`.
2. **Missing critical environment variables**
   - `.env.local` lacks `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `NODE_ENV`, and more.
   - See `diagnostics/env-summary.json` for full list.
3. **Deprecated Supabase client imports**
   - Components import `supabase` from `@/lib/supabase` (e.g., `src/components/Navigation.tsx:7`).
   - Update to use utilities in `src/utils/supabase/` to avoid multiple client instances.

## 🟠 Medium Severity

1. **Fallback OpenAI API key**
   - `src/lib/openai.refactored.ts` defaults to `'test-key'` when `OPENAI_API_KEY` is absent.
   - Could accidentally send requests with a placeholder key.
2. **Multiple Supabase client instantiations**
   - Pages create new clients via `createClient()` (e.g., `src/app/login/page.tsx`), leading to inconsistent sessions.
3. **External avatar URL**
   - `src/components/Avatar.tsx` loads images from `https://api.dicebear.com` which may leak user emails.

## 🟢 Low Severity

1. Example `.env` file includes UTF‑8 BOM (line 1) which may cause tooling issues.
2. No log files found under `logs/` for API error review.

---
Generated by env-and-api-diagnostic.
