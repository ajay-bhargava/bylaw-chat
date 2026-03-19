export interface Citation {
  section: string;
  quotedText: string;
}

const CITATION_REGEX = /\[\[cite:\s*([^|]+)\|\s*([^\]]+)\]\]/g;

export function parseCitations(text: string): Citation[] {
  const citations: Citation[] = [];
  let match;
  while ((match = CITATION_REGEX.exec(text)) !== null) {
    citations.push({
      section: match[1].trim(),
      quotedText: match[2].trim(),
    });
  }
  return citations;
}

export function stripCitations(text: string): string {
  return text.replace(CITATION_REGEX, "");
}
