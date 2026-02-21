import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { ensureAppSchema } from "@/lib/db/ensureAppSchema";
import { createSessionToken } from "@/lib/auth";

const TEST_DB_PATH = path.join(process.cwd(), "test-packet-0011.db");

function createTestDb(): Database.Database {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  const db = new Database(TEST_DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

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

  ensureAppSchema(db);

  return db;
}

function cleanupTestDb(db: Database.Database) {
  db.close();
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
}

describe("packet-0011: Style Profile UI", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createTestDb();
  });

  afterEach(() => {
    cleanupTestDb(db);
  });

  describe("F1-AC7: Auth required for /style", () => {
    it("GET /api/style-profile returns 401 without session", async () => {
      const req = new Request("http://localhost/api/style-profile");
      const { GET } = await import("@/app/api/style-profile/route");
      const res = await GET(req);

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("F1-AC6: URL validation", () => {
    it("POST /api/style-profile/train-url rejects URL without http(s)", async () => {
      db.prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)").run(
        1,
        "test@example.com",
        "hash"
      );

      const token = createSessionToken(1);
      const req = new Request("http://localhost/api/style-profile/train-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `session_token=${token}`,
        },
        body: JSON.stringify({ url: "example.com" }),
      });

      const { POST } = await import("@/app/api/style-profile/train-url/route");
      const res = await POST(req);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("F2-AC1: Paste training with min length", () => {
    it("POST /api/style-profile/train-paste returns sourceType paste and status ready", async () => {
      db.prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)").run(
        1,
        "test@example.com",
        "hash"
      );

      const token = createSessionToken(1);
      const longText = "word ".repeat(300); // 1500 chars, meets MIN_TRAINING_TEXT_LEN

      const req = new Request("http://localhost/api/style-profile/train-paste", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `session_token=${token}`,
        },
        body: JSON.stringify({ text: longText }),
      });

      const { POST } = await import("@/app/api/style-profile/train-paste/route");
      const res = await POST(req);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.styleProfile.sourceType).toBe("paste");
      expect(body.styleProfile.status).toBe("ready");
    });
  });

  describe("F1-AC3: URL training success shows ready status and summary", () => {
    it("successful URL training returns status ready and non-empty styleSummary", async () => {
      db.prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)").run(
        1,
        "test@example.com",
        "hash"
      );

      const token = createSessionToken(1);

      // Mock fetch to return sufficient text
      const originalFetch = global.fetch;
      global.fetch = async () => {
        const longText = "word ".repeat(300);
        return {
          status: 200,
          text: async () => `<p>${longText}</p>`,
        } as Response;
      };

      const req = new Request("http://localhost/api/style-profile/train-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `session_token=${token}`,
        },
        body: JSON.stringify({ url: "https://example.com" }),
      });

      const { POST } = await import("@/app/api/style-profile/train-url/route");
      const res = await POST(req);

      global.fetch = originalFetch;

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.styleProfile.status).toBe("ready");
      expect(body.styleProfile.styleSummary).toBeTruthy();
      expect(body.styleProfile.styleSummary.length).toBeGreaterThan(0);
    });
  });

  describe("F1-AC2: Crawl attempt status", () => {
    it("URL training returns crawlAttempt with success or failed status", async () => {
      db.prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)").run(
        1,
        "test@example.com",
        "hash"
      );

      const token = createSessionToken(1);

      const originalFetch = global.fetch;
      global.fetch = async () => {
        const longText = "word ".repeat(300);
        return {
          status: 200,
          text: async () => `<p>${longText}</p>`,
        } as Response;
      };

      const req = new Request("http://localhost/api/style-profile/train-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `session_token=${token}`,
        },
        body: JSON.stringify({ url: "https://example.com" }),
      });

      const { POST } = await import("@/app/api/style-profile/train-url/route");
      const res = await POST(req);

      global.fetch = originalFetch;

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.crawlAttempt.status).toMatch(/^(success|failed)$/);
    });
  });
});
