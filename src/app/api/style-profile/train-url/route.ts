import { requireUserId } from "@/lib/api/requireUserId";
import { jsonError } from "@/lib/api/jsonError";
import { createCrawlAttempt, updateCrawlAttempt } from "@/lib/repos/crawlAttemptRepo";
import { upsertStyleProfileForUser } from "@/lib/repos/styleProfileRepo";
import { fetchAndExtractText } from "@/lib/training/fetchAndExtractText";
import { generateStyleSummary } from "@/lib/training/generateStyleSummary";
import { MIN_TRAINING_TEXT_LEN, MAX_TRAINING_TEXT_LEN } from "@/lib/models/limits";
import { truncate } from "@/lib/models/text";

export async function POST(req: Request) {
  const auth = requireUserId(req);
  if (auth instanceof Response) return auth;

  const userId = String(auth.userId);
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "VALIDATION_ERROR", "Invalid JSON body");
  }

  const { url } = body;
  if (!url || typeof url !== "string" || (!url.startsWith("http://") && !url.startsWith("https://"))) {
    return jsonError(400, "VALIDATION_ERROR", "url must start with http:// or https://");
  }

  const crawlAttempt = createCrawlAttempt(userId, url);

  try {
    const { httpStatus, text } = await fetchAndExtractText(url);

    await updateCrawlAttempt(crawlAttempt.id, {
      status: "success",
      httpStatus,
      extractedText: text,
    });

    if (text.length < MIN_TRAINING_TEXT_LEN) {
      const styleProfile = upsertStyleProfileForUser(userId, {
        sourceType: "url",
        sourceUrl: url,
        trainingText: text,
        status: "failed",
        lastError: "INSUFFICIENT_TRAINING_TEXT",
      });
      const updated = await updateCrawlAttempt(crawlAttempt.id, { status: "failed", httpStatus });
      return Response.json({ styleProfile, crawlAttempt: updated ?? crawlAttempt });
    }

    const trainingText = truncate(text, MAX_TRAINING_TEXT_LEN);
    const styleSummary = generateStyleSummary(trainingText);
    const styleProfile = upsertStyleProfileForUser(userId, {
      sourceType: "url",
      sourceUrl: url,
      trainingText,
      styleSummary,
      status: "ready",
      lastError: null,
    });

    const finalCrawl = await updateCrawlAttempt(crawlAttempt.id, {
      status: "success",
      httpStatus,
      extractedText: trainingText,
    });
    return Response.json({ styleProfile, crawlAttempt: finalCrawl ?? crawlAttempt });
  } catch (err) {
    await updateCrawlAttempt(crawlAttempt.id, {
      status: "failed",
      errorMessage: err instanceof Error ? err.message : "Unknown error",
    });
    return jsonError(500, "INTERNAL_ERROR", "Failed to fetch or process URL");
  }
}
