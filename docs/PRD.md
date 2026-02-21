# VoiceBlog Generator (voiceblog-generator)

# PRD
## Background / Problem
- The product targets **individuals and small families (3–5 people)** aiming to monetize blogging, and it must support generating posts across **multiple topics (food spots/restaurants, tech, daily life, etc.)**.
- These users want output that consistently matches *their own voice*, but manually writing in a consistent tone is time-consuming and hard to scale across topics and multiple family members. A lightweight web app is needed to learn each user’s writing style once and then repeatedly generate editable blog drafts on demand.

## Goal (1-sentence product definition)
Enable a logged-in user to generate a blog post draft in their learned voice and save it to history, with **≥80% of writing requests successfully producing an editable draft**.

## Non-goals
- Native mobile apps (iOS/Android).
- Analytics dashboards (views, revenue, SEO scoring) or growth reporting.
- Sharing/collaboration features (comments, review workflows) beyond individual accounts.
- Auto-publishing / integrations with external blog platforms (e.g., posting directly to Naver/Tistory/WordPress).
- Complex third-party integrations beyond what’s required for basic URL fetch/crawl.

## Target Users (personas + use cases)
- **Minseo Kim (34, family side-hustle blogger)** — wants to monetize blog content but struggles to produce enough posts consistently; needs “write like me” drafts quickly for restaurant and daily-life topics.
- **Joon Park (29, tech blogger)** — writes technical posts but loses consistency in tone and structure when rushing; wants a repeatable way to generate first drafts that match his existing blog style.

## Data Entities (nouns with key fields)
- **StyleProfile**
  - `id` (string/uuid)
  - `userId` (string)
  - `sourceType` ("url" | "paste")
  - `sourceUrl` (string, nullable)
  - `trainingText` (text, nullable) — sanitized extracted/pasted text used for learning
  - `styleSummary` (text) — stored tone/voice instructions
  - `status` ("untrained" | "training" | "ready" | "failed")
  - `lastError` (text, nullable)
  - `createdAt`, `updatedAt` (datetime)
- **CrawlAttempt**
  - `id`
  - `userId`
  - `url`
  - `status` ("pending" | "success" | "failed")
  - `httpStatus` (number, nullable)
  - `extractedText` (text, nullable)
  - `errorMessage` (text, nullable)
  - `createdAt`
- **WritingRequest**
  - `id`
  - `userId`
  - `topic` (string) — e.g., restaurant/tech/daily-life (free text)
  - `titleHint` (string, nullable)
  - `keyPoints` (text, nullable) — bullets or notes from user
  - `constraints` (text, nullable) — e.g., length, format notes (MVP: free text)
  - `status` ("queued" | "generating" | "completed" | "failed")
  - `createdAt`, `updatedAt`
- **GeneratedDraft**
  - `id`
  - `writingRequestId`
  - `userId`
  - `content` (text)
  - `version` (number) — starts at 1
  - `isLatest` (boolean)
  - `createdAt`
- **DraftEditSnapshot** (optional, MVP-lightweight versioning)
  - `id`
  - `draftId`
  - `userId`
  - `content` (text)
  - `createdAt`

## Core Flow (numbered steps)
1. **Log in** to the web app.
2. If no style exists, user starts **Tone Training** by entering a **blog URL**.
3. App attempts to **crawl/extract text** → if it fails, app prompts the user to **paste sample text** instead.
4. User submits a **Writing Request** (topic + optional hints/points).
5. App generates a **Draft** in the learned voice and opens the **Draft Editor** for live editing + **Copy** action.
6. User visits **History** to view past writing requests and reopen previously generated drafts.

## Success Metrics (measurable)
- **Draft generation success rate:** ≥80% of writing requests reach `completed` with a non-empty draft.
- **Tone training completion rate:** ≥70% of users who start training reach `StyleProfile.status = ready`.
- **Median time-to-first-draft (from request submit):** ≤60 seconds (server-side generation time).
- **History revisit rate:** ≥30% of users open History at least once after generating their first draft.

## MVP Scope (exhaustive feature list)
- **Tone training (one-time per user): URL-based crawl/extract → style analysis saved to StyleProfile**
- **Fallback training path:** if crawl fails, collect **manual paste** sample text and generate the same stored style output
- **Writing request form:** capture topic + optional title hint/key points/constraints and create a WritingRequest record
- **Draft generation pipeline:** generate a GeneratedDraft tied to the WritingRequest using the stored StyleProfile
- **Draft editor:** editable text area with explicit **Copy to clipboard** button and save of the latest edited content
- **History:** list of WritingRequests + status, and ability to open the latest GeneratedDraft for each item

## Target Audience & Marketing
- **Target user persona:** Individuals or small families (3–5 accounts) who want to monetize blogging and need fast, consistent first drafts in their personal tone.
- **Key value proposition:** Generate blog drafts that sound like *you* (learned from your existing writing) so you can publish more consistently with less effort.
- **3 top features for landing page hero section:**
  1. “Learn my voice from my blog URL”
  2. “One-click drafts for restaurant/tech/daily topics”
  3. “Edit instantly + copy, with a full draft history”
- **Desired brand tone:** Minimal, professional, creator-focused.

## Monetization Strategy
- **Recommended strategy:** **freemium**
- **Pricing tiers:**
  - **Free:** 1 style profile + up to 10 writing requests/month
  - **Pro ($12/month):** higher monthly request limit (e.g., 200/month) + draft version history (restore snapshots)
  - **Family ($19/month):** same as Pro per account for up to 5 accounts (billing bundle; still separate accounts in-product)
- **Premium features (if freemium):**
  - Higher monthly generation limits
  - Draft edit snapshot/version restore beyond “latest” only
  - (Optional later) multiple style profiles per user (non-MVP)

## Assumptions
1. Users already have enough existing writing (blog posts or text) to learn a usable tone.
2. A single style profile per user is sufficient for MVP.
3. Simple URL extraction (no complex JS rendering) will work for a meaningful portion of blogs; otherwise paste fallback covers failures.
4. Users value “draft speed + voice consistency” more than advanced formatting or SEO tools in MVP.
5. Storing generated drafts and requests in SQLite is sufficient for MVP scale.
6. “History” can be implemented as viewing WritingRequests and associated GeneratedDrafts without additional taxonomy.
7. Basic editor capabilities (edit text + copy) are enough; rich-text is not required for MVP.
8. Separate accounts per family member are sufficient; no shared workspace is required for MVP.

## Open Questions
1. What is the minimum sample size (characters/words) required for tone training to be considered “ready”?
2. What is the expected draft length range (e.g., 800–1500 words) for MVP, and should it be user-configurable?
3. Should the app support multiple languages per user or assume a single primary writing language?
4. How many drafts per request are needed in MVP (single draft only vs. regenerate variations)?
5. What failure modes should be exposed in UI for crawl/training (e.g., blocked site, empty extraction, non-public blog)?