# ResumeBuilder AI

A modern resume builder application with AI-powered resume optimization, built with Next.js, Tailwind CSS, and Supabase.

## Features

- User authentication (sign up, sign in, password reset)
- Modern, responsive UI with Tailwind CSS
- Secure data storage with Supabase
- Resume upload and parsing (DOCX and PDF formats)
  - Drag & drop file upload
  - Automatic parsing of work history, education, and skills
  - Real-time progress tracking
  - Secure storage in Supabase
- **AI-Powered Resume Optimization** (NEW)
  - Analyze job descriptions to extract key requirements
  - Optimize resumes to match job requirements
  - Keyword matching and relevance scoring
  - Intelligent suggestions for improvement
  - Rate-limited API to control costs

## Prerequisites

- Node.js 18.x or later
- npm 9.x or later
- A Supabase account
- OpenAI API key (for AI features)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/resumebuilder-ai.git
   cd resumebuilder-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL=gpt-3.5-turbo  # Optional, defaults to gpt-3.5-turbo
   ```

4. Set up Supabase:
   - Create a new project in Supabase
   - Create a `resumes` table with the following schema:
     ```sql
     create table resumes (
       id uuid default uuid_generate_v4() primary key,
       user_id uuid references auth.users(id),
       original_filename text,
       parsed_data jsonb not null,
       raw_text text not null,
       confidence_score float,
       parsing_issues text[],
       status text default 'active',
       created_at timestamp with time zone default timezone('utc'::text, now()),
       updated_at timestamp with time zone default timezone('utc'::text, now())
     );
     ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
resumebuilder-ai/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   └── api/          # API routes
│   │       ├── upload/   # Resume upload endpoint
│   │       └── generate/ # AI resume generation endpoint
│   ├── components/       # React components
│   │   └── ResumeUpload.tsx  # Resume upload component
│   ├── lib/              # Utility functions and configurations
│   │   ├── openai.ts     # OpenAI integration
│   │   ├── jobDescriptionParser.ts  # Job parsing utilities
│   │   └── resumeAnalyzer.ts       # Resume analysis utilities
│   └── styles/           # Global styles and Tailwind CSS
├── public/               # Static assets
├── docs/                 # Documentation
│   └── api-documentation.md  # API reference
├── .env.local           # Environment variables (create this file)
└── package.json         # Project dependencies and scripts
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## API Routes

### POST /api/upload
Handles resume file uploads and parsing.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: 
  - file: DOCX or PDF file (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "personalInfo": { ... },
    "experience": [ ... ],
    "education": [ ... ],
    "skills": [ ... ],
    "confidence": { ... }
  }
}
```

### POST /api/generate
Generates an optimized resume using AI based on job requirements.

**Request:**
```json
{
  "resume": "string",
  "jobDescription": "string"
}
```

**Response:**
```json
{
  "optimizedContent": "string",
  "analysis": {
    "keywords": ["string"],
    "relevantSections": ["string"],
    "relevanceScore": 85,
    "suggestions": ["string"]
  }
}
```

See [API Documentation](docs/api-documentation.md) for detailed API reference.

## Testing

Run the test suite:
```bash
npm test
```

Manual testing of the AI generation endpoint:
```bash
node test-generate-api.js
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
