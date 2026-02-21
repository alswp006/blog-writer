/** Returns a Response with SPEC error JSON shape: { error: { code, message, details? } } */
export function jsonError(
  status: number,
  code: string,
  message: string,
  details?: unknown
): Response {
  const body: { error: { code: string; message: string; details?: unknown } } = {
    error: { code, message },
  };
  if (details !== undefined) {
    body.error.details = details;
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
