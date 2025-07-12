# Environment Setup Guide

This guide explains how to configure environment variables for the ResumeBuilder AI application.

## Overview

The application uses a consolidated environment configuration system with:
- **Runtime validation** for all environment variables
- **Type-safe access** to environment values
- **Automatic health checks** for external service connections
- **Clear error messages** for configuration issues

## Quick Setup

### 1. Copy Environment Template

```bash
cp .env.example .env.local
```

### 2. Configure Required Variables

Edit `.env.local` with your actual values:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_key

# OpenAI Configuration (Required)
OPENAI_API_KEY=your_actual_openai_key
```

### 3. Verify Configuration

Visit `http://localhost:3000/api/health` to check if all services are properly configured.

## Environment Variables Reference

### Required Variables

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | [Supabase Dashboard > Settings > API](https://app.supabase.com) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (public) | [Supabase Dashboard > Settings > API](https://app.supabase.com) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (secret) | [Supabase Dashboard > Settings > API](https://app.supabase.com) |
| `OPENAI_API_KEY` | OpenAI API key for AI features | [OpenAI Platform](https://platform.openai.com/api-keys) |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_MODEL` | OpenAI model to use | `gpt-3.5-turbo` |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog analytics key | None |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host URL | `https://app.posthog.com` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |
| `NODE_ENV` | Application environment | `development` |

## Security Best Practices

### Variable Prefixes

- **`NEXT_PUBLIC_`**: Variables accessible on the client-side (browser)
- **No prefix**: Server-side only variables (never exposed to browser)

### Sensitive Data Protection

- Never commit `.env.local` to version control
- Keep `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` secret
- Only use `NEXT_PUBLIC_` prefix for non-sensitive data

## Environment Validation

The application automatically validates environment variables on startup and API calls:

### Startup Validation
- Checks critical variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Shows clear error messages for missing or invalid values
- Prevents application startup with invalid configuration

### API Protection
- All API routes validate required environment variables
- Returns HTTP 500 with descriptive error for configuration issues
- Validates placeholder values and provides helpful error messages

### Health Check Endpoint

Access `/api/health` to get detailed status:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": {
    "valid": true,
    "errors": [],
    "warnings": []
  },
  "services": {
    "supabase": {
      "status": "connected",
      "message": "Successfully connected to Supabase auth"
    },
    "openai": {
      "status": "connected",
      "message": "OpenAI API accessible"
    },
    "database": {
      "status": "connected",
      "message": "Database queries working"
    }
  }
}
```

## Troubleshooting

### Common Issues

**1. Invalid Supabase URL**
```
Error: NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase project URL
```
- Ensure URL ends with `.supabase.co`
- Copy exact URL from Supabase dashboard

**2. OpenAI API Key Issues**
```
Error: OpenAI API key is using placeholder value
```
- Replace `your_openai_api_key_here` with actual API key
- Verify key starts with `sk-`

**3. Missing Service Role Key**
```
Error: Missing required environment variables: SUPABASE_SERVICE_ROLE_KEY
```
- Add service role key to `.env.local`
- Never use this key in client-side code

### Environment Status

Check environment status programmatically:

```typescript
import { getEnvironmentStatus } from '@/lib/env'

const status = getEnvironmentStatus()
console.log(status)
```

### Validation Errors

The application provides detailed validation errors:

```typescript
import { validateEnvironmentSync } from '@/lib/env'

const validation = validateEnvironmentSync()
if (!validation.isValid) {
  console.error('Environment errors:', validation.errors)
}
```

## Development vs Production

### Development (`.env.local`)
- Used for local development
- Contains actual API keys for testing
- Never committed to version control

### Production (Environment Variables)
- Set in your deployment platform (Vercel, etc.)
- Same variable names as `.env.local`
- Managed through deployment platform's environment interface

## CI/CD Integration

The environment validation system works in CI/CD pipelines:

```bash
# Validate environment in CI
npm run build  # Will fail if environment is invalid
```

## Migration from Old System

If upgrading from an older version:

1. **Remove old files**: Delete `.env.development.local`, `.env.local.backup`, `.env.local.template`
2. **Update imports**: Use new `env` object from `@/lib/env`
3. **Test validation**: Run health check to verify configuration

The new system provides better error messages and type safety compared to the previous setup.