# TASK

## Epic 0. Foundations (App shell, data model, reliability conventions)
### Task 0.1 Project scaffolding + shared UI patterns
- Description: Initialize Next.js (App Router) + TypeScript app, set up shared layout/navigation, and a consistent pattern for loading/error/empty states and form validation messages used across features.
- DoD:
  - Next.js app runs locally with TypeScript.
  - Global layout includes top-level nav links (Home, Train Tone, Generate, History) and shows logged-in/out state placeholder.
  - Shared components exist for: `ErrorState` (message + retry callback), `EmptyState` (message + CTA link), `FormField` (label/input/error), `LoadingState`.
  - At least one protected route placeholder exists (e.g., `/app`) to validate redirect behavior later.
- Covers: (supports reliability-first + QA verifiability principles; no direct AC)
- Files:
  - `app/layout.tsx`, `app/page.tsx`
  - `components/ErrorState.tsx`, `components/EmptyState.tsx`, `components/FormField.tsx`, `components/LoadingState.tsx`
  - `lib/validation.ts`

### Task 0.2 Database schema: account isolation, tone profile, history items
- Description: Add persistence for users/accounts, single tone profile per account, and per-account generation history with editable draft text.
- DoD:
  - DB schema includes tables/collections for:
    - `users` (id, email, auth fields)
    - `tone_profiles` (id, userId UNIQUE, sourceType[url|paste], sourceRef/url optional, createdAt, payload/attributes)
    - `drafts` (id, userId, requestTopic, requestPrompt, generatedText, editedText, createdAt, updatedAt)
  - Enforced “exactly one tone profile per account” at DB level (unique constraint on `tone_profiles.userId`).
  - Queries for drafts/tone profile are always filtered by `userId`.
- Covers: F2-AC6, Common Principles (account isolation, one-time tone training, history per-account)
- Files:
  - `lib/db.ts` (or ORM setup)
  - `prisma/schema.prisma` (or equivalent migrations)

---

## Epic 1. Authentication (Email signup/login, sessions, protected routes)
### Task 1.1 Email signup + login UI with validations and error states
- Description: Implement email-based signup/login screens and basic session establishment, including invalid-email validation and incorrect-credentials error display.
- DoD:
  - Routes: `/login`, `/signup`.
  - Signup with a valid new email creates an account and logs the user in (session set).
  - Invalid email format shows inline validation message and submit does not call auth endpoint.
  - Login with invalid credentials/token shows auth error message and user remains logged out.
  - After successful auth, redirect logic is deferred to Task 1.2 but session is established.
- Covers: F1-AC3, F1-AC4 (partial: UI + remains logged out), supports F1 overall
- Files:
  - `app/login/page.tsx`, `app/signup/page.tsx`
  - `app/api/auth/signup/route.ts`, `app/api/auth/login/route.ts`
  - `lib/auth/session.ts`, `lib/validation.ts`

### Task 1.2 Session state, logout, and route protection/redirect rules
- Description: Add protected route middleware/guards, logout, and first-login routing to tone training if no tone profile exists.
- DoD:
  - Protected pages: `/train`, `/generate`, `/editor/[id]`, `/history` redirect to `/login` when logged out.
  - “Log out” action clears session; navigating to protected routes after logout redirects to `/login`.
  - Post-auth redirect:
    - New signup redirects to `/train`.
    - Existing user login redirects to `/` (home) if tone trained, otherwise `/train`.
  - Behavior is verifiable via UI navigation + network (302/redirects or client route changes).
- Covers: F1-AC1, F1-AC2, F1-AC5, F1-AC6
- Files:
  - `middleware.ts` (or equivalent guard)
  - `app/api/auth/logout/route.ts`
  - `app/page.tsx` (home routing logic)
  - `app/train/page.tsx` (used for redirect target)
  - `components/Nav.tsx`

---

## Epic 2. Tone Training (URL crawl primary + paste fallback; one-time per account)
### Task 2.1 Tone training page UI + “already trained” gating
- Description: Build `/train` page with two entry points (URL crawl primary + paste fallback) and enforce one-time training per account at UI + API level.
- DoD:
  - `/train` loads current user’s tone profile status.
  - If tone profile exists: shows “Training already completed” message and disables/hides training submission controls so user cannot create a second profile.
  - If none: shows URL input form + button, plus visible link/button to paste samples form.
- Covers: F2-AC6, Common Principles (one-time tone training)
- Files:
  - `app/train/page.tsx`
  - `app/api/tone/status/route.ts`
  - `components/TrainingStatus.tsx`

### Task 2.2 URL crawl training API + progress + error/timeout handling
- Description: Implement URL crawl submission, server-side fetch/crawl (MVP: fetch HTML + extract text), timeout handling, and clear failure UI with retry + paste fallback.
- DoD:
  - Empty URL submission is blocked with required-field validation message.
  - Submitting a valid URL triggers an API call that attempts to fetch HTML content and extract text.
  - On success: creates `tone_profiles` record for user and UI shows “Training complete”.
  - On crawl error (unreachable/blocked/non-HTML): UI shows crawl failure message and displays paste-samples fallback entry point.
  - On timeout (defined timeout constant): UI shows timeout error + retry action + paste fallback entry point.
  - “Generate Draft” entry point is enabled/accessible after successful training (may be a button link to `/generate`).
- Covers: F2-AC1, F2-AC2, F2-AC3, F2-AC4, F2-AC5
- Files:
  - `app/api/tone/train-url/route.ts`
  - `lib/crawl.ts` (fetch + extract + timeout)
  - `lib/tone/analyze.ts` (stub/implementation for tone profile creation)
  - `app/train/page.tsx` (wire UI states)

### Task 2.3 Paste samples training flow + max size enforcement + persistence on refresh
- Description: Implement paste-based training form, input size limit, server analysis endpoint, and persisted completion state.
- DoD:
  - Paste form present (either on `/train` toggle or `/train/paste` route).
  - Empty text blocked with required-field validation message.
  - Max size limit enforced on client (submission prevented) with message indicating limit; limit value is a constant and testable by pasting over it.
  - Server error during tone analysis yields explicit error UI and does not create tone profile record.
  - On success: creates `tone_profiles` record and shows “Training complete”.
  - Refreshing after success still shows training completed (status API reflects persisted tone profile).
  - “Generate Draft” entry point becomes accessible after paste training.
- Covers: F3-AC1, F3-AC2, F3-AC3, F3-AC4, F3-AC5, F3-AC6
- Files:
  - `app/train/paste/page.tsx` (or integrated in `/train`)
  - `app/api/tone/train-paste/route.ts`
  - `lib/constants.ts` (max sizes)
  - `app/api/tone/status/route.ts` (used to persist state)

---

## Epic 3. Draft Generation (request form -> generate -> persist history -> open editor)
### Task 3.1 Generation page with training gate + request validations
- Description: Build `/generate` page with minimal request form (topic/category + prompt details), block access if tone not trained, and validate required fields.
- DoD:
  - If user has no tone profile: `/generate` route redirects to `/train` (or shows blocking UI with CTA to train).
  - Form includes required fields: `topic/category` and `prompt/details` (as per SPEC).
  - Submitting with any required field empty shows validation and does not call generation API.
- Covers: F4-AC2, F4-AC3
- Files:
  - `app/generate/page.tsx`
  - `lib/validation.ts`
  - `app/api/tone/status/route.ts` (check training)

### Task 3.2 Generation API: use tone profile, create draft, persist history, handle failures
- Description: Implement server endpoint to generate draft text using stored tone profile, persist successful results to `drafts`, and ensure failures do not create history items.
- DoD:
  - API endpoint requires authenticated user.
  - API rejects requests if user lacks tone profile (returns 403/redirect signal) and does not create draft record.
  - On success:
    - Creates a new `drafts` row with: requestTopic, requestPrompt, generatedText, editedText initialized to generatedText (or empty), createdAt, userId.
    - Returns draft id and text.
  - On generation error: returns non-2xx with error message; verifies no `drafts` record created.
  - Submitting same request twice creates two distinct `drafts` records with different IDs/timestamps.
- Covers: F4-AC1, F4-AC4, F4-AC5, F4-AC6 (and supports F4-AC2 server-side)
- Files:
  - `app/api/generate/route.ts`
  - `lib/generation.ts` (stub/implementation)
  - `lib/db.ts`

### Task 3.3 Post-generation navigation to editor with loaded draft
- Description: After successful generation, route user into editor view for that draft and display generated content.
- DoD:
  - Successful generate response triggers navigation to `/editor/[id]`.
  - Editor initially displays the generatedText (or editedText if stored) for that draft.
- Covers: F4-AC1 (displayed in editor view), F5-AC1 (initial load)
- Files:
  - `app/generate/page.tsx`
  - `app/editor/[id]/page.tsx`
  - `app/api/drafts/[id]/route.ts`

---

## Epic 4. Draft Editor (editable, autosave/persist, copy with failure modes)
### Task 4.1 Editor: load draft by id with account isolation + “not found”
- Description: Implement editor page data loading from API, ensuring user can only access own drafts; show “Not found” UI state otherwise.
- DoD:
  - `/editor/[id]` fetches draft via API.
  - If draft belongs to another user or doesn’t exist: API returns 404; UI shows “Not found” state and does not display any draft text.
  - If draft belongs to current user: editor loads latest saved `editedText` (or generatedText if no edits stored).
- Covers: F5-AC1, F5-AC6, F6-AC4
- Files:
  - `app/editor/[id]/page.tsx`
  - `app/api/drafts/[id]/route.ts`
  - `components/NotFoundState.tsx`

### Task 4.2 Edit + persist updated text (navigate away and reopen)
- Description: Make editor text area editable and persist edits to the draft record; verify persistence by reopening.
- DoD:
  - Editor text is editable.
  - Saving behavior implemented (choose one, but must be testable):
    - Explicit “Save” button OR debounced autosave.
  - After editing and saving, navigating away (e.g., to History) and reopening same draft shows updated text.
  - API updates only the authenticated user’s draft; attempts to update another user’s draft return 404.
- Covers: F5-AC2, F5-AC6, F6-AC4 (update path)
- Files:
  - `components/DraftEditor.tsx`
  - `app/editor/[id]/page.tsx`
  - `app/api/drafts/[id]/update/route.ts` (or PATCH on same route)

### Task 4.3 Copy-to-clipboard with success/failure/empty handling
- Description: Add “Copy” action with confirmation state; handle denied clipboard and empty editor cases with explicit messages and fallback instructions.
- DoD:
  - Clicking “Copy” with non-empty editor copies current editor text to clipboard (verified by manual paste test).
  - UI shows “Copied” confirmation state after success.
  - If clipboard API fails/denied: UI shows explicit failure message and instruction “Select all and copy manually”.
  - If editor is empty: clipboard operation is not executed; UI shows “Nothing to copy”.
- Covers: F5-AC3, F5-AC4, F5-AC5
- Files:
  - `components/DraftEditor.tsx`
  - `lib/clipboard.ts`

---

## Epic 5. History (per-account list, ordering, open, error/empty states)
### Task 5.1 History list API + deterministic ordering + account isolation
- Description: Implement endpoint to list drafts for current user only, ordered newest-first, including summary fields.
- DoD:
  - API returns only drafts for authenticated user (`userId` filter).
  - Response includes for each item at minimum: `id`, `createdAt`, `requestTopic` and/or derived summary from prompt.
  - Ordering is deterministic newest-first (createdAt desc).
- Covers: F6-AC1, F6-AC6, Common Principles (history per-account, isolation)
- Files:
  - `app/api/history/route.ts`
  - `lib/db.ts`

### Task 5.2 History page UI: list, open item, empty state, failure with retry
- Description: Build `/history` UI that consumes the history API and supports open-in-editor, empty state, and retryable error state.
- DoD:
  - If history has items: renders list showing created timestamp and summary for each.
  - Clicking an item navigates to `/editor/[id]`.
  - If zero items: shows empty state message + CTA link to `/generate`.
  - If API fails: shows error state with “Retry” action; does not show partial/stale items as if complete.
- Covers: F6-AC1, F6-AC2, F6-AC3, F6-AC5
- Files:
  - `app/history/page.tsx`
  - `components/HistoryList.tsx`
  - `components/ErrorState.tsx`, `components/EmptyState.tsx`

---

## Epic 6. Reliability/QA hardening (observable errors, limits, and test hooks)
### Task 6.1 Centralize constants (timeouts, max sizes) + ensure surfaced messaging
- Description: Define and apply testable constants for crawl timeout, paste max length, prompt max length; ensure UI messages reflect these values.
- DoD:
  - Constants exist for: `CRAWL_TIMEOUT_MS`, `PASTE_MAX_CHARS`, `PROMPT_MAX_CHARS` (prompt limit applies to generation form).
  - Crawl timeout uses `CRAWL_TIMEOUT_MS` and returns a distinct timeout error code/message.
  - Paste form enforces `PASTE_MAX_CHARS` and displays it in the validation message.
  - Generation form enforces `PROMPT_MAX_CHARS` and blocks submission with message when exceeded.
- Covers: F2-AC5, F3-AC4, F4-AC3 (validation), Common Principles (reliability-first, QA verifiability)
- Files:
  - `lib/constants.ts`
  - `lib/crawl.ts`
  - `app/train/paste/page.tsx`
  - `app/generate/page.tsx`

### Task 6.2 Add minimal API response conventions + UI mapping for failures
- Description: Standardize API error shapes (status code + `{code,message}`), and ensure all user-facing failures have explicit UI states with recovery actions (retry, fallback).
- DoD:
  - All implemented API routes return consistent JSON error shape on non-2xx.
  - UI maps known errors to explicit messages for:
    - Auth error (login)
    - Crawl failure + fallback to paste
    - Crawl timeout + retry + fallback to paste
    - Generation error (no history created)
    - History list failure + retry
    - Clipboard failure + manual copy instruction
  - Each recovery action is a visible button/link and is clickable.
- Covers: F1-AC4, F2-AC4, F2-AC5, F4-AC4, F6-AC5, F5-AC4; Common Principles (reliability-first, QA verifiability)
- Files:
  - `lib/apiErrors.ts`
  - All `app/api/**/route.ts`
  - `components/ErrorState.tsx` (ensure retry wiring)