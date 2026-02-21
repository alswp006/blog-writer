import { requireUserId } from "@/lib/api/requireUserId";
import { getStyleProfileForUser } from "@/lib/repos/styleProfileRepo";

export async function GET(req: Request) {
  const auth = requireUserId(req);
  if (auth instanceof Response) return auth;

  const styleProfile = getStyleProfileForUser(String(auth.userId));
  return Response.json({ styleProfile });
}
