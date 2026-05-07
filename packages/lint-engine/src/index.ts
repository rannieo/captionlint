import { getCaptionPreset } from "@repo/config";
import type { CaptionCue, CaptionPreset, LintFinding, LintRun, LintSummary, ParserWarning, PresetId, Severity } from "@repo/shared-types";

export const LINT_ENGINE_VERSION = "0.1.0";

export type LintOptions = {
  runId?: string;
  filename?: string;
  format?: "SRT" | "VTT";
  presetId?: PresetId;
  preset?: CaptionPreset;
  vocabularyTerms?: string[];
  parserWarnings?: ParserWarning[];
  now?: string;
};

export function lintCaptions(cues: CaptionCue[], options: LintOptions = {}): LintRun {
  const preset = options.preset ?? getCaptionPreset(options.presetId);
  const runId = options.runId ?? stableRunId(cues, preset.id, options.filename ?? "captions.srt");
  const findings = buildFindings(cues, preset, runId, options.vocabularyTerms ?? [], options.parserWarnings ?? []);
  const summary = summarizeFindings(findings);
  const now = options.now ?? new Date().toISOString();

  return {
    id: runId,
    filename: options.filename ?? "captions.srt",
    format: options.format ?? "SRT",
    presetId: preset.id,
    engineVersion: LINT_ENGINE_VERSION,
    status: summary.error > 0 ? "ERROR" : "PASSED",
    cues,
    findings,
    summary,
    createdAt: now,
    finishedAt: now,
  };
}

export function summarizeFindings(findings: LintFinding[]): LintSummary {
  return findings.reduce<LintSummary>(
    (summary, finding) => {
      if (finding.severity === "PASS") summary.pass += 1;
      if (finding.severity === "WARN") summary.warn += 1;
      if (finding.severity === "ERROR") summary.error += 1;
      summary.total += 1;
      return summary;
    },
    { pass: 0, warn: 0, error: 0, total: 0 }
  );
}

export function applySafeFixes(cues: CaptionCue[], findings: LintFinding[]): CaptionCue[] {
  const fixesByCue = new Map<number, string[]>();
  findings.forEach((finding) => {
    if (finding.cueIndex !== undefined && finding.suggestedFix?.replacementLines) {
      fixesByCue.set(finding.cueIndex, finding.suggestedFix.replacementLines);
    }
  });

  return cues.map((cue) => {
    const replacementLines = fixesByCue.get(cue.index);
    if (!replacementLines) return cue;
    return {
      ...cue,
      lines: replacementLines,
      text: replacementLines.join("\n"),
    };
  });
}

function buildFindings(cues: CaptionCue[], preset: CaptionPreset, runId: string, vocabularyTerms: string[], parserWarnings: ParserWarning[]): LintFinding[] {
  const findings: LintFinding[] = [];

  // Convert structural parser warnings to findings
  for (const warning of parserWarnings) {
    if (warning.code === "MALFORMED_CUE") {
      findings.push({
        id: `${runId}:STRUCT.MALFORMED_CUE:${warning.cueIndex ?? "x"}`,
        runId,
        ruleCode: "STRUCT.MALFORMED_CUE",
        category: "structure",
        severity: severityFor(preset, "STRUCT.MALFORMED_CUE"),
        cueIndex: warning.cueIndex,
        message: warning.message,
        details: { cueIndex: warning.cueIndex },
      });
    } else if (warning.code === "MALFORMED_TIMESTAMP") {
      findings.push({
        id: `${runId}:STRUCT.MISSING_TIMESTAMP:${warning.cueIndex ?? "x"}`,
        runId,
        ruleCode: "STRUCT.MISSING_TIMESTAMP",
        category: "structure",
        severity: severityFor(preset, "STRUCT.MISSING_TIMESTAMP"),
        cueIndex: warning.cueIndex,
        message: warning.message,
        details: { cueIndex: warning.cueIndex },
      });
    }
  }

  // Check for duplicate cue indexes
  findings.push(...checkDuplicateIndexes(cues, preset, runId));

  cues.forEach((cue, cuePosition) => {
    findings.push(...checkEmptyCue(cue, preset, runId));
    findings.push(...checkLineLength(cue, preset, runId));
    findings.push(...checkLineCount(cue, preset, runId));
    findings.push(...checkCharactersPerSecond(cue, preset, runId));
    findings.push(...checkDuration(cue, preset, runId));
    findings.push(...checkVocabulary(cue, preset, runId, vocabularyTerms));

    const nextCue = cues[cuePosition + 1];
    if (nextCue && cue.endMs > nextCue.startMs) {
      findings.push(makeFinding({
        runId,
        cue,
        ruleCode: "TIMING.OVERLAP",
        category: "timing",
        severity: severityFor(preset, "TIMING.OVERLAP"),
        message: `Cue overlaps the next cue by ${cue.endMs - nextCue.startMs}ms.`,
        details: { nextCueIndex: nextCue.index },
      }));
    }
  });

  if (findings.length === 0) {
    findings.push({
      id: `${runId}:PASS.ALL`,
      runId,
      ruleCode: "PASS.ALL",
      category: "preset",
      severity: "PASS",
      message: "No readability, timing, structure, or vocabulary issues found.",
    });
  }

  return findings;
}

function checkDuplicateIndexes(cues: CaptionCue[], preset: CaptionPreset, runId: string): LintFinding[] {
  const seen = new Map<number, number>();
  return cues.flatMap((cue, pos) => {
    if (seen.has(cue.index)) {
      return [makeFinding({
        runId,
        cue,
        ruleCode: "STRUCT.DUPLICATE_INDEX",
        category: "structure",
        severity: severityFor(preset, "STRUCT.DUPLICATE_INDEX"),
        message: `Cue index ${cue.index} appears more than once.`,
        details: { firstAt: seen.get(cue.index) },
      })];
    }
    seen.set(cue.index, pos);
    return [];
  });
}

function checkEmptyCue(cue: CaptionCue, preset: CaptionPreset, runId: string): LintFinding[] {
  if (cue.text.trim().length > 0) return [];
  return [makeFinding({ runId, cue, ruleCode: "STRUCT.EMPTY_TEXT", category: "structure", severity: severityFor(preset, "STRUCT.EMPTY_TEXT"), message: "Cue has no caption text." })];
}

function checkLineLength(cue: CaptionCue, preset: CaptionPreset, runId: string): LintFinding[] {
  return cue.lines.flatMap((line, lineIndex) => {
    const length = visibleLength(line);
    if (length <= preset.maxCharactersPerLine) return [];
    return [makeFinding({
      runId,
      cue,
      ruleCode: "READABILITY.CPL.MAX",
      category: "readability",
      severity: severityFor(preset, "READABILITY.CPL.MAX"),
      message: `Line ${lineIndex + 1} exceeds ${preset.label} line length (${length} > ${preset.maxCharactersPerLine}).`,
      details: { lineIndex: lineIndex + 1, actual: length, limit: preset.maxCharactersPerLine },
      suggestedFix: suggestLineRebalance(cue, preset),
    })];
  });
}

function checkLineCount(cue: CaptionCue, preset: CaptionPreset, runId: string): LintFinding[] {
  if (cue.lines.length <= preset.maxLinesPerCue) return [];
  return [makeFinding({
    runId,
    cue,
    ruleCode: "READABILITY.LINES.MAX",
    category: "readability",
    severity: severityFor(preset, "READABILITY.LINES.MAX"),
    message: `Cue has too many lines (${cue.lines.length} > ${preset.maxLinesPerCue}).`,
    details: { actual: cue.lines.length, limit: preset.maxLinesPerCue },
    suggestedFix: suggestLineRebalance(cue, preset),
  })];
}

function checkCharactersPerSecond(cue: CaptionCue, preset: CaptionPreset, runId: string): LintFinding[] {
  const durationSeconds = Math.max((cue.endMs - cue.startMs) / 1000, 0.001);
  const cps = visibleLength(cue.text) / durationSeconds;
  if (cps <= preset.maxCharactersPerSecond) return [];
  return [makeFinding({
    runId,
    cue,
    ruleCode: "READABILITY.CPS.MAX",
    category: "readability",
    severity: severityFor(preset, "READABILITY.CPS.MAX"),
    message: `Reading speed is too fast (${cps.toFixed(1)} cps > ${preset.maxCharactersPerSecond}).`,
    details: { actual: Number(cps.toFixed(1)), limit: preset.maxCharactersPerSecond },
  })];
}

function checkDuration(cue: CaptionCue, preset: CaptionPreset, runId: string): LintFinding[] {
  const duration = cue.endMs - cue.startMs;
  if (duration < preset.minCueDurationMs) {
    return [makeFinding({
      runId,
      cue,
      ruleCode: "TIMING.DURATION.MIN",
      category: "timing",
      severity: severityFor(preset, "TIMING.DURATION.MIN"),
      message: `Cue duration is too short (${duration}ms < ${preset.minCueDurationMs}ms).`,
      details: { actual: duration, limit: preset.minCueDurationMs },
    })];
  }
  if (duration > preset.maxCueDurationMs) {
    return [makeFinding({
      runId,
      cue,
      ruleCode: "TIMING.DURATION.MAX",
      category: "timing",
      severity: severityFor(preset, "TIMING.DURATION.MAX"),
      message: `Cue duration is too long (${duration}ms > ${preset.maxCueDurationMs}ms).`,
      details: { actual: duration, limit: preset.maxCueDurationMs },
    })];
  }
  return [];
}

function checkVocabulary(cue: CaptionCue, preset: CaptionPreset, runId: string, vocabularyTerms: string[]): LintFinding[] {
  return vocabularyTerms.flatMap((term) => {
    const normalizedTerm = normalizeTerm(term);
    if (normalizedTerm.length === 0) return [];

    const cueTextNormalized = normalizeTerm(cue.text);
    if (cueTextNormalized.includes(normalizedTerm)) return [];

    const compactLines = normalizeTerm(cue.lines.join(""));
    const hyphenCompactLines = normalizeTerm(cue.lines.join("").replace(/-/g, ""));
    const splitDetected = compactLines.includes(normalizedTerm) || hyphenCompactLines.includes(normalizedTerm);
    if (!splitDetected) return [];

    return [makeFinding({
      runId,
      cue,
      ruleCode: "VOCAB.SPLIT.PROTECTED",
      category: "vocabulary",
      severity: severityFor(preset, "VOCAB.SPLIT.PROTECTED"),
      message: `Protected term appears split across lines: ${term}.`,
      details: { term },
      suggestedFix: {
        label: "Keep term intact",
        description: `Rebalance this cue so ${term} stays on one line without changing spoken text.`,
        replacementLines: rebalanceProtectedTerm(cue, term, preset),
      },
    })];
  });
}

type FindingInput = Omit<LintFinding, "id" | "startMs" | "endMs" | "cueIndex"> & { cue?: CaptionCue };

function makeFinding(input: FindingInput): LintFinding {
  const cuePart = input.cue ? `cue-${input.cue.index}` : "run";
  return {
    ...input,
    id: `${input.runId}:${input.ruleCode}:${cuePart}`,
    cueIndex: input.cue?.index,
    startMs: input.cue?.startMs,
    endMs: input.cue?.endMs,
  };
}

function severityFor(preset: CaptionPreset, ruleCode: string): Severity {
  return preset.severityMap[ruleCode] ?? "WARN";
}

function visibleLength(value: string): number {
  return value.replace(/\s+/g, " ").trim().length;
}

function normalizeTerm(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "").trim();
}

function suggestLineRebalance(cue: CaptionCue, preset: CaptionPreset) {
  const words = cue.text.replace(/\s+/g, " ").trim().split(" ");
  if (words.length <= 1) return undefined;
  const lines = rebalanceWords(words, preset.maxLinesPerCue, preset.maxCharactersPerLine);
  if (!lines) return undefined;
  return {
    label: "Rebalance lines",
    description: "Adjust line breaks without changing caption text.",
    replacementLines: lines,
  };
}

function rebalanceProtectedTerm(cue: CaptionCue, term: string, preset: CaptionPreset): string[] | undefined {
  const rebuilt = mergeProtectedTerm(cue.text.replace(/\n/g, " "), term);
  const words = rebuilt.split(" ");
  return rebalanceWords(words, preset.maxLinesPerCue, preset.maxCharactersPerLine) ?? [rebuilt.replace(new RegExp(term, "i"), term)];
}

function mergeProtectedTerm(value: string, term: string): string {
  const normalizedTerm = normalizeTerm(term);
  const source = value.replace(/\s+/g, " ").trim();
  const compactChars: string[] = [];
  const sourceIndexes: number[] = [];

  Array.from(source).forEach((character, index) => {
    if (character === " " || character === "-") return;
    compactChars.push(character.toLowerCase());
    sourceIndexes.push(index);
  });

  const matchIndex = compactChars.join("").indexOf(normalizedTerm);
  if (matchIndex === -1) return source;

  const rawStart = sourceIndexes[matchIndex];
  const rawEnd = sourceIndexes[matchIndex + normalizedTerm.length - 1];
  if (rawStart === undefined || rawEnd === undefined) return source;

  return `${source.slice(0, rawStart)}${term}${source.slice(rawEnd + 1)}`.replace(/\s+/g, " ").trim();
}

function rebalanceWords(words: string[], maxLines: number, maxLength: number): string[] | undefined {
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    const next = current.length > 0 ? `${current} ${word}` : word;
    if (next.length <= maxLength || current.length === 0) {
      current = next;
      return;
    }
    lines.push(current);
    current = word;
  });
  if (current.length > 0) lines.push(current);
  return lines.length <= maxLines ? lines : undefined;
}

function stableRunId(cues: CaptionCue[], presetId: string, filename: string): string {
  const input = `${filename}:${presetId}:${cues.map((cue) => `${cue.index}:${cue.startMs}:${cue.endMs}:${cue.text}`).join("|")}`;
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return `run-${hash.toString(16)}`;
}
