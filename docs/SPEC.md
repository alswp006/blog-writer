# SPEC

## Common Principles
- **Tech/Structure**
  - Next.js 15 **App Router** with Route Handlers under `src/app/api/**/route.ts`
  - TypeScript `strict: true`
  - Tailwind v4 for styling
  - SQLite via `better-sqlite3`
- **Auth**
  - All app-specific APIs in this SPEC require authentication via the template repo’s session mechanism.
  - **Unauthenticated** requests return **`401`** with JSON error shape.
  - Resource ownership rule: if a resource exists but is not owned by the session user, return **`404`** (no information leakage).
- **API Response Conventions**
  - Success responses are JSON objects.
  - Error response shape:
    ```ts
    { error: { code: string; message: string; details?: Record<string, any> } }
    ```
  - Common error codes:
    - `UNAUTHORIZED` (401)
    - `VALIDATION_ERROR` (400)
    - `NOT_FOUND` (404)
    - `CONFLICT` (409)
    - `INTERNAL_ERROR` (500)
- **ID & Time**
  - IDs are generated as UUID strings (`TEXT`).
  - Timestamps are ISO strings in API responses; stored as SQLite `TEXT` (ISO 8601).
- **Text Limits (server-enforced)**
  - `trainingText` stored length: **max 20,000 chars** (truncate beyond).
  - Draft `content` stored length: **max 50,000 chars** (truncate beyond).
  - Minimum training text length to reach `ready`: **1,000 chars**.
- **Status Machines (server-enforced)**
  - `StyleProfile.status`: `untrained` → `training` → `ready` OR `failed`
  - `CrawlAttempt.status`: `pending` → `success` OR `failed`
  - `WritingRequest.status`: `queued` → `generating` → `completed` OR `failed`

---

## Data Models

### style_profiles — fields, types, constraints
- **Table:** `style_profiles`
- **Columns**
  - `id` TEXT PRIMARY KEY
  - `userId` TEXT NOT NULL **UNIQUE** (one style profile per user)
  - `sourceType` TEXT NOT NULL CHECK (`sourceType` IN ('url','paste'))
  - `sourceUrl` TEXT NULL
  - `trainingText` TEXT NULL
  - `styleSummary` TEXT NOT NULL DEFAULT ''  *(stored instructions/summary text)*
  - `status` TEXT NOT NULL CHECK (`status` IN ('untrained','training','ready','failed'))
  - `lastError` TEXT NULL
  - `createdAt` TEXT NOT NULL
  - `updatedAt` TEXT NOT NULL
- **Relationships**
  - `style_profiles.userId` → `users.id` (from template repo)

### crawl_attempts — fields, types, constraints
- **Table:** `crawl_attempts`
- **Columns**
  - `id` TEXT PRIMARY KEY
  - `userId` TEXT NOT NULL
  - `url` TEXT NOT NULL
  - `status` TEXT NOT NULL CHECK (`status` IN ('pending','success','failed'))
  - `httpStatus` INTEGER NULL
  - `extractedText` TEXT NULL
  - `errorMessage` TEXT NULL
  - `createdAt` TEXT NOT NULL
- **Relationships**
  - `crawl_attempts.userId` → `users.id`

### writing_requests — fields, types, constraints
- **Table:** `writing_requests`
- **Columns**
  - `id` TEXT PRIMARY KEY
  - `userId` TEXT NOT NULL
  - `topic` TEXT NOT NULL
  - `titleHint` TEXT NULL
  - `keyPoints` TEXT NULL
  - `constraints` TEXT NULL
  - `status` TEXT NOT NULL CHECK (`status` IN ('queued','generating','completed','failed'))
  - `lastError` TEXT NULL
  - `createdAt` TEXT NOT NULL
  - `updatedAt` TEXT NOT NULL
- **Relationships**
  - `writing_requests.userId` → `users.id`

### generated_drafts — fields, types, constraints
- **Table:** `generated_drafts`
- **Columns**
  - `id` TEXT PRIMARY KEY
  - `writingRequestId` TEXT NOT NULL
  - `userId` TEXT NOT NULL
  - `content` TEXT NOT NULL
  - `version` INTEGER NOT NULL
  - `isLatest` INTEGER NOT NULL CHECK (`isLatest` IN (0,1))
  - `createdAt` TEXT NOT NULL
- **Constraints**
  - Uniqueness recommendation (enforced in app logic):
    - Only one `generated_drafts` row per `writingRequestId` can have `isLatest = 1`
- **Relationships**
  - `generated_drafts.writingRequestId` → `writing_requests.id`
  - `generated_drafts.userId` → `users.id`

---

## Feature List

### F1. Tone Training from URL (crawl → style profile ready/failed)
- **Description:** A logged-in user can start tone training by submitting a blog URL. The server fetches and extracts plain text, stores a `CrawlAttempt`, and updates the user’s single `StyleProfile` to `ready` when training text meets the minimum length; otherwise it becomes `failed` with an error.
- **Data:** `style_profiles`, `crawl_attempts`
- **API:**
  - `GET /api/style-profile → { styleProfile: StyleProfile | null } | 401`
  - `POST /api/style-profile/train-url { url: string } → { styleProfile: StyleProfile, crawlAttempt: CrawlAttempt } | 401 | 400 | 500`
- **Requirements:**
- AC-1: Given an authenticated user with no existing style profile, When the user calls `POST /api/style-profile/train-url` with `{ url: "https://example.com" }`, Then the response status is `200` and the response JSON contains `styleProfile.userId` equal to the session user id.
- AC-2: Given an authenticated user, When `POST /api/style-profile/train-url` is called, Then a `crawl_attempts` row is created with `userId` = session user id, `url` = request url, and `status` in `{"success","failed"}`.
- AC-3: Given a successful fetch and extracted text length >= `1000` chars, When `POST /api/style-profile/train-url` completes, Then `styleProfile.status` is `"ready"` and `styleProfile.trainingText.length` is between `1000` and `20000` (inclusive).
- AC-4: Given a successful training completion, When `POST /api/style-profile/train-url` completes, Then `styleProfile.styleSummary` is a non-empty string with length >= `50`.
- AC-5 (edge): Given the extracted text length is `< 1000`, When `POST /api/style-profile/train-url` completes, Then `styleProfile.status` is `"failed"` and `styleProfile.lastError` equals `"INSUFFICIENT_TRAINING_TEXT"`.
- AC-6 (edge): Given the request body has `url` that does not start with `"http://"` or `"https://"`, When `POST /api/style-profile/train-url` is called, Then the response status is `400` with `error.code = "VALIDATION_ERROR"`.
- AC-7 (auth): Given an unauthenticated request, When calling `GET /api/style-profile`, Then the response status is `401` with `error.code = "UNAUTHORIZED"`.

**API Contract (detail)**
- `GET /api/style-profile`
  - **Response 200**
    ```ts
    {
      styleProfile: null | {
        id: string
        userId: string
        sourceType: "url" | "paste"
        sourceUrl: string | null
        trainingText: string | null
        styleSummary: string
        status: "untrained" | "training" | "ready" | "failed"
        lastError: string | null
        createdAt: string
        updatedAt: string
      }
    }
    ```
  - **Errors:** `401`
- `POST /api/style-profile/train-url`
  - **Request**
    ```ts
    { url: string }
    ```
  - **Response 200**
    ```ts
    {
      styleProfile: { ...same shape as above... },
      crawlAttempt: {
        id: string
        userId: string
        url: string
        status: "pending" | "success" | "failed"
        httpStatus: number | null
        extractedText: string | null
        errorMessage: string | null
        createdAt: string
      }
    }
    ```
  - **Errors:** `401`, `400(VALIDATION_ERROR)`, `500(INTERNAL_ERROR)`

---

### F2. Fallback Tone Training via Paste (manual sample text)
- **Description:** If URL training fails (or the user prefers), the user can paste a writing sample to train their tone. The server sanitizes/truncates the text, generates a `styleSummary`, and sets the `StyleProfile` to `ready` when the minimum length is met.
- **Data:** `style_profiles`
- **API:**
  - `POST /api/style-profile/train-paste { text: string } → { styleProfile: StyleProfile } | 401 | 400`
- **Requirements:**
- AC-1: Given an authenticated user, When the user calls `POST /api/style-profile/train-paste` with `{ text: "<p>Hello...</p>" }`, Then the response status is `200` and `styleProfile.sourceType` equals `"paste"`.
- AC-2: Given an authenticated user, When `POST /api/style-profile/train-paste` succeeds, Then `styleProfile.status` equals `"ready"` and `styleProfile.trainingText` is not null.
- AC-3: Given pasted text length > `20000`, When `POST /api/style-profile/train-paste` succeeds, Then `styleProfile.trainingText.length` equals `20000`.
- AC-4: Given `styleProfile.status` becomes `"ready"`, When `POST /api/style-profile/train-paste` returns, Then `styleProfile.styleSummary.length` is >= `50`.
- AC-5 (edge): Given pasted text length `< 1000`, When `POST /api/style-profile/train-paste` is called, Then the response status is `400` with `error.code = "VALIDATION_ERROR"` and `error.details.minLength = 1000`.
- AC-6 (auth): Given an unauthenticated request, When calling `POST /api/style-profile/train-paste`, Then the response status is `401` with `error.code = "UNAUTHORIZED"`.

**API Contract (detail)**
- `POST /api/style-profile/train-paste`
  - **Request**
    ```ts
    { text: string }
    ```
  - **Response 200**
    ```ts
    { styleProfile: StyleProfile }
    ```
  - **Errors:** `401`, `400(VALIDATION_ERROR)`

---

### F3. Writing Request + Draft Generation (create request, generate draft, save to history)
- **Description:** A logged-in user submits a writing request (topic + optional hints). The server creates a `WritingRequest`, generates a single draft using the stored `StyleProfile.styleSummary`, stores it as a `GeneratedDraft`, and marks the request as `completed` or `failed`.
- **Data:** `writing_requests`, `generated_drafts`, `style_profiles`
- **API:**
  - `POST /api/writing-requests { topic: string, titleHint?: string, keyPoints?: string, constraints?: string } → { writingRequest: WritingRequest, draft: GeneratedDraft } | 401 | 400 | 409`
  - `GET /api/writing-requests/:id → { writingRequest: WritingRequest, latestDraft: GeneratedDraft | null } | 401 | 404`
- **Requirements:**
- AC-1: Given an authenticated user with a `StyleProfile.status = "ready"`, When the user calls `POST /api/writing-requests` with `{ topic: "restaurants" }`, Then the response status is `200` and `writingRequest.status` equals `"completed"`.
- AC-2: Given a successful request creation, When `POST /api/writing-requests` returns, Then the response JSON includes `draft.writingRequestId` equal to `writingRequest.id` and `draft.isLatest` equals `true`.
- AC-3: Given `keyPoints` is provided, When draft generation succeeds, Then `draft.content` contains the substring from `keyPoints` (exact match of the raw `keyPoints` string).
- AC-4: Given `titleHint` is provided, When draft generation succeeds, Then `draft.content` contains the substring from `titleHint` (exact match of the raw `titleHint` string).
- AC-5 (edge): Given the authenticated user has no `StyleProfile` with status `"ready"`, When calling `POST /api/writing-requests`, Then the response status is `409` with `error.code = "CONFLICT"` and `error.message = "STYLE_PROFILE_NOT_READY"`.
- AC-6 (edge): Given the request body omits `topic` or `topic.trim().length = 0`, When calling `POST /api/writing-requests`, Then the response status is `400`