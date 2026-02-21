import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { ensureAppSchema } from "@/lib/db/ensureAppSchema";

// Use a test database file
const TEST_DB_PATH = path.join(process.cwd(), "test-app.db");

function createTestDb(): Database.Database {
  // Clean up any existing test DB
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  const db = new Database(TEST_DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Create users table (required by foreign keys)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  return db;
}

function cleanupTestDb(db: Database.Database) {
  db.close();
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
}

describe("packet-0000: ensureAppSchema", () => {
  describe("F1-AC1: Fresh DB boots without errors", () => {
    it("should create all 4 tables without errors", () => {
      const db = createTestDb();
      expect(() => {
        ensureAppSchema(db);
      }).not.toThrow();
      cleanupTestDb(db);
    });

    it("should allow API calls to create style profile rows", () => {
      const db = createTestDb();
      ensureAppSchema(db);

      // Create a test user first
      const userId = 123;
      db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)").run(
        "test@example.com",
        "hashedpwd"
      );

      // Insert a style profile
      const id = "style-1";
      const now = new Date().toISOString();

      expect(() => {
        db.prepare(`
          INSERT INTO style_profiles (
            id, userId, sourceType, trainingText, styleSummary,
            status, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, String(userId), "paste", "training text", "summary", "untrained", now, now);
      }).not.toThrow();

      // Verify the row was created
      const row = db
        .prepare("SELECT * FROM style_profiles WHERE id = ?")
        .get(id) as Record<string, unknown> | undefined;
      expect(row).toBeDefined();
      expect(row?.userId).toBe(String(userId));
      expect(row?.status).toBe("untrained");

      cleanupTestDb(db);
    });
  });

  describe("F1-AC2: Idempotent schema creation", () => {
    it("should run twice without throwing", () => {
      const db = createTestDb();

      expect(() => {
        ensureAppSchema(db);
        ensureAppSchema(db);
      }).not.toThrow();

      cleanupTestDb(db);
    });

    it("should leave tables present after multiple runs", () => {
      const db = createTestDb();
      ensureAppSchema(db);
      ensureAppSchema(db);

      const tables = db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        )
        .all() as Array<{ name: string }>;

      const tableNames = tables.map((t) => t.name).sort();
      expect(tableNames).toContain("style_profiles");
      expect(tableNames).toContain("crawl_attempts");
      expect(tableNames).toContain("writing_requests");
      expect(tableNames).toContain("generated_drafts");

      cleanupTestDb(db);
    });
  });

  describe("F1-AC3: UNIQUE constraint on userId in style_profiles", () => {
    it("should have UNIQUE constraint on userId", () => {
      const db = createTestDb();
      ensureAppSchema(db);

      // Create a test user
      db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)").run(
        "test@example.com",
        "hashedpwd"
      );

      const userId = "user-1";
      const now = new Date().toISOString();

      // Insert first profile
      db.prepare(`
        INSERT INTO style_profiles (
          id, userId, sourceType, trainingText, styleSummary,
          status, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run("profile-1", userId, "paste", "text1", "summary1", "untrained", now, now);

      // Attempt to insert second profile with same userId should fail
      expect(() => {
        db.prepare(`
          INSERT INTO style_profiles (
            id, userId, sourceType, trainingText, styleSummary,
            status, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run("profile-2", userId, "paste", "text2", "summary2", "untrained", now, now);
      }).toThrow();

      cleanupTestDb(db);
    });
  });

  describe("F1-AC4: CHECK constraints for status/sourceType", () => {
    it("style_profiles should enforce sourceType values", () => {
      const db = createTestDb();
      ensureAppSchema(db);

      db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)").run(
        "test@example.com",
        "hashedpwd"
      );

      const now = new Date().toISOString();

      // Valid sourceType
      expect(() => {
        db.prepare(`
          INSERT INTO style_profiles (
            id, userId, sourceType, styleSummary, status, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run("p1", "u1", "url", "summary", "untrained", now, now);
      }).not.toThrow();

      // Invalid sourceType
      expect(() => {
        db.prepare(`
          INSERT INTO style_profiles (
            id, userId, sourceType, styleSummary, status, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run("p2", "u2", "invalid", "summary", "untrained", now, now);
      }).toThrow();

      cleanupTestDb(db);
    });

    it("style_profiles should enforce status values", () => {
      const db = createTestDb();
      ensureAppSchema(db);

      db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)").run(
        "test@example.com",
        "hashedpwd"
      );

      const now = new Date().toISOString();

      // Valid status
      expect(() => {
        db.prepare(`
          INSERT INTO style_profiles (
            id, userId, sourceType, styleSummary, status, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run("p1", "u1", "paste", "summary", "ready", now, now);
      }).not.toThrow();

      // Invalid status
      expect(() => {
        db.prepare(`
          INSERT INTO style_profiles (
            id, userId, sourceType, styleSummary, status, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run("p2", "u2", "paste", "summary", "invalid_status", now, now);
      }).toThrow();

      cleanupTestDb(db);
    });

    it("crawl_attempts should enforce status values", () => {
      const db = createTestDb();
      ensureAppSchema(db);

      db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)").run(
        "test@example.com",
        "hashedpwd"
      );

      const now = new Date().toISOString();

      // Valid status
      expect(() => {
        db.prepare(`
          INSERT INTO crawl_attempts (
            id, userId, url, status, createdAt
          ) VALUES (?, ?, ?, ?, ?)
        `).run("ca1", "u1", "https://example.com", "success", now);
      }).not.toThrow();

      // Invalid status
      expect(() => {
        db.prepare(`
          INSERT INTO crawl_attempts (
            id, userId, url, status, createdAt
          ) VALUES (?, ?, ?, ?, ?)
        `).run("ca2", "u2", "https://example.com", "invalid", now);
      }).toThrow();

      cleanupTestDb(db);
    });

    it("writing_requests should enforce status values", () => {
      const db = createTestDb();
      ensureAppSchema(db);

      db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)").run(
        "test@example.com",
        "hashedpwd"
      );

      const now = new Date().toISOString();

      // Valid status
      expect(() => {
        db.prepare(`
          INSERT INTO writing_requests (
            id, userId, topic, status, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?)
        `).run("wr1", "u1", "test topic", "queued", now, now);
      }).not.toThrow();

      // Invalid status
      expect(() => {
        db.prepare(`
          INSERT INTO writing_requests (
            id, userId, topic, status, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?)
        `).run("wr2", "u2", "test topic", "invalid_status", now, now);
      }).toThrow();

      cleanupTestDb(db);
    });

    it("generated_drafts should enforce isLatest values", () => {
      const db = createTestDb();
      ensureAppSchema(db);

      db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)").run(
        "test@example.com",
        "hashedpwd"
      );

      const now = new Date().toISOString();

      // First create a writing request
      db.prepare(`
        INSERT INTO writing_requests (
          id, userId, topic, status, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).run("wr1", "u1", "test", "generating", now, now);

      // Valid isLatest (0 or 1)
      expect(() => {
        db.prepare(`
          INSERT INTO generated_drafts (
            id, writingRequestId, userId, content, version, isLatest, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run("gd1", "wr1", "u1", "content", 1, 1, now);
      }).not.toThrow();

      // Invalid isLatest
      expect(() => {
        db.prepare(`
          INSERT INTO generated_drafts (
            id, writingRequestId, userId, content, version, isLatest, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run("gd2", "wr1", "u1", "content", 2, 2, now);
      }).toThrow();

      cleanupTestDb(db);
    });
  });
});
