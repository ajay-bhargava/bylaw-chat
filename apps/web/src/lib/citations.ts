export interface Citation {
  document: "bylaws" | "offering-plan";
  section: string;
  quotedText: string;
}

// 3-part: [[cite: doc | section | text]]
const CITATION_REGEX_3 = /\[\[cite:\s*([^|]+)\|\s*([^|]+)\|\s*([^\]]+)\]\]/g;
// 2-part (legacy): [[cite: section | text]]
const CITATION_REGEX_2 = /\[\[cite:\s*([^|]+)\|\s*([^\]]+)\]\]/g;

const VALID_DOCUMENTS = new Set(["bylaws", "offering-plan"]);

export function parseCitations(text: string): Citation[] {
  const citations: Citation[] = [];
  const matched = new Set<number>();
  let match;

  // First pass: 3-part citations
  while ((match = CITATION_REGEX_3.exec(text)) !== null) {
    matched.add(match.index);
    const doc = match[1].trim().toLowerCase();
    citations.push({
      document: VALID_DOCUMENTS.has(doc) ? (doc as Citation["document"]) : "bylaws",
      section: match[2].trim(),
      quotedText: match[3].trim(),
    });
  }

  // Second pass: 2-part citations (backward compatible, default to bylaws)
  CITATION_REGEX_2.lastIndex = 0;
  while ((match = CITATION_REGEX_2.exec(text)) !== null) {
    if (!matched.has(match.index)) {
      citations.push({
        document: "bylaws",
        section: match[1].trim(),
        quotedText: match[2].trim(),
      });
    }
  }

  return citations;
}

// Matches both 3-part and 2-part citation formats
const CITATION_REGEX_ALL = /\[\[cite:\s*[^\]]+\]\]/g;

export function stripCitations(text: string): string {
  return text.replace(CITATION_REGEX_ALL, "");
}
