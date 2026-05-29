# PrepTalk

PrepTalk is a Next.js interview platform for running live mock interviews and coding assessments. Interviewers can create sessions, invite candidates, run video/chat rooms, generate prep material, manage lab assessments, and review submissions. Interviewees can join assigned sessions, use the shared workspace, complete coding tests, and view feedback.

## Features

- Role-based interviewer and interviewee dashboards
- Email/password auth with HTTP-only JWT cookies
- Interview session creation with invite links, agenda, skills, level, and interview type
- Live video rooms using Ably signaling and WebRTC
- Server-persisted realtime chat with presence
- Shared notes/code workspace
- Gemini-powered question banks, prep guides, report summaries, and lab debugging hints
- Structured scorecards, interview reports, and progress summaries
- Lab assessment templates, custom builders, section/test-case editing, candidate assignment, deadlines, and PDF export
- Candidate coding assessment flow with local visible-test runs and server-side final grading
- Responsive admin and candidate lab views for desktop and mobile

## Tech Stack

- Next.js App Router
- React
- MongoDB with Mongoose
- Ably realtime channels
- Gemini API
- Tailwind CSS
- bcryptjs and jose for auth

## Environment

Create `.env.local`:

```bash
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_long_random_jwt_secret
ABLY_API_KEY=your_ably_api_key
GEMINI_API=your_gemini_api_key
GEMINI_MODEL=gemini-3.1-flash-lite
```

`GEMINI_MODEL` is optional. If omitted, the default in `src/lib/gemini.js` is used.

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev
npm run build
npm run start
npm audit --omit=dev
```

## App Structure

- `src/app/api` - API routes for auth, sessions, reports, realtime tokens, and lab assessments
- `src/app/components` - shared interview UI components
- `src/app/components/lab` - lab admin, builder, candidate, grading UI, and utilities
- `src/lib` - auth, validation, API helpers, database, Gemini, Ably, rate limiting, and lab access helpers
- `src/models` - Mongoose models
- `public/preptalk-logo.svg` - static logo asset
- `src/app/components/PrepTalkLogo.jsx` - reusable React logo

## Security Notes

The app includes basic protections:

- HTTP-only auth cookie
- Role and ownership checks on protected APIs
- Email validation and input length limits
- Generic API 500 responses
- Basic in-memory rate limiting for auth, lab explanations, and submissions
- Server-persisted chat messages; clients do not receive chat publish capability
- Server-side final lab grading

Important production caveats:

- The current rate limiter is in-memory. On Vercel/serverless or multiple instances, use shared storage such as Upstash Redis or Vercel KV.
- Lab grading currently runs candidate code through a Node worker and `node:vm`. This is acceptable for development/MVP hardening, but not a full hostile-code sandbox. Production grading should run in an isolated container/service with no app secrets, no filesystem access, no network access, and strict CPU/memory limits.

## Deployment

For Vercel:

1. Add all environment variables in Project Settings.
2. Use a production MongoDB database.
3. Configure Ably and Gemini keys.
4. Replace the in-memory rate limiter with a shared store before public/high-traffic use.
5. Move lab grading to an isolated runner before treating candidate code as hostile.

Build check:

```bash
npm run build
```
