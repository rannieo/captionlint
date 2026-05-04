export type CaptionFormat = "SRT" | "VTT";

export type CaptionCue = {
  index: number;
  startMs: number;
  endMs: number;
  text: string;
  lines: string[];
  raw?: string;
};

export type ParserWarning = {
  code: "MALFORMED_CUE" | "MALFORMED_TIMESTAMP" | "EMPTY_CUE" | "UNSUPPORTED_FORMAT";
  message: string;
  cueIndex?: number;
  raw?: string;
};

export type ParseResult = {
  format: CaptionFormat;
  cues: CaptionCue[];
  warnings: ParserWarning[];
};

export type PresetId = "default" | "tiktok" | "instagram" | "youtube-shorts";

export type Severity = "PASS" | "WARN" | "ERROR";

export type RuleCategory = "readability" | "timing" | "structure" | "vocabulary" | "preset";

export type CaptionPreset = {
  id: PresetId;
  label: string;
  description: string;
  maxCharactersPerLine: number;
  maxLinesPerCue: number;
  maxCharactersPerSecond: number;
  minCueDurationMs: number;
  maxCueDurationMs: number;
  severityMap: Record<string, Severity>;
};

export type SuggestedFix = {
  label: string;
  description: string;
  replacementLines?: string[];
};

export type LintFinding = {
  id: string;
  runId: string;
  ruleCode: string;
  category: RuleCategory;
  severity: Severity;
  cueIndex?: number;
  startMs?: number;
  endMs?: number;
  message: string;
  details?: Record<string, unknown>;
  suggestedFix?: SuggestedFix;
};

export type LintSummary = {
  pass: number;
  warn: number;
  error: number;
  total: number;
};

export type LintRunStatus = "QUEUED" | "RUNNING" | "PASSED" | "FAILED" | "ERROR";

export type LintRun = {
  id: string;
  filename: string;
  format: CaptionFormat;
  presetId: PresetId;
  engineVersion: string;
  status: LintRunStatus;
  cues: CaptionCue[];
  findings: LintFinding[];
  summary: LintSummary;
  createdAt: string;
  finishedAt?: string;
};

export type VocabularyTerm = {
  id: string;
  term: string;
  caseSensitive: boolean;
  createdAt: string;
  workspaceId?: string;
};
