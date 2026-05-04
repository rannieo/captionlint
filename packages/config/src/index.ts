import type { CaptionPreset, PresetId } from "@repo/shared-types";

const baseSeverityMap = {
  "READABILITY.CPL.MAX": "WARN",
  "READABILITY.LINES.MAX": "WARN",
  "READABILITY.CPS.MAX": "WARN",
  "TIMING.DURATION.MIN": "WARN",
  "TIMING.DURATION.MAX": "WARN",
  "TIMING.OVERLAP": "ERROR",
  "STRUCT.EMPTY_TEXT": "ERROR",
  "VOCAB.SPLIT.PROTECTED": "ERROR",
} as const;

export const captionPresets: CaptionPreset[] = [
  {
    id: "default",
    label: "Default",
    description: "Balanced CaptionLint defaults for general SRT/VTT QA.",
    maxCharactersPerLine: 42,
    maxLinesPerCue: 2,
    maxCharactersPerSecond: 20,
    minCueDurationMs: 900,
    maxCueDurationMs: 7000,
    severityMap: { ...baseSeverityMap },
  },
  {
    id: "tiktok",
    label: "TikTok",
    description: "CaptionLint short-form preset tuned for compact mobile captions.",
    maxCharactersPerLine: 32,
    maxLinesPerCue: 2,
    maxCharactersPerSecond: 17,
    minCueDurationMs: 900,
    maxCueDurationMs: 5000,
    severityMap: { ...baseSeverityMap },
  },
  {
    id: "instagram",
    label: "Instagram",
    description: "CaptionLint preset for readable social captions across feed and Reels usage.",
    maxCharactersPerLine: 34,
    maxLinesPerCue: 2,
    maxCharactersPerSecond: 18,
    minCueDurationMs: 900,
    maxCueDurationMs: 5500,
    severityMap: { ...baseSeverityMap },
  },
  {
    id: "youtube-shorts",
    label: "YouTube Shorts",
    description: "CaptionLint short-form preset for readable vertical video captions.",
    maxCharactersPerLine: 36,
    maxLinesPerCue: 2,
    maxCharactersPerSecond: 18,
    minCueDurationMs: 900,
    maxCueDurationMs: 6000,
    severityMap: { ...baseSeverityMap },
  },
];

export const defaultVocabularyTerms = ["ChatGPT", "OpenAI", "Midjourney", "Canva", "YouTube Shorts"];

export function getCaptionPreset(id: PresetId | string | undefined): CaptionPreset {
  return captionPresets.find((preset) => preset.id === id) ?? captionPresets[0]!;
}
