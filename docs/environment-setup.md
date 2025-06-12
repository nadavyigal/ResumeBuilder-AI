# Environment Setup Guide

## Prerequisites

- Node.js 18.x or later
- npm 9.x or later
- Git
- A Supabase account
- (Optional) A PostHog account for analytics

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/nadavyigal/ResumeBuilder-AI.git
cd ResumeBuilder-AI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# PostHog Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_project_api_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 4. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to find your project URL and anon key
3. Copy these values to your `.env.local` file

### 5. PostHog Setup (Optional)

1. Create a new project at [posthog.com](https://posthog.com)
2. Copy your project API key to your `.env.local` file
3. If you don't want analytics, you can leave these fields empty

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses Supabase Auth for user management. No additional database setup is required for the MVP.

## Troubleshooting

### Common Issues

1. **"Missing env.NEXT_PUBLIC_SUPABASE_URL" error**
   - Make sure you've created the `.env.local` file
   - Verify the environment variable names match exactly

2. **Authentication not working**
   - Check your Supabase project URL and anon key
   - Ensure your Supabase project is active

3. **Build errors**
   - Clear the Next.js cache: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

### Getting Help

If you encounter issues:

1. Check the [GitHub Issues](https://github.com/nadavyigal/ResumeBuilder-AI/issues)
2. Review the [Supabase documentation](https://supabase.com/docs)
3. Check the [Next.js documentation](https://nextjs.org/docs)

## Production Deployment

For production deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Add environment variables in the Vercel dashboard
3. Deploy automatically on push to main branch

See the main README.md for more deployment details.