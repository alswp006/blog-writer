import { describe, it, expect } from "vitest";
import { jsonError } from "@/lib/api/jsonError";
import { requireUserId } from "@/lib/api/requireUserId";
import { createSessionToken } from "@/lib/auth";

describe("packet-0004: jsonError", () => {
  it("F1-AC6: returns correct status and JSON shape", async () => {
    const res = jsonError(400, "VALIDATION_ERROR", "Invalid input");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: { code: "VALIDATION_ERROR", message: "Invalid input" } });
  });

  it("F1-AC6: includes details when provided, no extra top-level fields", async () => {
    const res = jsonError(400, "VALIDATION_ERROR", "Bad field", { field: "topic" });
    const body = await res.json();
    expect(Object.keys(body)).toEqual(["error"]);
    expect(body.error.details).toEqual({ field: "topic" });
  });

  it("omits details key when not provided", async () => {
    const res = jsonError(500, "INTERNAL_ERROR", "Something broke");
    const body = await res.json();
    expect("details" in body.error).toBe(false);
  });
});

describe("packet-0004: requireUserId", () => {
  it("F1-AC7: returns 401 UNAUTHORIZED when no cookie is present", async () => {
    const req = new Request("http://localhost/api/test");
    const result = requireUserId(req);
    expect(result instanceof Response).toBe(true);
    const res = result as Response;
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("F1-AC7: returns 401 UNAUTHORIZED for unknown session token", async () => {
    const req = new Request("http://localhost/api/test", {
      headers: { cookie: "session_token=invalid-token-xyz" },
    });
    const result = requireUserId(req);
    expect(result instanceof Response).toBe(true);
    const res = result as Response;
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("F1-AC7: returns { userId } for valid session", () => {
    const userId = 42;
    const token = createSessionToken(userId);
    const req = new Request("http://localhost/api/test", {
      headers: { cookie: `session_token=${token}` },
    });
    const result = requireUserId(req);
    expect(result instanceof Response).toBe(false);
    expect((result as { userId: number }).userId).toBe(userId);
  });
});
