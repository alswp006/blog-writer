import type Database from "better-sqlite3";

/**
 * Ensure all application tables exist with proper schema and constraints.
 * Safe to call multiple times (uses CREATE TABLE IF NOT EXISTS).
 */
export function ensureAppSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS style_profiles (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL UNIQUE,
      sourceType TEXT NOT NULL CHECK (sourceType IN ('url','paste')),
      sourceUrl TEXT NULL,
      trainingText TEXT NULL,
      styleSummary TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL CHECK (status IN ('untrained','training','ready','failed')),
      lastError TEXT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS crawl_attempts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      url TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending','success','failed')),
      httpStatus INTEGER NULL,
      extractedText TEXT NULL,
      errorMessage TEXT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS writing_requests (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      topic TEXT NOT NULL,
      titleHint TEXT NULL,
      keyPoints TEXT NULL,
      constraints TEXT NULL,
      status TEXT NOT NULL CHECK (status IN ('queued','generating','completed','failed')),
      lastError TEXT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS generated_drafts (
      id TEXT PRIMARY KEY,
      writingRequestId TEXT NOT NULL,
      userId TEXT NOT NULL,
      content TEXT NOT NULL,
      version INTEGER NOT NULL,
      isLatest INTEGER NOT NULL CHECK (isLatest IN (0,1)),
      createdAt TEXT NOT NULL,
      FOREIGN KEY (writingRequestId) REFERENCES writing_requests(id),
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);
}
