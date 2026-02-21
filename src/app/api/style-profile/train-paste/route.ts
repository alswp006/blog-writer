import { requireUserId } from "@/lib/api/requireUserId";
import { jsonError } from "@/lib/api/jsonError";
import { upsertStyleProfileForUser } from "@/lib/repos/styleProfileRepo";
import { generateStyleSummary } from "@/lib/training/generateStyleSummary";
import { MIN_TRAINING_TEXT_LEN, MAX_TRAINING_TEXT_LEN } from "@/lib/models/limits";
import { truncate } from "@/lib/models/text";

export async function POST(req: Request) {
  const auth = requireUserId(req);
  if (auth instanceof Response) return auth;

  const userId = String(auth.userId);
  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "VALIDATION_ERROR", "Invalid JSON body");
  }

  const { text } = body;
  if (!text || typeof text !== "string") {
    return jsonError(400, "VALIDATION_ERROR", "text is required");
  }

  if (text.length < MIN_TRAINING_TEXT_LEN) {
    return jsonError(400, "VALIDATION_ERROR", "Text must be at least 1000 characters");
  }

  const trainingText = truncate(text, MAX_TRAINING_TEXT_LEN);
  const styleSummary = generateStyleSummary(trainingText);
  const styleProfile = upsertStyleProfileForUser(userId, {
    sourceType: "paste",
    sourceUrl: null,
    trainingText,
    styleSummary,
    status: "ready",
    lastError: null,
  });

  return Response.json({ styleProfile });
}
