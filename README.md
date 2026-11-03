# 👷‍♂️🏢 JobIn - Job searching and learning for blue-collar workers

JobIn is a web platform for blue-collar workers (builders, drivers, technicians, tailors, cooks, and more) looking to find jobs and learn new skills. The platform is built to address the challenges in Indonesia, where there is no digital job platform like LinkedIn that caters specifically to the needs of low-income, rural communities. With the help of an advanced *AI voice assistant*, JobIn makes it easy for those with limited digital literacy to navigate the site. It also works well with *low internet connectivity*, ensuring accessibility for users in areas with limited resources.

## Overview

With JobIn you can:
- Browse and apply to available jobs around you
- Enroll in provided skill classes to improve your qualifications
- Use a built-in voicebot to navigate and complete tasks more easily (accessibility‑focused)

## Tech Stack

- Next.js 16 (App Router) + React + TypeScript
- Supabase: Postgres database, Auth, and Storage, shared with JobHire
- Groq (AI voice assistant) and Azure Speech (speech-to-text and text-to-speech)
- Tailwind CSS, deployed on Vercel

## Getting Started

### Prerequisites
- Node.js 20.9+ (LTS recommended)
- A Supabase project (one project serves both JobIn and JobHire)

### Installation

```sh
git clone https://github.com/Jasonnn13/JobIn.git
cd JobIn
npm install
```

### Set up Supabase

This repo holds the database schema for both apps.

1. Create a project at [supabase.com](https://supabase.com).
2. In the dashboard, open **SQL Editor** and run `supabase/migrations/20261103000000_init.sql`, then `supabase/seed.sql` (starter courses).
3. Under **Authentication → URL Configuration**, set the Site URL to your JobIn URL and add both apps' confirm routes to the redirect URLs, for example `https://your-jobin.vercel.app/auth/confirm` and `https://your-jobhire.vercel.app/auth/confirm` (plus `http://localhost:3000/auth/confirm` for development).
4. After any schema change, regenerate the types with `npx supabase gen types typescript --project-id <project-ref> > lib/supabase/database.types.ts` and copy the file to JobHire.

How data is protected: the browser talks to Supabase directly, so every rule lives in the migration. Row-level security limits which rows each user sees, column grants limit which fields they can write, and each account is permanently a **worker** (JobIn) or an **employer** (JobHire). `proxy.ts` only lets workers into JobIn's signed-in pages.

### Environment Variables

Create a `.env.local` file in the project root (it is git-ignored — never commit it):

```bash
# Supabase — from Project Settings → API (both are safe to expose to the browser)
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

# Groq — powers the voice assistant's answers (server only)
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b

# Azure Speech — speech-to-text / text-to-speech (server only;
# the browser receives short-lived tokens from /api/speech/token)
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=southeastasia
```

Notes:
- Only variables prefixed with `NEXT_PUBLIC_` reach the browser. Never put a secret (such as the Supabase secret key) in one; this app never needs it.
- The AI and speech routes are rate-limited per user (see `lib/api-guard.ts`), so free sign-ups can't run up costs.

### Run in Development

```sh
npm run dev
```

- App runs at http://localhost:3000
- You may be prompted by the browser to allow microphone access (voicebot) and location access (nearby jobs).

### Build and Run in Production

```sh
# Create an optimized production build
npm run build

# Start the production server
npm start
```

Ensure all required environment variables are set on your host before starting.

## Accessibility

- Voicebot: The app includes a voice assistant designed to help blind and low‑vision users navigate and perform key actions.
  - Requires microphone permission in the browser.
  - Look for an on‑screen toggle or settings entry to enable it.

## Deployment (Vercel)

1. Push your repository to GitHub.
2. In [Vercel](https://vercel.com/), click “New Project” and import the repository.
3. Framework preset: Next.js (auto-detected).
4. Add the same environment variables from `.env.local` to the Vercel project settings.
5. Deploy. Vercel will build and host the app, and automatically redeploy on new commits.
