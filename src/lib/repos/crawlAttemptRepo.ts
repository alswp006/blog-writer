import type Database from "better-sqlite3";
import { getDb } from "@/lib/db";
import type { CrawlAttempt, CrawlAttemptStatus } from "@/lib/models/types";
import { nowIso } from "@/lib/models/time";

export type UpdateCrawlAttemptInput = {
  status?: CrawlAttemptStatus;
  httpStatus?: number | null;
  extractedText?: string | null;
  errorMessage?: string | null;
};

export function createCrawlAttempt(
  userId: string,
  url: string,
  db?: Database.Database
): CrawlAttempt {
  const conn = db ?? getDb();
  const id = crypto.randomUUID();
  const now = nowIso();

  conn
    .prepare(
      `INSERT INTO crawl_attempts (id, userId, url, status, httpStatus, extractedText, errorMessage, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(id, userId, url, "pending", null, null, null, now);

  return conn
    .prepare("SELECT * FROM crawl_attempts WHERE id = ?")
    .get(id) as CrawlAttempt;
}

export function updateCrawlAttempt(
  id: string,
  input: UpdateCrawlAttemptInput,
  db?: Database.Database
): CrawlAttempt | null {
  const conn = db ?? getDb();

  const existing = conn
    .prepare("SELECT * FROM crawl_attempts WHERE id = ?")
    .get(id) as CrawlAttempt | undefined;
  if (!existing) return null;

  conn
    .prepare(
      `UPDATE crawl_attempts
       SET status = ?, httpStatus = ?, extractedText = ?, errorMessage = ?
       WHERE id = ?`
    )
    .run(
      input.status ?? existing.status,
      input.httpStatus !== undefined ? input.httpStatus : existing.httpStatus,
      input.extractedText !== undefined ? input.extractedText : existing.extractedText,
      input.errorMessage !== undefined ? input.errorMessage : existing.errorMessage,
      id
    );

  return conn
    .prepare("SELECT * FROM crawl_attempts WHERE id = ?")
    .get(id) as CrawlAttempt;
}
