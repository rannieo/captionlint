export type TokenCategory = "Brand Name" | "Technical Term" | "Name (Person)" | "Acronym";

export type TokenFlag = "case_strict" | "exact_match" | "regex";

export type VocabToken = {
  token: string;
  category: TokenCategory;
  flags: TokenFlag[];
  hitCount: string;
};

export const vocabTokens: VocabToken[] = [
  {
    token: "OpenAI",
    category: "Brand Name",
    flags: ["case_strict", "exact_match"],
    hitCount: "1,245",
  },
  {
    token: "JavaScript",
    category: "Technical Term",
    flags: ["case_strict"],
    hitCount: "892",
  },
  {
    token: "API",
    category: "Acronym",
    flags: ["case_strict", "exact_match"],
    hitCount: "3,401",
  },
  {
    token: "iOS",
    category: "Brand Name",
    flags: ["case_strict", "exact_match"],
    hitCount: "512",
  },
];

export const tokenCategories: TokenCategory[] = [
  "Brand Name",
  "Technical Term",
  "Name (Person)",
  "Acronym",
];

// Legacy exports kept for compatibility
export type VocabularyRule = {
  code: string;
  severity: "ERROR" | "WARN";
  enabled: boolean;
  scope: "workspace" | "project";
  terms: string[];
};

export const protectedTerms: string[] = [
  "ChatGPT",
  "OpenAI",
  "Midjourney",
  "YouTube Shorts",
  "CaptionLint",
];

export const vocabularyRule: VocabularyRule = {
  code: "VOCAB.SPLIT.PROTECTED",
  severity: "ERROR",
  enabled: true,
  scope: "workspace",
  terms: ["ChatGPT", "OpenAI", "Midjourney"],
};
