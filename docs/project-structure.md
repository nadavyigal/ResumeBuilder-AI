# Project Structure

This document outlines the structure and organization of the ResumeBuilder AI codebase.

## Root Directory

```
ResumeBuilder-AI/
├── src/                    # Source code
├── docs/                   # Documentation
├── public/                 # Static assets
├── @plan.md               # Development plan and progress tracking
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── next-env.d.ts          # Next.js TypeScript definitions
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
└── README.md              # Project overview and setup
```

## Source Code Structure (`src/`)

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing page
│   ├── layout.tsx          # Root layout with metadata
│   ├── globals.css         # Global styles
│   ├── loading.tsx         # Loading UI
│   ├── error.tsx           # Error boundary
│   ├── not-found.tsx       # 404 page
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   ├── dashboard/          # Dashboard (authenticated)
│   ├── profile/            # User profile
│   └── resumes/            # Resume management
│       ├── new/            # Create new resume
│       └── [id]/           # Edit existing resume
│           └── edit/       # Resume editor
├── components/             # Reusable React components
│   ├── Auth.tsx            # Authentication component
│   ├── PostHogProvider.tsx # Analytics provider
│   ├── DashboardLayout.tsx # Dashboard layout
│   ├── ProfileForm.tsx     # Profile form
│   ├── Avatar.tsx          # User avatar component
│   └── SupabaseTest.tsx    # Supabase connection test
├── lib/                    # Utility functions and configurations
│   ├── supabase.ts         # Supabase client configuration
│   ├── posthog.ts          # PostHog analytics setup
│   ├── db.ts               # Database utilities
│   └── migrations/         # Database migrations
├── types/                  # TypeScript type definitions
│   └── supabase.ts         # Supabase type definitions
└── styles/                 # Additional styles (if needed)
```

## Documentation Structure (`docs/`)

```
docs/
├── PRD.md                  # Product Requirements Document
├── architecture.md         # Technical architecture
├── environment-setup.md    # Development setup guide
├── project-structure.md    # This file
└── stories/                # User stories and requirements
    └── templates/          # Template specifications
```

## Key Architectural Patterns

### 1. Next.js App Router
- Uses the new App Router for file-based routing
- Server and client components are clearly separated
- Layouts provide consistent structure across pages

### 2. Component Organization
- **Pages**: Located in `src/app/` following App Router conventions
- **Components**: Reusable UI components in `src/components/`
- **Utilities**: Helper functions and configurations in `src/lib/`
- **Types**: TypeScript definitions in `src/types/`

### 3. State Management
- Supabase Auth for authentication state
- React hooks for local component state
- PostHog for analytics and user tracking

### 4. Styling
- Tailwind CSS for utility-first styling
- Global styles in `src/app/globals.css`
- Component-specific styles using Tailwind classes

## File Naming Conventions

- **Components**: PascalCase (e.g., `AuthComponent.tsx`)
- **Pages**: lowercase with hyphens (e.g., `sign-up/page.tsx`)
- **Utilities**: camelCase (e.g., `supabase.ts`)
- **Types**: camelCase with descriptive names (e.g., `userTypes.ts`)

## Import Conventions

```typescript
// External libraries first
import React from 'react'
import { NextPage } from 'next'

// Internal utilities and types
import { supabase } from '@/lib/supabase'
import { User } from '@/types/user'

// Components last
import AuthComponent from '@/components/Auth'
```

## Environment Configuration

- **Development**: `.env.local` (not committed)
- **Production**: Environment variables set in deployment platform
- **Example**: `.env.example` (committed as template)

## Future Structure Considerations

As the project grows, consider:

1. **Feature-based organization**: Group related components, hooks, and utilities by feature
2. **Shared packages**: Extract common utilities into separate packages
3. **API routes**: Add API routes in `src/app/api/` for server-side functionality
4. **Testing**: Add `__tests__` directories alongside components
5. **Storybook**: Add `.storybook/` for component documentation

This structure supports the current MVP while allowing for future scalability and maintainability.