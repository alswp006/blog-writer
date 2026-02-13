# SPEC

## Common Principles
- **Web-only MVP:** Next.js + TypeScript.
- **Account isolation:** Each account maps to exactly one tone profile; no cross-account access to tone/drafts/history.
- **One-time tone training:** Required before generating drafts; retraining/versioning not in MVP.
- **Drafts are editable:** Users can modify generated text in-browser and copy the result.
- **History is per-account:** Users can view and reopen prior requests/drafts.
- **Reliability-first:** All user-facing failures must surface clear error states and recovery actions (retry, fallback to paste, etc.).
- **QA verifiability:** All acceptance criteria are observable via UI and/or API responses (status codes, persisted records, UI states).

## Feature List

### F1. Email-based Signup / Login
- Requirements:
  - Support email-based account creation and authentication.
  - Each family member uses a separate account (no shared workspace).
  - Provide clear session state (logged in/out) and route protection.
- AC:
  - **AC1:** Given a new email, when the user completes signup, then the user is redirected to the tone training screen on first login.
  - **AC2:** Given an existing email account, when the user logs in successfully, then the user lands on the app home (or continues to tone training if not yet trained).
  - **AC3 (failure):** When the user submits an invalid email format, then the form shows a validation message and the submit action does not create an account.
  - **AC4 (failure):** When the user submits incorrect login credentials (or invalid login token, if applicable), then the UI displays an authentication error and the user remains logged out.
  - **AC5:** When logged out, attempts to access protected pages (tone training, generation, editor, history) redirect to the login page.
  - **AC6:** When the user clicks “Log out”, then the session ends and subsequent navigation to protected pages redirects to login.

---

### F2. Tone Training via Blog URL Crawl (Primary Path)
- Requirements:
  - Allow user to enter a blog URL for one-time tone training.
  - Crawl accessible content, analyze tone, and store a tone profile tied to the account.
  - Show progress and completion state.
- AC:
  - **AC1:** Given a logged-in user without a tone profile, when the user submits a valid URL and crawling succeeds, then the system creates and stores a tone profile for that account and shows a “Training complete” state.
  - **AC2:** When training completes successfully, then the “Generate Draft” entry point becomes accessible for that account (e.g., button enabled or route allowed).
  - **AC3:** When the user submits an empty URL field, then the UI shows a required-field validation message and does not start crawling.
  - **AC4 (failure):** When crawling returns an error (e.g., unreachable URL, blocked by robots/login wall, non-HTML), then the UI shows a crawl failure message and presents the paste-samples fallback entry point.
  - **AC5 (failure):** When crawling times out (exceeds a defined timeout), then the UI shows a timeout error and a retry option, plus the paste-samples fallback entry point.
  - **AC6 (edge):** When the user already has a stored tone profile, then the tone training page indicates training is already completed and does not allow creating a second tone profile in MVP.

---

### F3. Tone Training via Pasted Samples (Fallback Path)
- Requirements:
  - Provide a paste-text input flow to learn tone when crawl fails or when user chooses to paste instead.
  - Store the resulting tone profile for the account.
- AC:
  - **AC1:** Given a logged-in user without a tone profile, when the user pastes sample text and submits, then the system creates and stores a tone profile for that account and shows “Training complete”.
  - **AC2:** When the pasted text input is empty, then the UI shows a required-field validation message and the submit action is blocked.
  - **AC3 (failure):** When tone analysis fails (server error), then the UI shows an error state and the tone profile is not created.
  - **AC4 (edge):** When the pasted text exceeds the maximum allowed size, then the UI prevents submission and displays a message indicating the limit (test by pasting text beyond the limit).
  - **AC5:** When training completes via paste, then the “Generate Draft” entry point becomes accessible for that account.
  - **AC6 (edge):** When the user refreshes the page after successful training, then the UI still shows training as completed (persisted state).

---

### F4. Post Generation Request (Create Draft)
- Requirements:
  - Provide a lightweight form to submit a writing request (topic/category and prompt details).
  - Use the stored tone profile for the logged-in account to generate a draft.
  - Persist request + generated draft to history.
- AC:
  - **AC1:** Given a user with a completed tone profile, when the user submits a generation request with required fields, then a new draft is generated and displayed in the editor view.
  - **AC2:** When the user attempts to access generation without completing tone training, then the UI blocks generation and routes the user to tone training.
  - **AC3:** When required request fields are empty, then the UI shows validation messages and does not call generation.
  - **AC4 (failure):** When the generation API returns an error, then the UI shows an error message and no history item is created for that failed attempt.
  - **AC5 (edge):** When the user submits the same request twice, then two distinct history items are created (each with its own timestamp/ID).
  - **AC6:** After a successful generation, the system persists at minimum: request inputs, generated draft text, created timestamp, and a reference to the account.

---

### F5. Draft Editor (Real-time Editing) + Copy
- Requirements:
  - Show generated draft in an editable text editor.
  - Allow user to modify content and copy final text to clipboard.
  - Persist edits (at least when leaving/reopening) so history reflects changes made.
- AC:
  - **AC1:** When a draft is opened, then the editor shows the stored draft text for that history item.
  - **AC2:** When the user edits the draft text, then the updated text is saved for that history item (verify by navigating away and reopening the same draft).
  - **AC3:** When the user clicks “Copy”, then the current editor text is copied to the clipboard (verify by pasting into an external field) and the UI shows a “Copied” confirmation state.
  - **AC4 (failure):** When clipboard access is denied/unavailable, then the UI shows an explicit copy failure message and provides an alternative instruction (e.g., “Select all and copy manually”).
  - **AC5 (edge):** When the user clicks “Copy” with an empty editor, then the clipboard operation is not performed and the UI shows an “Nothing to copy” message.
  - **AC6:** When reopening a draft from history, the editor displays the latest saved version (not a newly generated one).

---

### F6. History (List + Open Past Drafts)
- Requirements:
  - Display a per-account list of prior generation requests and their drafts.
  - Allow opening an item to view/edit in the editor.
  - Ensure strict per-account data isolation.
- AC:
  - **AC1:** When a user has at least one successful generation, then the history page lists each item with at minimum: created timestamp and a readable summary of the request (e.g., topic/category or first line of prompt).
  - **AC2:** When a user clicks a history item, then the app opens the editor for that specific draft and loads the stored text.
  - **AC3 (edge):** When a user has no history items, then the history page shows an empty state message and a CTA to generate a draft.
  - **AC4 (security):** When User A is logged in, attempts to access a history item ID belonging to User B result in a “Not found” (or equivalent) UI state and the content is not displayed.
  - **AC5 (failure):** When the history list API fails, then the UI shows an error state with a retry action and does not display stale/partial items as if complete.
  - **AC6:** History ordering is deterministic: newest items appear first (verify by generating two drafts sequentially).

---

## Assumptions
1. Users can provide either a blog URL or sufficient pasted samples for tone learning.
2. Exactly one tone profile per account in MVP (no retraining/versioning).
3. Publishing to external blog platforms is out of scope; copy-to-clipboard is the handoff.
4. “Family” usage is satisfied by separate accounts; no shared workspace.
5. Blog crawling is feasible for a meaningful subset of users; otherwise paste fallback covers.
6. Generation requests can be represented by a minimal form (topic/category + prompt details).
7. History is per-account only; no cross-account visibility.
8. The system will define maximum input sizes (URL crawl scope, paste length, prompt length) to protect performance.

## Open Questions
1. Minimum sample size required for acceptable tone learning (URL crawl and pasted samples)?
2. Which blog platforms/structures must be supported for crawling in MVP, and how to handle robots/login walls?
3. Required fields for a writing request (topic, title, length, keywords, language, etc.)?
4. Should users be able to regenerate drafts for the same request, and how should versions appear in history?
5. Desired storage format for tone learning (raw samples vs extracted attributes vs embeddings)?
6. Do we need content safety constraints (disallowed topics) for MVP?
7. Standard error handling patterns for crawl/generation (timeouts, retries, rate limits) and exact user messaging?
8. Should history store original AI draft, final edited text, or both (and how to display)?
9. Should MVP architecture anticipate multiple tones per user later (data model, UI affordances)?
10. Pricing/usage limits for MVP (free vs capped generations), and how limits are communicated in UI?