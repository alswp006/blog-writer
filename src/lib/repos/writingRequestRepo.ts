import type Database from "better-sqlite3";
import { getDb } from "@/lib/db";
import type { WritingRequest, WritingRequestStatus } from "@/lib/models/types";
import { nowIso } from "@/lib/models/time";

export type CreateWritingRequestInput = {
  topic: string;
  titleHint?: string | null;
  keyPoints?: string | null;
  constraints?: string | null;
};

export type UpdateWritingRequestInput = {
  status?: WritingRequestStatus;
  lastError?: string | null;
  topic?: string;
  titleHint?: string | null;
  keyPoints?: string | null;
  constraints?: string | null;
};

export function createWritingRequest(
  userId: string,
  input: CreateWritingRequestInput,
  db?: Database.Database
): WritingRequest {
  const conn = db ?? getDb();
  const id = crypto.randomUUID();
  const now = nowIso();

  conn
    .prepare(
      `INSERT INTO writing_requests
         (id, userId, topic, titleHint, keyPoints, constraints, status, lastError, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      userId,
      input.topic,
      input.titleHint ?? null,
      input.keyPoints ?? null,
      input.constraints ?? null,
      "queued",
      null,
      now,
      now
    );

  return conn
    .prepare("SELECT * FROM writing_requests WHERE id = ?")
    .get(id) as WritingRequest;
}

export function updateWritingRequest(
  id: string,
  input: UpdateWritingRequestInput,
  db?: Database.Database
): WritingRequest | null {
  const conn = db ?? getDb();
  const now = nowIso();

  const existing = conn
    .prepare("SELECT * FROM writing_requests WHERE id = ?")
    .get(id) as WritingRequest | undefined;
  if (!existing) return null;

  conn
    .prepare(
      `UPDATE writing_requests
       SET topic = ?, titleHint = ?, keyPoints = ?, constraints = ?,
           status = ?, lastError = ?, updatedAt = ?
       WHERE id = ?`
    )
    .run(
      input.topic ?? existing.topic,
      input.titleHint !== undefined ? input.titleHint : existing.titleHint,
      input.keyPoints !== undefined ? input.keyPoints : existing.keyPoints,
      input.constraints !== undefined ? input.constraints : existing.constraints,
      input.status ?? existing.status,
      input.lastError !== undefined ? input.lastError : existing.lastError,
      now,
      id
    );

  return conn
    .prepare("SELECT * FROM writing_requests WHERE id = ?")
    .get(id) as WritingRequest;
}

export function getWritingRequestByIdForUser(
  id: string,
  userId: string,
  db?: Database.Database
): WritingRequest | null {
  const conn = db ?? getDb();
  const row = conn
    .prepare("SELECT * FROM writing_requests WHERE id = ? AND userId = ?")
    .get(id, userId) as WritingRequest | undefined;
  return row ?? null;
}
