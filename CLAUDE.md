# CLAUDE.md — Project Rules

## CRITICAL: STANDALONE Next.js app
- INDEPENDENT app, NOT monorepo. Only import from node_modules or src/
- No @ai-factory/*, drizzle-orm, @libsql/client. Check package.json first
- DB: use better-sqlite3 (already configured in src/lib/db.ts)

## Commands
- pnpm install --ignore-workspace / build / typecheck / test / dev
- IMPORTANT: Always use --ignore-workspace with pnpm to avoid monorepo interference
- Build: npx next build (verify it passes before finishing)

## Pre-built Auth (DO NOT RECREATE)
- src/lib/auth.ts — cookie sessions + bcrypt
- src/lib/models/user.ts — user CRUD
- src/app/api/auth/{login,signup,logout,me}/route.ts — API routes
- src/app/{login,signup}/page.tsx — UI pages
- src/middleware.ts — route protection (/dashboard/* requires auth)
- To add new protected routes: update PROTECTED_PREFIXES in middleware.ts

## TDD (CRITICAL)
- src/__tests__/ files are READ-ONLY — NEVER modify
- Tests define required exports. Read imports → create matching modules in src/lib/
- Run pnpm test + pnpm typecheck before finishing

## Code Style
- TypeScript strict, Next.js 15 App Router, all files in src/
- Tailwind CSS only (no inline styles), no .eslintrc files

## Design System
Colors (CSS vars ONLY — never hardcode):
- bg: var(--bg), var(--bg-elevated), var(--bg-card), var(--bg-input)
- border: var(--border), var(--border-hover)
- text: var(--text), var(--text-secondary), var(--text-muted)
- accent: var(--accent), var(--accent-soft)
- semantic: var(--success-soft), var(--danger-soft), var(--warning-soft)

Spacing: page=space-y-10, section=space-y-6, card-padding=p-6, fields=space-y-4
Typography: title=text-2xl font-bold, section=text-lg font-semibold, body=text-sm, meta=text-xs text-[var(--text-muted)]
States: loading=skeleton class, empty=centered icon+heading+CTA, error=danger-soft banner
Transitions: transition-all duration-150 on interactive elements

## Navigation
- Every page reachable from header nav. Login<->Signup cross-linked.
- Layout at src/app/layout.tsx — UPDATE it, don't recreate.
- Nav component at src/components/ui/nav.tsx — add links for new pages here.
