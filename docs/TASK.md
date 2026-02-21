# TASK
## Epic 1. Data Layer

### Task 1.1 DB schema for style training + writing
- Description:
  - Create SQLite table definitions for:
    - `style_profiles`, `crawl_attempts`, `writing_requests`, `generated_drafts`
  - Ensure schema is applied on app startup by calling an `ensureAppSchema()` function from the existing DB initialization module.
- DoD:
  - [ ] App builds and boots with no SQLite errors on a fresh DB file
  - [ ] All 4 tables exist with the columns + CHECK constraints defined in SPEC
  - [ ] `style_profiles.userId` has a UNIQUE constraint (1 profile per user)
  - [ ] Schema apply is idempotent (running twice does not throw)
- Covers: [F1-AC1, F1-AC2] (enables persistence required by these ACs)
- Files:  
  - `src/lib/db/ensureAppSchema.ts` (create)  
  - `src/lib/db/index.ts` (modify; call `ensureAppSchema()` after opening DB)
- Depends on: none

### Task 1.2 Model types + shared constants (limits/status)
- Description:
  - Add strict TypeScript model types for:
    - `StyleProfile`, `CrawlAttempt`, `WritingRequest`, `GeneratedDraft`
  - Add server-enforced constants for:
    - `MAX_TRAINING_TEXT_LEN = 20000`, `MIN_TRAINING_TEXT_LEN = 1000`, `MAX_DRAFT_CONTENT_LEN = 50000`
  - Add small helpers: `nowIso()` and `truncate(str, max)`
- DoD:
  - [ ] Types compile under `strict: true` and match the API contract shapes
  - [ ] Status union types match SPEC allowed values exactly
  - [ ] `truncate()` returns a string of length `<= max` for any input
- Covers: [F1-AC3, F2-AC3] (limits/status groundwork)
- Files:
  - `src/lib/models/types.ts` (create)
  - `src/lib/models/limits.ts` (create)
  - `src/lib/models/time.ts` (create)
  - `src/lib/models/text.ts` (create)
- Depends on: Task 1.1

### Task 1.3 Data access helpers (CRUD)
- Description:
  - Implement minimal DB functions (better-sqlite3) to support required flows:
    - Style profile: `getStyleProfileByUserId`, `upsertStyleProfileForUser`
    - Crawl attempts: `createCrawlAttempt`, `updateCrawlAttemptStatus`
    - Writing requests: `createWritingRequest`, `updateWritingRequestStatus`, `getWritingRequestByIdForUser`
    - Drafts: `createGeneratedDraftAsLatest` (sets previous `isLatest=0` for same request), `getLatestDraftForRequestForUser`
- DoD:
  - [ ] Each helper runs without throwing when called with valid inputs
  - [ ] `createGeneratedDraftAsLatest()` guarantees exactly one latest draft per `writingRequestId`
  - [ ] `getWritingRequestByIdForUser()` returns `null` when the `id` exists but belongs to a different userId
- Covers: [F3-AC2, F3-AC5] (ownership + latest draft mechanics)
- Files:
  - `src/lib/repos/styleProfileRepo.ts` (create)
  - `src/lib/repos/crawlAttemptRepo.ts` (create)
  - `src/lib/repos/writingRequestRepo.ts` (create)
  - `src/lib/repos/generatedDraftRepo.ts` (create)
- Depends on: Task 1.2

---

## Epic 2. API Routes

### Task 2.1 API utilities: auth gate + JSON error shape
- Description:
  - Add API helpers to standardize:
    - `jsonError(status, code, message, details?)` using SPEC error shape
    - `requireUserId(request)` that returns `{ userId }` or a `Response` (401) using the template repo’s session mechanism
  - Do not implement auth itself; only wire to existing template session retrieval.
- DoD:
  - [ ] `jsonError()` returns `{ error: { code, message, details? } }` with correct HTTP status
  - [ ] `requireUserId()` returns a `401` Response with `error.code="UNAUTHORIZED"` when session is missing
  - [ ] No API route in later tasks needs to duplicate 401/error-shape logic
- Covers: [F1-AC7, F2-AC6] (shared 401 behavior)
- Files:
  - `src/lib/api/jsonError.ts` (create)
  - `src/lib/api/requireUserId.ts` (create)
- Depends on: Task 1.2

### Task 2.2 GET /api/style-profile
- Description:
  - Implement route handler:
    - `GET /api/style-profile → { styleProfile: StyleProfile | null }`
  - Must require authentication and return `401` with SPEC error shape if unauthenticated.
- DoD:
  - [ ] Unauthenticated request returns `401` and `error.code="UNAUTHORIZED"`
  - [ ] Authenticated user with no profile gets `{ styleProfile: null }` (200)
  - [ ] Authenticated user with profile gets `{ styleProfile: { ... } }` (200)
- Covers: [F1-AC7]
- Files:
  - `src/app/api/style-profile/route.ts` (create)
- Depends on: Task 2.1, Task 1.3

### Task 2.3 Text extraction + style summary generator (server-side)
- Description:
  - Add server utilities used by training endpoints:
    - `extractPlainTextFromHtml(html: string): string` (basic tag stripping + whitespace normalization)
    - `fetchAndExtractText(url: string): Promise<{ httpStatus: number, text: string }>`
    - `generateStyleSummary(trainingText: string): string` that always returns non-empty string length `>= 50`
- DoD:
  - [ ] `extractPlainTextFromHtml("<p>a</p>")` returns `"a"` (no tags)
  - [ ] `generateStyleSummary()` returns length `>= 50` for any non-empty input
  - [ ] Utility module has no Next.js route imports (pure lib)
- Covers: [F1-AC4, F2-AC4] (styleSummary requirement)
- Files:
  - `src/lib/training/extractPlainText.ts` (create)
  - `src/lib/training/fetchAndExtractText.ts` (create)
  - `src/lib/training/generateStyleSummary.ts` (create)
- Depends on: Task 1.2

### Task 2.4 POST /api/style-profile/train-url
- Description:
  - Implement:
    - `POST /api/style-profile/train-url { url }`
  - Behavior:
    - Auth required (401 otherwise)
    - Validate `url` starts with `http://` or `https://` else 400 `VALIDATION_ERROR`
    - Create `crawl_attempts` row with `status` = `success` or `failed` by completion
    - Upsert the user’s single `style_profiles` row with:
      - `sourceType="url"`, `sourceUrl=url`
      - `trainingText` truncated to 20,000 chars
      - If extracted text length >= 1000: `status="ready"` and `styleSummary` length >= 50
      - Else: `status="failed"` and `lastError="INSUFFICIENT_TRAINING_TEXT"`
- DoD:
  - [ ] Invalid url scheme returns `400` with `error.code="VALIDATION_ERROR"`
  - [ ] On success+len>=1000: response 200 includes `styleProfile.status="ready"` and `trainingText.length` in `[1000,20000]`
  - [ ] On len<1000: response 200 includes `styleProfile.status="failed"` and `lastError="INSUFFICIENT_TRAINING_TEXT"`
  - [ ] Response includes a `crawlAttempt` row with `status` in `{ "success","failed" }`
- Covers: [F1-AC1, F1-AC2, F1-AC3, F1-AC4, F1-AC5, F1-AC6]
- Files:
  - `src/app/api/style-profile/train-url/route.ts` (create)
- Depends on: Task 2.1, Task 1.3, Task 2.3

### Task 2.5 POST /api/style-profile/train-paste
- Description:
  - Implement:
    - `POST /api/style-profile/train-paste { text }`
  - Behavior:
    - Auth required (401)
    - Strip basic HTML tags from text (reuse extraction helper)
    - If resulting text length < 1000: 400 `VALIDATION_ERROR` with `error.details.minLength = 1000`
    - Else: truncate to 20,000, upsert `style_profiles` with `sourceType="paste"`, `status="ready"`, and `styleSummary.length>=50`
- DoD:
  - [ ] Valid request returns 200 and `styleProfile.sourceType="paste"`
  - [ ] Returned `styleProfile.status="ready"` and `trainingText` is not null
  - [ ] Input > 20000 chars stores `trainingText.length === 20000`
  - [ ] Input < 1000 chars returns 400 with `error.code="VALIDATION_ERROR"` and `error.details.minLength===1000`
- Covers: [F2-AC1, F2-AC2, F2-AC3, F2-AC4, F2-AC5, F2-AC6]
- Files:
  - `src/app/api/style-profile/train-paste/route.ts` (create)
- Depends on: Task 2.1, Task 1.3, Task 2.3

### Task 2.6 POST /api/writing-requests (create + generate + persist)
- Description:
  - Implement:
    - `POST /api/writing-requests { topic, titleHint?, keyPoints?, constraints? }`
  - Behavior:
    - Auth required (401)
    - Validate `topic` exists and `topic.trim().length>0`, else 400 `VALIDATION_ERROR`
    - Require `StyleProfile.status === "ready"`, else 409 `CONFLICT` with `error.message="STYLE_PROFILE_NOT_READY"`
    - Create a `writing_requests` row, generate draft content using a deterministic template that includes:
      - the raw `titleHint` substring if provided
      - the raw `keyPoints` substring if provided
    - Store `generated_drafts` with `isLatest=true`, `version=1`, content truncated to 50,000 chars
    - Update `writing_requests.status` to `"completed"` (or `"failed"` on exception)
- DoD:
  - [ ] With ready style profile: returns 200 and `writingRequest.status==="completed"`
  - [ ] Response includes `draft.writingRequestId === writingRequest.id` and `draft.isLatest === true`
  - [ ] If `keyPoints` provided, `draft.content` contains exact `keyPoints` substring
  - [ ] If no ready style profile, returns 409 with `error.code="CONFLICT"` and `error.message="STYLE_PROFILE_NOT_READY"`
- Covers: [F3-AC1, F3-AC2, F3-AC3, F3-AC4, F3-AC5, F3-AC6]
- Files:
  - `src/lib/writing/generateDraftContent.ts` (create)
  - `src/app/api/writing-requests/route.ts` (create)
- Depends on: Task 2.1, Task 1.3, Task 1.2

### Task 2.7 GET /api/writing-requests/:id
- Description:
  - Implement:
    - `GET /api/writing-requests/[id] → { writingRequest, latestDraft }`
  - Behavior:
    - Auth required (401)
    - If request not found OR belongs to another user: 404 `NOT_FOUND`
    - Return `latestDraft` as `null` if none exists
- DoD:
  - [ ] Unauthenticated returns 401 with `error.code="UNAUTHORIZED"`
  - [ ] чужой/other user’s id returns 404 (not 403) with `error.code="NOT_FOUND"`
  - [ ] Valid id returns 200 with both `writingRequest` and `latestDraft` keys present
- Covers: [F3-AC2] (latest draft retrieval), ownership rule in Common Principles
- Files:
  - `src/app/api/writing-requests/[id]/route.ts` (create)
- Depends on: Task 2.1, Task 1.3

---

## Epic 3. UI Pages

### Task 3.1 Style Profile page (train by URL + paste)
- Description:
  - Create a protected page at `src/app/style-profile/page.tsx` that:
    - Loads current style profile from `GET /api/style-profile`
    - Provides:
      - URL form that calls `POST /api/style-profile/train-url`
      - Paste textarea that calls `POST /api/style-profile/train-paste`
    - Displays current status + last error + summary length
  - Keep UI minimal using existing template components.
- DoD:
  - [ ] Page renders without crashing when no style profile exists (shows “none” state)
  - [ ] Submitting URL form triggers fetch to `/api/style-profile/train-url` and shows resulting status text on success
  - [ ] Submitting paste form triggers fetch to `/api/style-profile/train-paste` and shows validation error message on 400
- Covers: (UI support for) [F1-AC1, F2-AC1]
- Files:
  - `src/app/style-profile/page.tsx` (create)
- Depends on: Task 2.2, Task 2.4, Task 2.5

### Task 3.2 New Writing Request page
- Description:
  - Create page `src/app/write/page.tsx` with a form:
    - topic (required), titleHint, keyPoints, constraints
  - On submit:
    - POST to `/api/writing-requests`
    - If 200, navigate to `/requests/{id}`
    - If 409, show “Style profile not ready” inline
- DoD:
  - [ ] Form submit with topic sends POST body containing topic/titleHint/keyPoints/constraints
  - [ ] On 200, redirects (router push) to `/requests/<writingRequest.id>`
  - [ ] On 409, renders the returned error message
- Covers: (UI support for) [F3-AC1, F3-AC5]
- Files:
  - `src/app/write/page.tsx` (create)
- Depends on: Task 2.6

### Task 3.3 Writing Request detail page (show latest draft)
- Description:
  - Create dynamic page `src/app/requests/[id]/page.tsx` that:
    - Fetches `GET /api/writing-requests/:id`
    - Displays writing request fields and the latest draft content (preformatted)
    - If 404, show “Not found”
- DoD:
  - [ ] Visiting `/requests/<id>` fetches `/api/writing-requests/<id>` and renders draft content if present
  - [ ] For 404 response, renders a Not Found state without throwing
  - [ ] Page builds under strict TS (no `any`)
- Covers: (UI support for) [F3-AC2]
- Files:
  - `src/app/requests/[id]/page.tsx` (create)
- Depends on: Task 2.7

---

## Epic 4. Integration + Landing

### Task 4.1 App navigation + landing page wiring
- Description:
  - Add links to the main app navigation (using the existing template Nav) to:
    - `/style-profile`
    - `/write`
  - Update landing page to briefly explain the MVP flow and link to `/style-profile` as the first step.
- DoD:
  - [ ] Logged-in user can navigate to Style Profile and Write pages via visible nav links
  - [ ] Landing page includes a link to `/style-profile`
  - [ ] `next build` succeeds after changes
- Covers: (integration for) [F1-AC1, F2-AC1, F3-AC1]
- Files:
  - `src/app/page.tsx` (modify)
  - `src/components/Nav.tsx` (modify) *(or the template’s actual Nav path under `src/`, adjust to match repo)*
- Depends on: Task 3.1, Task 3.2, Task 3.3