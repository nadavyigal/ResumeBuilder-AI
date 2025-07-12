# Fix Environment Setup - ResumeBuilder AI

## Issue Identified
The application is failing because the Supabase URL in your `.env.local` file is set to a placeholder value (`your_supabase_project_url`) instead of a real Supabase URL.

## Solution

1. **Get your Supabase credentials:**
   - Go to [https://supabase.com](https://supabase.com) and log in
   - Create a new project if you haven't already
   - Go to your project settings
   - Find your project URL (looks like: `https://abcdefghijklmnop.supabase.co`)
   - Find your anon/public key

2. **Update your `.env.local` file:**
   Replace the placeholder values with your actual Supabase credentials:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

3. **Required environment variables:**
   Your `.env.local` file should contain at minimum:
   ```
   # Supabase (Required)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   
   # OpenAI (Required for AI features)
   OPENAI_API_KEY=sk-your-openai-api-key
   
   # PostHog (Optional - for analytics)
   NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
   NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
   ```

4. **Restart the development server:**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

## Setting up Supabase Database

After fixing the environment variables, you'll need to set up the database tables:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the migration script from `src/lib/migrations/001_user_profile_resume.sql`

## Verification

After updating the environment variables and restarting the server:
1. Visit http://localhost:3000/test-supabase to verify Supabase connection
2. Visit http://localhost:3000 to see the main application

## Common Issues

- **Invalid URL error**: Make sure the Supabase URL starts with `https://` and ends with `.supabase.co`
- **Missing anon key**: The anon key is a long string (usually 200+ characters) that starts with `eyJ`
- **Server not updating**: Always restart the Next.js server after changing environment variables 