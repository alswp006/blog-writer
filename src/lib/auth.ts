import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getUserById } from "@/lib/models/user";
import type { SafeUser } from "@/lib/models/user";

const SESSION_COOKIE = "session_token";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// In-memory session store (resets on server restart — fine for MVP)
// For production: use DB-backed sessions
const sessions = new Map<string, { userId: number; expiresAt: number }>();

// ── Password hashing ──

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── Session management ──

export async function createSession(userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;

  sessions.set(token, { userId, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return token;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    sessions.delete(token);
    cookieStore.delete(SESSION_COOKIE);
  }
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = sessions.get(token);
  if (!session) return null;

  // Check expiry
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }

  return getUserById(session.userId);
}

/** Get session token from request headers (for middleware) */
export function getSessionTokenFromHeaders(headers: Headers): string | null {
  const cookieHeader = headers.get("cookie");
  if (!cookieHeader) return null;

  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return match?.[1] ?? null;
}

/** Validate a session token (for middleware — no cookie store needed) */
export function validateSessionToken(token: string): boolean {
  const session = sessions.get(token);
  if (!session) return false;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}
