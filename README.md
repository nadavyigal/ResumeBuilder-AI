# ResumeBuilder AI

A modern resume builder application with AI assistance, built with Next.js, Tailwind CSS, and Supabase.

## Features

- User authentication (sign up, sign in, password reset)
- Modern, responsive UI with Tailwind CSS
- Secure data storage with Supabase
- Resume upload and parsing (DOCX format, PDF coming soon)
  - Drag & drop file upload
  - Automatic parsing of work history, education, and skills
  - Real-time progress tracking
  - Secure storage in Supabase
- AI-assisted resume building (coming soon)

## Prerequisites

- Node.js 18.x or later
- npm 9.x or later
- A Supabase account

## Getting Started

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd resumebuilder-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up Supabase:
   - Create a new project in Supabase
   - Create a `resumes` table with the following schema:
     ```sql
     create table resumes (
       id uuid default uuid_generate_v4() primary key,
       user_id uuid references auth.users(id),
       original_filename text not null,
       parsed_data jsonb not null,
       raw_text text not null,
       status text not null,
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
│   │   └── api/         # API routes including resume upload
│   ├── components/       # React components
│   │   └── ResumeUpload.tsx  # Resume upload component
│   ├── lib/             # Utility functions and configurations
│   └── styles/          # Global styles and Tailwind CSS
├── public/              # Static assets
├── .env.local          # Environment variables (create this file)
└── package.json        # Project dependencies and scripts
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
  - file: DOCX file (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "parsed": {
      "personalInfo": { ... },
      "experience": [ ... ],
      "education": [ ... ],
      "skills": [ ... ]
    }
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 