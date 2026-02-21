import type Database from "better-sqlite3";
import { getDb } from "@/lib/db";
import type { StyleProfile, StyleProfileSourceType, StyleProfileStatus } from "@/lib/models/types";
import { nowIso } from "@/lib/models/time";

export type UpsertStyleProfileInput = {
  sourceType: StyleProfileSourceType;
  sourceUrl?: string | null;
  trainingText?: string | null;
  styleSummary?: string;
  status?: StyleProfileStatus;
  lastError?: string | null;
};

export function getStyleProfileForUser(
  userId: string,
  db?: Database.Database
): StyleProfile | null {
  const conn = db ?? getDb();
  const row = conn
    .prepare("SELECT * FROM style_profiles WHERE userId = ?")
    .get(userId) as StyleProfile | undefined;
  return row ?? null;
}

export function upsertStyleProfileForUser(
  userId: string,
  input: UpsertStyleProfileInput,
  db?: Database.Database
): StyleProfile {
  const conn = db ?? getDb();
  const now = nowIso();

  const existing = conn
    .prepare("SELECT * FROM style_profiles WHERE userId = ?")
    .get(userId) as StyleProfile | undefined;

  if (existing) {
    conn
      .prepare(
        `UPDATE style_profiles
         SET sourceType = ?, sourceUrl = ?, trainingText = ?, styleSummary = ?,
             status = ?, lastError = ?, updatedAt = ?
         WHERE userId = ?`
      )
      .run(
        input.sourceType,
        input.sourceUrl ?? null,
        input.trainingText ?? null,
        input.styleSummary ?? existing.styleSummary,
        input.status ?? existing.status,
        input.lastError ?? null,
        now,
        userId
      );
  } else {
    const id = crypto.randomUUID();
    conn
      .prepare(
        `INSERT INTO style_profiles
           (id, userId, sourceType, sourceUrl, trainingText, styleSummary,
            status, lastError, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        id,
        userId,
        input.sourceType,
        input.sourceUrl ?? null,
        input.trainingText ?? null,
        input.styleSummary ?? "",
        input.status ?? "untrained",
        input.lastError ?? null,
        now,
        now
      );
  }

  return conn
    .prepare("SELECT * FROM style_profiles WHERE userId = ?")
    .get(userId) as StyleProfile;
}
