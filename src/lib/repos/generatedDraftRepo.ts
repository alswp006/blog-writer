import type Database from "better-sqlite3";
import { getDb } from "@/lib/db";
import type { GeneratedDraft } from "@/lib/models/types";
import { nowIso } from "@/lib/models/time";

type DbDraftRow = Omit<GeneratedDraft, "isLatest"> & { isLatest: number };

function rowToDraft(row: DbDraftRow): GeneratedDraft {
  return { ...row, isLatest: row.isLatest === 1 };
}

export function createGeneratedDraftAsLatest(
  writingRequestId: string,
  userId: string,
  content: string,
  db?: Database.Database
): GeneratedDraft {
  const conn = db ?? getDb();
  const now = nowIso();

  const run = conn.transaction(() => {
    // Demote all existing drafts for this writingRequest
    conn
      .prepare(
        "UPDATE generated_drafts SET isLatest = 0 WHERE writingRequestId = ?"
      )
      .run(writingRequestId);

    // Determine next version number
    const versionRow = conn
      .prepare(
        "SELECT MAX(version) as maxVersion FROM generated_drafts WHERE writingRequestId = ?"
      )
      .get(writingRequestId) as { maxVersion: number | null };
    const nextVersion = (versionRow.maxVersion ?? 0) + 1;

    const id = crypto.randomUUID();
    conn
      .prepare(
        `INSERT INTO generated_drafts
           (id, writingRequestId, userId, content, version, isLatest, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(id, writingRequestId, userId, content, nextVersion, 1, now);

    return conn
      .prepare("SELECT * FROM generated_drafts WHERE id = ?")
      .get(id) as DbDraftRow;
  });

  return rowToDraft(run());
}

export function getLatestDraftForUser(
  writingRequestId: string,
  userId: string,
  db?: Database.Database
): GeneratedDraft | null {
  const conn = db ?? getDb();
  const row = conn
    .prepare(
      "SELECT * FROM generated_drafts WHERE writingRequestId = ? AND userId = ? AND isLatest = 1"
    )
    .get(writingRequestId, userId) as DbDraftRow | undefined;
  return row ? rowToDraft(row) : null;
}
