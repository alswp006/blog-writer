# CLAUDE.md — Project Rules

## CRITICAL: STANDALONE Next.js app
- INDEPENDENT app, NOT monorepo. Only import from node_modules or src/
- No @ai-factory/*, drizzle-orm, @libsql/client. Check package.json first
- DB: use better-sqlite3, localStorage, or in-memory for MVP
- ALWAYS check existing code before creating new files — avoid duplicates

## CRITICAL: Edge Runtime Restrictions
- middleware.ts runs in Edge Runtime — it CANNOT import anything that uses Node.js modules (fs, path, crypto, better-sqlite3, bcryptjs)
- middleware.ts should ONLY check cookies via request.cookies.get() — NEVER import from lib/auth.ts or lib/db.ts
- API routes and Server Components run in Node.js runtime — they CAN import anything
- If you need auth checks in middleware, use ONLY cookie-based checks, never DB queries

## CRITICAL: Next.js 15 Breaking Changes
- Route params are now async: `{ params }: { params: Promise<{ id: string }> }` then `const { id } = await params;`
- searchParams are also async: `{ searchParams }: { searchParams: Promise<{ q?: string }> }`
- NEVER use `params.id` directly — always await first
- Server Actions must be in files with "use server" or inline with "use server" directive

## CRITICAL: Client vs Server Components
- Hooks (useState, useEffect, useRef) require "use client" at the TOP of the file
- Event handlers (onClick, onChange, onSubmit) require "use client"
- Server Components CANNOT use hooks or event handlers
- When in doubt, add "use client" — it's safer than missing it

## Commands
- pnpm install --ignore-workspace / build / typecheck / test / dev
- IMPORTANT: Always use --ignore-workspace with pnpm to avoid monorepo interference
- Build: npx next build (verify it passes before finishing)
- Typecheck: npx tsc --noEmit (fix ALL errors before finishing)

## Testing
- Write tests in src/__tests__/packet-{id}.test.ts alongside your implementation
- Use vitest: import {describe,it,expect} from "vitest"
- Use @/ alias for imports (vitest resolves @/ → src/)
- Run pnpm test + pnpm typecheck before finishing

## CRITICAL: API Route Auth Pattern (testability)
- API route handlers MUST be testable with plain `new Request()` — no Next.js runtime required
- NEVER use `cookies()` from "next/headers" inside API routes — it fails in vitest
- Instead: read cookies from `request.headers.get("cookie")` and set cookies via `Response` headers:
  ```
  // Reading a session cookie from request:
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/session=([^;]+)/);
  const token = match?.[1] ?? null;

  // Setting a session cookie in response:
  const res = NextResponse.json({ user });
  res.headers.set("set-cookie", `session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800`);
  return res;
  ```
- Cookie name MUST be "session" (not "session_token")
- Signup success: return status 200 (not 201)
- This pattern ensures tests can call route handlers directly and inspect Set-Cookie headers

## Code Style
- TypeScript strict, Next.js 15 App Router, all files in src/
- Tailwind CSS only (no inline styles), no .eslintrc files
- All imports must resolve — verify with pnpm typecheck

## Common Build Error Prevention
- Every 'use client' component that imports a Server Component will fail — restructure
- Dynamic imports with `import()` in client components must use next/dynamic
- Image component: use next/image with width+height or fill prop
- Link component: import from next/link, no nested <a> tags
- Forms: use native form + server action, or "use client" + fetch
- JSON imports: add "resolveJsonModule": true in tsconfig if needed
- Missing types: check @types/ packages are in devDependencies

## Design System
Colors (CSS vars ONLY — never hardcode):
- bg: var(--bg), var(--bg-elevated), var(--bg-card), var(--bg-input)
- border: var(--border), var(--border-hover)
- text: var(--text), var(--text-secondary), var(--text-muted)
- accent: var(--accent), var(--accent-soft)
- semantic: var(--success-soft), var(--danger-soft), var(--warning-soft)

Components (import from @/components/ui/):
- Button: default/secondary/ghost/destructive, sizes: sm/default/lg
- Card: CardHeader/CardTitle/CardDescription/CardContent/CardFooter
- Input, Textarea, Badge(default/success/error/warning)

Spacing: page=space-y-10, section=space-y-6, card-padding=p-6, fields=space-y-4
Typography: title=text-2xl font-bold, section=text-lg font-semibold, body=text-sm, meta=text-xs text-[var(--text-muted)]
States: loading=skeleton class, empty=centered icon+heading+CTA, error=danger-soft banner
Transitions: transition-all duration-150 on interactive elements

## Navigation
- Every page reachable from header nav. Login<->Signup cross-linked.
- Layout at src/app/layout.tsx — UPDATE it, don't recreate.
- Nav component at src/components/ui/nav.tsx — add links for new pages here.

## Final Checklist (run before finishing)
1. pnpm typecheck — zero errors
2. pnpm test — all tests pass
3. npx next build — builds successfully
4. No "use client" missing warnings
5. No unresolved imports

## Preserved Template Rules


## Pre-built Auth (DO NOT RECREATE)
- src/lib/auth.ts — cookie sessions + bcrypt
- src/lib/models/user.ts — user CRUD
- src/app/api/auth/{login,signup,logout,me}/route.ts — API routes
- src/app/{login,signup}/page.tsx — UI pages
- src/middleware.ts — route protection (/dashboard/* requires auth)
- To add new protected routes: update PROTECTED_PREFIXES in middleware.ts

## Navigation
- Every page reachable from header nav. Login<->Signup cross-linked.
- Layout at src/app/layout.tsx — UPDATE it, don't recreate.
- Nav component at src/components/ui/nav.tsx — add links for new pages here.

