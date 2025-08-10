# Deployment Stabilization Plan

- [DEPLOY-v0.1] Add Vercel config and ignore nested workspace ✅
  - Added `vercel.json` to pin Next.js framework, build/install commands, and output directory.
  - Added `.vercelignore` to exclude `resumebuilder-ai/`, `BMAD-METHOD/`, reports, screenshots, and tests from Vercel builds.

- [DEPLOY-v0.2] Decouple `next.config.js` from runtime env ✅
  - Removed `ts-node/register` and app `env` import.
  - Switched to `process.env` and set CORS default to `https://resumebuilderwithai.vercel.app` (override with `PRODUCTION_DOMAIN`).
  - Kept analyzer behind `ANALYZE` flag using `process.env`.

- [DEPLOY-v0.3] Serverless-compatible PDF generation ✅
  - Replaced `puppeteer` with `puppeteer-core` + `@sparticuz/chromium` in `src/app/api/export-pdf/route.ts`.
  - Pinned Node runtime and set `maxDuration` for heavy work.

- [DEPLOY-v0.4] Pin Node runtime/maxDuration for heavy API routes ✅
  - `export-pdf`, `generate`, `upload`, `scrape-job` now export `runtime = 'nodejs'` and `maxDuration = 60`.

- [DEPLOY-v0.5] Middleware/env hardening 💡
  - If Edge errors appear, consider moving any Node-only requires out of middleware dependency graph.

- [DEPLOY-v0.6] Prod CORS verification 💡
  - Set `PRODUCTION_DOMAIN` or `ALLOWED_ORIGINS` on Vercel if multiple domains are needed.

- [POST] Verification steps 💡
  - Test `/api/health/*`, login/signup, upload, scrape, generate, export-pdf on production.


