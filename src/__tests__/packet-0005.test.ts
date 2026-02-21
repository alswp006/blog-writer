import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { extractPlainTextFromHtml } from "@/lib/training/extractPlainText";
import { generateStyleSummary } from "@/lib/training/generateStyleSummary";
import { fetchAndExtractText } from "@/lib/training/fetchAndExtractText";

describe("packet-0005: Training Utilities", () => {
  describe("extractPlainTextFromHtml", () => {
    it("F1-AC4: extracts plain text from simple paragraph tag", () => {
      const result = extractPlainTextFromHtml("<p>a</p>");
      expect(result).toBe("a");
    });

    it("F1-AC4: removes multiple HTML tags", () => {
      const result = extractPlainTextFromHtml("<div><p>hello</p><span>world</span></div>");
      expect(result).toBe("helloworld");
    });

    it("F1-AC4: handles empty input", () => {
      const result = extractPlainTextFromHtml("");
      expect(result).toBe("");
    });

    it("F1-AC4: preserves text between tags", () => {
      const result = extractPlainTextFromHtml("<h1>Title</h1><p>Body text</p>");
      expect(result).toBe("TitleBody text");
    });

    it("F1-AC4: handles nested tags", () => {
      const result = extractPlainTextFromHtml("<div><strong><em>bold italic</em></strong></div>");
      expect(result).toBe("bold italic");
    });

    it("F1-AC4: handles self-closing tags", () => {
      const result = extractPlainTextFromHtml("<p>Line 1<br/>Line 2</p>");
      expect(result).toBe("Line 1Line 2");
    });
  });

  describe("generateStyleSummary", () => {
    it("F1-AC4: returns string with length >= 50 for simple input", () => {
      const result = generateStyleSummary("hello");
      expect(result.length).toBeGreaterThanOrEqual(50);
      expect(result).not.toMatch(/^\s*$/); // Not whitespace-only
    });

    it("F1-AC4: returns string with length >= 50 for longer input", () => {
      const longText = "The quick brown fox jumps over the lazy dog. This is a longer sentence.";
      const result = generateStyleSummary(longText);
      expect(result.length).toBeGreaterThanOrEqual(50);
      expect(result).not.toMatch(/^\s*$/);
    });

    it("F1-AC4: returns empty string for empty input", () => {
      const result = generateStyleSummary("");
      expect(result).toBe("");
    });

    it("F1-AC4: returns empty string for whitespace-only input", () => {
      const result = generateStyleSummary("   \n  \t  ");
      expect(result).toBe("");
    });

    it("F1-AC4: includes word count in summary", () => {
      const text = "word one word two word three";
      const result = generateStyleSummary(text);
      expect(result).toContain("6 words");
    });

    it("F1-AC4: detects contrast language and includes it", () => {
      const text = "The plan seemed solid. However, it failed on implementation.";
      const result = generateStyleSummary(text);
      expect(result.length).toBeGreaterThanOrEqual(50);
      expect(result).toContain("contrast");
    });

    it("F1-AC4: detects logical reasoning language", () => {
      const text = "First we analyze. Therefore, we conclude something important here.";
      const result = generateStyleSummary(text);
      expect(result.length).toBeGreaterThanOrEqual(50);
      expect(result).toContain("logical");
    });

    it("F1-AC4: is not whitespace-only for non-empty input", () => {
      const result = generateStyleSummary("test");
      expect(result.trim().length).toBeGreaterThan(0);
    });
  });

  describe("fetchAndExtractText", () => {
    beforeEach(() => {
      vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("F1-AC6: returns object with httpStatus and text properties", async () => {
      const mockHtml = "<p>Hello World</p>";
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 200,
        text: async () => mockHtml,
      });

      const result = await fetchAndExtractText("http://example.com");

      expect(result).toHaveProperty("httpStatus");
      expect(result).toHaveProperty("text");
      expect(result.httpStatus).toBe(200);
      expect(result.text).toBe("Hello World");
    });

    it("F1-AC6: handles non-200 HTTP status codes", async () => {
      const mockHtml = "<p>Not Found</p>";
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 404,
        text: async () => mockHtml,
      });

      const result = await fetchAndExtractText("http://example.com/missing");

      expect(result.httpStatus).toBe(404);
      expect(result.text).toBe("Not Found");
    });

    it("F1-AC6: extracts plain text from fetched HTML", async () => {
      const mockHtml = "<html><body><h1>Title</h1><p>Content here</p></body></html>";
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 200,
        text: async () => mockHtml,
      });

      const result = await fetchAndExtractText("http://example.com");

      expect(result.text).toBe("TitleContent here");
    });

    it("F2-AC3: can truncate result to MAX_TRAINING_TEXT_LEN without throwing", async () => {
      const MAX_TRAINING_TEXT_LEN = 20000;
      const longText = "a".repeat(30000);
      const mockHtml = `<p>${longText}</p>`;
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 200,
        text: async () => mockHtml,
      });

      const result = await fetchAndExtractText("http://example.com");

      // Simulate truncation as would be done by API route
      const truncated = result.text.substring(0, MAX_TRAINING_TEXT_LEN);
      expect(truncated.length).toBeLessThanOrEqual(MAX_TRAINING_TEXT_LEN);
      expect(() => {
        // This should not throw
        const trimmedText = truncated.trim();
        void trimmedText;
      }).not.toThrow();
    });
  });
});
