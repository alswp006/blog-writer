import { MAX_DRAFT_CONTENT_LEN } from "@/lib/models/limits";

export type GenerateDraftInput = {
  topic: string;
  titleHint?: string | null;
  keyPoints?: string | null;
  constraints?: string | null;
  styleSummary?: string | null;
};

/**
 * Generate a deterministic draft from writing request inputs.
 * If titleHint is provided it appears verbatim in the output.
 */
export function generateDraft(input: GenerateDraftInput): string {
  const { topic, titleHint, keyPoints, constraints, styleSummary } = input;

  const title = titleHint ?? `${topic}: A Comprehensive Guide`;

  const lines: string[] = [];

  lines.push(`# ${title}`);
  lines.push("");

  lines.push("## Introduction");
  lines.push("");
  lines.push(
    `This article explores ${topic}.` +
      (styleSummary ? ` ${styleSummary}` : "")
  );
  lines.push("");

  if (keyPoints) {
    lines.push("## Key Points");
    lines.push("");
    const points = keyPoints
      .split(/[,\n]/)
      .map((p) => p.trim())
      .filter(Boolean);
    for (const point of points) {
      lines.push(
        `- **${point}**: An important aspect of ${topic} worth examining.`
      );
    }
    lines.push("");
  }

  lines.push("## Discussion");
  lines.push("");
  lines.push(
    `When examining ${topic}, multiple dimensions come into play. ` +
      `Understanding the nuances helps form a well-rounded perspective on the subject.`
  );
  lines.push("");
  lines.push(
    `The topic of ${topic} has gained significant attention. ` +
      `Practitioners and researchers alike have contributed valuable insights.`
  );
  lines.push("");

  if (constraints) {
    lines.push("## Scope");
    lines.push("");
    lines.push(`This piece is scoped to: ${constraints}`);
    lines.push("");
  }

  lines.push("## Conclusion");
  lines.push("");
  lines.push(
    `In summary, ${topic} is a rich and multifaceted subject. ` +
      `The perspectives presented here lay a foundation for further exploration.`
  );
  lines.push("");

  const content = lines.join("\n");
  return content.slice(0, MAX_DRAFT_CONTENT_LEN);
}
