import { getSessionTokenFromHeaders, getSessionUserId } from "@/lib/auth";
import { jsonError } from "@/lib/api/jsonError";

type AuthSuccess = { userId: number };
type AuthResult = AuthSuccess | Response;

/** Read the session from request headers and return { userId } or a 401 Response */
export function requireUserId(req: Request): AuthResult {
  const token = getSessionTokenFromHeaders(req.headers);
  if (!token) {
    return jsonError(401, "UNAUTHORIZED", "Authentication required");
  }
  const userId = getSessionUserId(token);
  if (userId === null) {
    return jsonError(401, "UNAUTHORIZED", "Authentication required");
  }
  return { userId };
}
