/**
 * Maps bylaw section identifiers to zero-based PDF page indices.
 * The source PDF page numbering starts at 334, so PDF page 0 = doc page 334.
 */
const SECTION_PAGE_MAP: Record<string, number> = {
  "Section 1": 0,
  "Section 1.2": 0,
  "Section 1.3": 0,
  "Section 1.4": 0,
  "Section 1.5": 0,
  "Article II": 0,
  "Section 2.1": 0,
  "Section 2.2": 1,
  "Section 2.3": 1,
  "Section 2.4": 1,
  "Section 2.5": 2,
  "Section 2.6": 2,
  "Section 2.7": 3,
  "Section 2.8": 3,
  "Section 2.9": 3,
  "Section 2.10": 3,
  "Section 2.11": 5,
  "Section 2.12": 5,
  "Section 2.13": 6,
  "Section 2.14": 6,
  "Section 2.15": 6,
  "Article III": 6,
  "Section 3.1": 6,
  "Section 3.2": 6,
  "Section 3.3": 6,
  "Section 3.4": 7,
  "Section 3.5": 7,
  "Section 3.6": 7,
  "Section 3.7": 7,
  "Section 3.8": 7,
  "Section 3.9": 7,
  "Section 3.10": 7,
  "Article IV": 8,
  "Section 4.1": 8,
  "Section 4.2": 8,
  "Section 4.3": 8,
  "Section 4.4": 8,
  "Section 4.5": 8,
  "Section 4.6": 8,
  "Section 4.7": 8,
  "Section 4.8": 9,
  "Section 4.9": 9,
  "Article V": 9,
  "Article VI": 9,
  "Section 6.1": 9,
  "Section 6.2": 10,
  "Section 6.3": 10,
  "Section 6.4": 11,
  "Article VII": 11,
  "Section 7.1": 11,
  "Section 7.2": 11,
  "Section 7.3": 11,
  "Section 7.4": 11,
  "Section 7.5": 12,
  "Article VIII": 12,
  "Section 8.1": 12,
  "Section 8.2": 12,
  "Section 8.3": 12,
  "Article IX": 13,
  "Section 9.1": 13,
  "Section 9.2": 13,
  "Section 9.3": 14,
  "Section 9.4": 15,
  "Section 9.5": 16,
  "Section 9.6": 16,
  "Section 9.7": 16,
  "Section 9.8": 16,
  "Article X": 16,
  "Article XI": 16,
  "Section 11.1": 16,
  "Section 11.2": 17,
  "Section 11.3": 18,
  "Article XII": 18,
  "Section 12.1": 18,
  "Section 12.2": 19,
  "Section 12.3": 19,
  "Section 12.4": 19,
  "Section 12.5": 20,
  "Section 12.6": 20,
  "Section 12.7": 20,
  "Section 12.8": 20,
  "Section 12.9": 21,
  "Article XIII": 21,
  "Section 13.1": 21,
  "Section 13.2": 21,
  "Section 13.3": 24,
  "Section 13.4": 24,
  "Section 13.5": 24,
  "Section 13.6": 24,
  "Article XIV": 24,
  "Section 14.1": 24,
  "Section 14.2": 25,
  "Section 14.3": 25,
  "Article XV": 25,
  "Section 15.1": 25,
  "Article XVI": 26,
  "Section 16.1": 26,
  "Section 16.2": 26,
  "Section 16.3": 26,
  "Article XVII": 26,
  "Section 17.1": 26,
  "Section 17.2": 28,
  "Article XVIII": 28,
  "Section 18.1": 28,
  "Section 18.2": 28,
  "Section 18.3": 28,
  "Section 18.4": 28,
  "Section 18.5": 28,
  "Section 18.6": 28,
  "Section 18.7": 29,
  "Section 18.8": 29,
  "Section 18.9": 29,
  "Section 18.10": 30,
};

/**
 * Look up the zero-based PDF page index for a citation section string.
 * Handles formats like "Article II, Section 2.8" or "Section 2.8".
 */
export function getPageForSection(section: string): number | null {
  // Direct match
  if (section in SECTION_PAGE_MAP) return SECTION_PAGE_MAP[section];

  // Try extracting "Section X.X" from strings like "Article II, Section 2.8"
  const sectionMatch = section.match(/Section\s+[\d.]+/i);
  if (sectionMatch && sectionMatch[0] in SECTION_PAGE_MAP) {
    return SECTION_PAGE_MAP[sectionMatch[0]];
  }

  // Try extracting "Article X" from strings like "Article II"
  const articleMatch = section.match(/Article\s+[IVXLC]+/i);
  if (articleMatch && articleMatch[0] in SECTION_PAGE_MAP) {
    return SECTION_PAGE_MAP[articleMatch[0]];
  }

  return null;
}
