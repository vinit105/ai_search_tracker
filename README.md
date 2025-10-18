# AI Search Visibility Tracker (AEO Dashboard)

This is a starter full-stack Next.js 14 (App Router) TypeScript app that simulates tracking brand visibility across AI search engines (ChatGPT, Gemini, Claude, Perplexity) using Supabase for Auth and Postgres storage.

## Features
- Email/password auth via Supabase Auth
- Row Level Security (RLS) for multi-tenancy
- Projects and Checks data models
- API endpoint to simulate visibility checks
- Seed script to create demo data (demo@example.com / password123)
- Dashboard with visibility score and simple trends (Recharts)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (keep this secret!)

### 3. Create database tables

Run the SQL in `db/schema.sql` in the Supabase SQL editor to create tables and RLS policies.

### 4. Seed demo data

```bash
npm run seed
```

This creates a demo user (demo@example.com / password123) with sample project and 14 days of visibility checks.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Schema

### Tables

**projects**
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `domain` (text)
- `brand` (text)
- `competitors` (text[])
- `keywords` (text[])
- `created_at` (timestamptz)

**checks**
- `id` (uuid, primary key)
- `project_id` (uuid, foreign key to projects)
- `engine` (text: ChatGPT, Gemini, Claude, Perplexity)
- `keyword` (text)
- `position` (int)
- `presence` (boolean)
- `answer_snippet` (text)
- `citations_count` (int)
- `observed_urls` (text[])
- `timestamp` (timestamptz)

### Row Level Security (RLS)

- **projects**: Users can only read/modify their own projects (`user_id = auth.uid()`)
- **checks**: Users can only read checks for projects they own. Inserts typically done via service role.

## API

### POST /api/checks/run

Generates simulated visibility checks for a project.

**Request body:**
```json
{
  "project_id": "uuid-here",
  "keywords": ["optional", "keyword", "list"]
}
```

**Response:**
```json
{
  "inserted": 48
}
```

## Deployment

This app is ready for Vercel:
1. Push to GitHub
2. Import to Vercel
3. Add environment variables in project settings
4. Deploy!

## Demo Credentials

After running the seed script:
- Email: `demo@example.com`
- Password: `password123`

## Features Completed ✅

- ✅ Email/password authentication with Supabase Auth
- ✅ Login/logout functionality
- ✅ Multi-tenant with Row Level Security (RLS)
- ✅ 5 demo projects with different domains
- ✅ 14 days of simulated visibility checks per project
- ✅ Dashboard with visibility score and trend charts
- ✅ Recent checks table with keyword/engine breakdown
- ✅ API endpoint for generating more checks
- ✅ Fully deployable to Vercel

## Optional Enhancements

- [ ] Add signup page for new users
- [ ] Install ShadCN UI components for better styling
- [ ] Add keyword drill-down page
- [ ] Implement recommendations engine (e.g., "Missing on Gemini")
- [ ] Add charts for engine-specific breakdowns
- [ ] Add loading states and error handling
- [ ] Add ability to create new projects from UI
