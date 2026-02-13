# ToneBlog AI (toneblog-ai)

A web app for individuals/families (3–5 members) who want to monetize blogs, where the AI learns each member’s writing tone from an existing blog (or pasted samples) and generates editable blog drafts (e.g., restaurants/tech/daily life) with history.

## Background / Problem
- Prospective blog earners need to publish consistently, but drafting quality posts in a consistent personal tone is time-consuming.
- Generic AI writing often fails to match an individual’s established voice, reducing authenticity and perceived trust.

## Goal
- Enable each family member to quickly generate blog post drafts that match their personal tone, edit them in-browser, and reuse/manage past drafts.

## Non-goals
- Analytics or social sharing features (unless later proven core).
- Mobile native apps.
- Complex third-party integrations.

## Target Users
- Individuals and small family groups (3–5 people) aiming to monetize blogs.
- Each user needs their own account and tone profile (separated per family member).

## Core Flow
1. **Sign up / Log in (email-based)**  
2. **One-time Tone Training**
   - User enters a **blog URL** → system crawls content → analyzes tone → saves tone profile
   - If crawling fails → user is prompted to **paste sample text** for tone learning
3. **Request a Blog Post Draft**
   - User provides a writing request (topic/category like restaurants/tech/daily life, and any prompt details)
4. **Draft Generated**
5. **Edit Draft in Real-Time Editor**
   - User edits text directly
   - User clicks **Copy** to copy final text
6. **History**
   - User views a list of past requests and generated drafts and reopens them

## Success Metrics
- **Activation rate:** % of new users who complete tone training (URL crawl or paste) within 1 session.
- **Draft creation rate:** % of activated users who generate at least 1 draft within 24 hours.
- **Editor engagement:** median time spent in editor per draft OR % of drafts that get edited (text changed) before copying.
- **Copy conversion:** % of generated drafts that are copied at least once.
- **Retention (early):** % of users who generate a second draft within 7 days.
- **Reliability:** tone-training crawl success rate; generation success rate (no error).

## MVP Scope
- **Web-only MVP** built with **Next.js + TypeScript**
- Minimal dependencies; codebase must pass **test, lint, typecheck, format**
- Features:
  1. **Email-based signup/login** with separate accounts per family member
  2. **Tone training (one-time)** via blog URL crawl → analysis → store tone profile  
     - Fallback: prompt user to paste text if crawl fails
  3. **Post generation request** (UI to submit a request and trigger AI generation)
  4. **Draft editor** with real-time editing and **Copy** button
  5. **History** list of prior requests and generated drafts, with ability to open an item

## Assumptions (≤ 8)
1. Users already have an existing blog URL or can provide sufficient pasted samples for tone learning.
2. Each account maps to exactly one tone profile in MVP (retraining/versioning is not required).
3. Users primarily want draft text output they can paste into their blog platform (publishing is out of scope).
4. “Family” use is satisfied by separate accounts (no shared workspace needed in MVP).
5. Crawling target blogs is feasible for enough users to make URL-based learning valuable.
6. A simple editor + copy action is sufficient as the main “handoff” to publishing.
7. History can be per-account only (no cross-account visibility).
8. The writing request UI can be lightweight (single form) and still produce useful drafts.

## Open Questions (≤ 10)
1. What minimum sample size is required for acceptable tone learning (by URL and by paste)?
2. Which blog platforms must be supported for crawling in MVP, and what are known blockers (robots.txt, login walls)?
3. What fields are required in a “writing request” (topic, title, outline, length, keywords, language, etc.)?
4. Should users be able to regenerate drafts for the same request (and how is that represented in history)?
5. What is the desired tone-learning storage format (raw samples, extracted style attributes, embeddings, etc.)?
6. Do we need any content safety/filters (e.g., disallowed topics) for MVP?
7. How should errors be handled and surfaced (crawl failure, generation failure, rate limits)?
8. Should history items store only the final edited text, the original AI draft, or both?
9. Is there a requirement to support multiple tones per user (e.g., different blogs) later, and should MVP design anticipate it?
10. What is the pricing/usage limit assumption for MVP (free, capped generations, etc.)?