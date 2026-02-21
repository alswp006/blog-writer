import { requireUserId } from "@/lib/api/requireUserId";
import { jsonError } from "@/lib/api/jsonError";
import { getStyleProfileForUser } from "@/lib/repos/styleProfileRepo";
import {
  createWritingRequest,
  updateWritingRequest,
} from "@/lib/repos/writingRequestRepo";
import { createGeneratedDraftAsLatest } from "@/lib/repos/generatedDraftRepo";
import { generateDraft } from "@/lib/writing/generateDraft";
import { MAX_DRAFT_CONTENT_LEN } from "@/lib/models/limits";

export async function POST(req: Request) {
  const auth = requireUserId(req);
  if (auth instanceof Response) return auth;

  const userId = String(auth.userId);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "VALIDATION_ERROR", "Invalid JSON body");
  }

  const {
    topic,
    titleHint,
    keyPoints,
    constraints,
  } = body as Record<string, unknown>;

  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    return jsonError(400, "VALIDATION_ERROR", "topic is required");
  }

  const styleProfile = getStyleProfileForUser(userId);
  if (!styleProfile || styleProfile.status !== "ready") {
    return jsonError(409, "CONFLICT", "STYLE_PROFILE_NOT_READY");
  }

  const writingRequest = createWritingRequest(userId, {
    topic: topic.trim(),
    titleHint: typeof titleHint === "string" ? titleHint : null,
    keyPoints: typeof keyPoints === "string" ? keyPoints : null,
    constraints: typeof constraints === "string" ? constraints : null,
  });

  const rawContent = generateDraft({
    topic: writingRequest.topic,
    titleHint: writingRequest.titleHint,
    keyPoints: writingRequest.keyPoints,
    constraints: writingRequest.constraints,
    styleSummary: styleProfile.styleSummary,
  });

  const draftContent = rawContent.slice(0, MAX_DRAFT_CONTENT_LEN);

  const latestDraft = createGeneratedDraftAsLatest(
    writingRequest.id,
    userId,
    draftContent
  );

  const updatedRequest =
    updateWritingRequest(writingRequest.id, { status: "completed" }) ??
    writingRequest;

  return Response.json({ writingRequest: updatedRequest, latestDraft });
}
