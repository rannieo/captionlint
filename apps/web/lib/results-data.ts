import type { Severity } from "./types";

export type ResultFinding = {
  id: string;
  severity: Severity;
  line: string;
  category: string;
  message: string;
  timecode: string;
  cue: string;
  action?: string;
};

export type SeverityMetric = {
  severity: Severity;
  value: string;
  label: string;
};

export const resultSeverityMetrics: SeverityMetric[] = [
  { severity: "PASS", value: "18", label: "checks passed" },
  { severity: "WARN", value: "2", label: "fix before publish" },
  { severity: "ERROR", value: "1", label: "blocking issue" },
];

export const resultFindings: ResultFinding[] = [
  {
    id: "1",
    severity: "ERROR",
    line: "42",
    category: "Reading Speed",
    message: "CPS exceeds maximum threshold (24 > 20).",
    timecode: "00:02:20,500 --> 00:02:21,800",
    cue: "This is an extraordinarily long sentence that will definitely exceed the standard characters per second reading limit established by the current selected ruleset.",
    action: "Auto-split",
  },
  {
    id: "2",
    severity: "WARN",
    line: "87",
    category: "Grammar",
    message: "Possible missing comma after introductory phrase.",
    timecode: "00:03:10,200 --> 00:03:12,000",
    cue: "However we must consider the alternatives carefully.",
  },
  {
    id: "3",
    severity: "ERROR",
    line: "112",
    category: "Format",
    message: "Orphaned word detected on second line.",
    timecode: "00:04:05,100 --> 00:04:07,000",
    cue: "The quick analysis of the situation\nrevealed several key\nfactors.",
    action: "Fix wrapping",
  },
  {
    id: "4",
    severity: "WARN",
    line: "156",
    category: "Style",
    message: "Non-standard capitalization for specific brand noun.",
    timecode: "00:05:22,300 --> 00:05:24,100",
    cue: "Welcome to captionqa platform for all your needs.",
  },
];

export const editorLines = [
  {
    num: "40",
    timecode: "00:02:15,000 --> 00:02:17,500",
    text: "The quick analysis of the situation\nrevealed several key factors.",
    error: false,
  },
  {
    num: "41",
    timecode: "00:02:18,100 --> 00:02:20,000",
    text: "However, we must consider the alternatives.",
    error: false,
  },
  {
    num: "42",
    timecode: "00:02:20,500 --> 00:02:21,800",
    text: "This is an extraordinarily long sentence that will definitely exceed the standard characters per second reading limit established by the current selected ruleset.",
    error: true,
  },
  {
    num: "43",
    timecode: "00:02:22,000 --> 00:02:24,000",
    text: "Moving forward.",
    error: false,
  },
  {
    num: "44",
    timecode: "00:02:24,500 --> 00:02:26,000",
    text: "We need to ensure compliance.",
    error: false,
  },
];
