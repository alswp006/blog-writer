# Blog Writer

## Overview

Blog Writer is a Next.js 15 web application that helps users create blog posts in their own writing style. Users train a personal style profile from sample text or URLs, then generate draft posts that reflect their unique voice.

## Features

- **User Authentication** — Sign up / login with email and password; session-based auth with secure HTTP-only cookies
- **Style Profile Training** — Train from a public URL (auto-fetched and extracted) or by pasting sample text (1,000–20,000 chars)
- **Style Analysis** — Auto-generated summary of writing characteristics: sentence patterns, word count, rhetorical devices, punctuation style
- **Writing Request & Draft Generation** — Submit a topic with optional title hint, key points, and constraints to generate a Markdown draft
- **Subscription Tiers** — Free, Pro, and Enterprise tiers powered by Stripe; webhook-driven status updates
- **Feature Access Control** — Tier-based feature gating via a configurable feature registry
- **SEO** — Dynamic metadata, Open Graph image generation, robots.txt, sitemap, and JSON-LD structured data
- **Analytics & Ads** — Optional Google Analytics 4 and Google AdSense integration

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Frontend | React 19, TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Database | SQLite via better-sqlite3 (WAL mode) |
| Auth | bcryptjs + in-memory session store |
| Payments | Stripe |
| Testing | Vitest 3 |

## Getting Started

```bash
# 1. Install dependencies
pnpm install --ignore-workspace

# 2. Copy and fill in environment variables
cp .env.example .env.local

# 3. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
# App URL (used for Stripe redirect URLs)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe (leave empty to disable payments)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Google Analytics (leave empty to disable)
NEXT_PUBLIC_GA_ID=

# Google AdSense (leave empty to disable)
NEXT_PUBLIC_ADSENSE_CLIENT_ID=

# SEO / Site identity
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SITE_NAME=
```

## Project Structure

```
src/
├── app/                      # Next.js App Router pages and API routes
│   ├── api/
│   │   ├── auth/             # login, signup, logout, me
│   │   ├── style-profile/    # train-url, train-paste, fetch profile
│   │   ├── writing-requests/ # create request, fetch draft
│   │   └── payments/         # Stripe checkout, portal, webhook, access
│   ├── dashboard/            # Protected user dashboard
│   ├── style/                # Style profile training page
│   └── pricing/              # Pricing page
├── components/
│   ├── ui/                   # Design system (Button, Card, Input, Badge, Nav)
│   ├── landing/              # Landing page sections
│   ├── style/                # Style profile training cards
│   └── writing/              # New writing request form
└── lib/
    ├── auth.ts               # Session management
    ├── db/                   # SQLite connection and schema
    ├── repos/                # Data access layer
    ├── training/             # Style profile generation
    ├── writing/              # Draft generation
    └── stripe.ts             # Stripe client and webhook helpers
```

## Testing

```bash
pnpm test          # Run all tests once
pnpm test:watch    # Watch mode
pnpm typecheck     # TypeScript type checking
```

Tests live in `src/__tests__/` and use Vitest.

## Deployment

Deploy to [Vercel](https://vercel.com) with zero configuration:

1. Push your repository to GitHub
2. Import the project in Vercel
3. Set all environment variables from `.env.local` in the Vercel dashboard
4. Deploy

> **Note:** The SQLite database (`app.db`) is file-based and does not persist across Vercel serverless function restarts. For production use, migrate to a persistent database service.

## License

MIT
