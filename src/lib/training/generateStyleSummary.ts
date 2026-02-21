/**
 * Generate a non-empty style summary from training text
 * Always returns a string with length >= 50 for non-empty input
 */
export function generateStyleSummary(trainingText: string): string {
  if (!trainingText || trainingText.trim().length === 0) {
    return "";
  }

  const text = trainingText.trim();

  // Extract key characteristics from the text
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/);

  const summary: string[] = [];

  // Add info about the text composition
  summary.push(`Style based on ${words.length} words and ${sentences.length} sentences.`);

  // Detect common patterns
  if (text.toLowerCase().includes("however") || text.toLowerCase().includes("nevertheless")) {
    summary.push("Uses contrast and counterpoint effectively.");
  }

  if (text.toLowerCase().includes("therefore") || text.toLowerCase().includes("consequently")) {
    summary.push("Employs logical reasoning and cause-effect relationships.");
  }

  if (text.toLowerCase().includes("example") || text.toLowerCase().includes("such as")) {
    summary.push("Supports arguments with concrete examples.");
  }

  // Check sentence length variety
  const avgSentenceLength = text.length / Math.max(sentences.length, 1);
  if (avgSentenceLength > 100) {
    summary.push("Favors longer, complex sentences.");
  } else if (avgSentenceLength < 50) {
    summary.push("Prefers shorter, punchy sentences.");
  } else {
    summary.push("Maintains moderate sentence length.");
  }

  // Check for rhetorical devices
  if (text.match(/([!?]){2,}/)) {
    summary.push("Uses emphatic punctuation.");
  }

  const result = summary.join(" ");

  // Ensure minimum length of 50 characters
  if (result.length >= 50) {
    return result;
  }

  // If summary is too short, add more descriptive information
  const additionalInfo = `Writing style reflects ${Math.min(words.length, 999)} distinct vocabulary items. ${result}`;
  if (additionalInfo.length >= 50) {
    return additionalInfo;
  }

  // Fallback to ensure we always return at least 50 chars for non-empty input
  return `Training text contains ${words.length} words and demonstrates ${sentences.length} distinct thought units. ${result}`;
}
