# ResumeBuilder AI

A modern resume builder application with AI assistance, built with Next.js, Tailwind CSS, and Supabase.

## Features

- User authentication (sign up, sign in, password reset)
- Modern, responsive UI with Tailwind CSS
- Secure data storage with Supabase
- AI-assisted resume building (coming soon)

## Prerequisites

- Node.js 18.x or later
- npm 9.x or later
- A Supabase account

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/nadavyigal/ResumeBuilder-AI.git
   cd ResumeBuilder-AI
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

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
resumebuilder-ai/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.