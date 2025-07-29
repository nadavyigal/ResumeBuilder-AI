# 🚀 ResumeBuilder AI - Backend Setup Guide

## Current Status

✅ **Working:**
- Database connection established
- Basic tables (`profiles`, `resumes`) exist and functioning
- Application builds successfully
- Test suite passes (10/10 tests)
- Environment variables properly configured

⚠️ **Needs Setup:**
- Service role key invalid/expired
- Missing tables: `chat_interactions`, `job_scrapings`

## Quick Setup Steps

### 1. Update Service Role Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `krkcsarxayskwaeazate`
3. Navigate to Settings > API
4. Copy the **service_role** key (not the anon key)
5. Update `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

### 2. Apply Database Migrations

Once you have the valid service role key:

```bash
node setup-database.js
```

This will create the missing tables:
- `chat_interactions` - for AI chat features
- `job_scrapings` - for job posting analysis

### 3. Verify Setup

```bash
npm run validate:all
```

## Database Schema

### Existing Tables ✅
- **profiles**: User profile information
- **resumes**: User resume data with JSONB content

### Missing Tables (will be created) 📝
- **chat_interactions**: AI assistant conversation history
- **job_scrapings**: Scraped job posting data for optimization

## API Endpoints Status

| Endpoint | Status | Description |
|----------|--------|-------------|
| `/api/upload` | ✅ Ready | Resume file upload |
| `/api/generate` | ✅ Ready | AI resume generation |
| `/api/export-pdf` | ✅ Ready | PDF export functionality |
| `/api/chat` | ⚠️ Needs DB | AI chat assistant |
| `/api/scrape-job` | ⚠️ Needs DB | Job posting scraper |
| `/api/goal-wizard` | ⚠️ Needs DB | Goal-based optimization |

## Security Features ✅

- Row Level Security (RLS) enabled on all tables
- User-specific data access policies
- Authentication required for all operations
- Secure environment variable handling

## Next Steps

1. **Update service role key** in `.env.local`
2. **Run migration script**: `node setup-database.js`
3. **Test endpoints**: `npm run validate:all`
4. **Start development**: `npm run dev`

## Troubleshooting

### "Invalid API key" Error
- Get fresh service role key from Supabase dashboard
- Ensure key starts with `eyJ` and is much longer than anon key

### Schema Validation Fails
- Run `node setup-database.js` to create missing tables
- Check service role key has admin permissions

### Build Warnings
- Edge Runtime warnings are normal and don't affect functionality
- Application builds successfully despite warnings

## Files Created

- `setup-database.js` - Migration script
- `test-connection.js` - Connection test utility  
- `test-service-key.js` - Service key validator
- `SETUP.md` - This documentation

Run `node setup-database.js` after updating your service role key to complete the setup!