import { requireUserId } from "@/lib/api/requireUserId";
import { jsonError } from "@/lib/api/jsonError";
import { getWritingRequestByIdForUser } from "@/lib/repos/writingRequestRepo";
import { getLatestDraftForUser } from "@/lib/repos/generatedDraftRepo";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireUserId(req);
  if (auth instanceof Response) return auth;

  const userId = String(auth.userId);
  const { id } = await params;

  const writingRequest = getWritingRequestByIdForUser(id, userId);
  if (!writingRequest) {
    return jsonError(404, "NOT_FOUND", "Writing request not found");
  }

  const latestDraft = getLatestDraftForUser(id, userId);

  return Response.json({ writingRequest, latestDraft: latestDraft ?? null });
}
