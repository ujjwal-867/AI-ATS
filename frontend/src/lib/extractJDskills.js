import skills from "./skills";

/**
 * Extracts recognized skills from job title + description text
 * using word-boundary matching to prevent false positives.
 */
export default function extractJDskills(text) {
  if (!text || typeof text !== "string") return [];

  const normalizedText = ` ${text.toLowerCase()} `;
  const extracted = new Set();

  for (const skill of skills) {
    const sLower = skill.toLowerCase();

    // Escape regex special chars in skill names (e.g. C++, Node.js)
    const escaped = sLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9+#])${escaped}(?:$|[^a-zA-Z0-9+#])`, "i");

    if (regex.test(normalizedText)) {
      extracted.add(skill);
    }
  }

  return Array.from(extracted);
}