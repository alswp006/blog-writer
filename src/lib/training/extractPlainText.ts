/**
 * Extract plain text from HTML by removing all tags
 */
export function extractPlainTextFromHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}
