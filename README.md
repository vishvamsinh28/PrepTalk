# PrepTalk

PrepTalk is a Next.js interview practice app for creating mock interview sessions, joining live rooms, chatting in real time, sharing workspace notes, and reviewing structured feedback.

## Features

- Role-based interviewer and interviewee workspaces
- Session creation with invite links, agenda, skills, level, and interview type
- Live video room with realtime chat and presence
- Shared whiteboard and coding pad
- Gemini-powered AI question banks, prep guides, and report summaries
- Structured interview scorecards and progress summaries
- Custom PrepTalk SVG logo used across the navbar, landing page, auth screens, and favicon

## Getting Started

Create a `.env.local` file with your app credentials:

```bash
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
ABLY_API_KEY=your_ably_api_key
GEMINI_API=your_gemini_api_key
GEMINI_MODEL=gemini-3.1-flash-lite
```

`GEMINI_MODEL` is optional. If it is not set, the app uses the default model configured in `src/lib/gemini.js`.

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Useful Scripts

```bash
npm run dev
npm run build
npm run start
```

## Branding

The reusable React logo lives at `src/app/components/PrepTalkLogo.jsx`.

The static SVG asset lives at `public/preptalk-logo.svg`, and the app-router favicon source lives at `src/app/icon.svg`.
