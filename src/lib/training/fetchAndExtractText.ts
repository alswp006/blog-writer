import { extractPlainTextFromHtml } from "./extractPlainText";

export interface FetchAndExtractResult {
  httpStatus: number;
  text: string;
}

/**
 * Fetch HTML from a URL and extract plain text
 */
export async function fetchAndExtractText(url: string): Promise<FetchAndExtractResult> {
  const response = await fetch(url);
  const html = await response.text();
  const text = extractPlainTextFromHtml(html);

  return {
    httpStatus: response.status,
    text,
  };
}
