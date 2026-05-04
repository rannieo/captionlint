import { parseCaptionFile, serializeCaptionFile } from "@repo/caption-parser";
import { defaultVocabularyTerms, getCaptionPreset } from "@repo/config";
import { applySafeFixes, lintCaptions } from "@repo/lint-engine";
import type { CaptionFormat, LintRun, PresetId } from "@repo/shared-types";

export const workflowStorageKeys = {
  currentRun: "captionlint.currentRun",
  historyRuns: "captionlint.historyRuns",
  vocabularyTerms: "captionlint.vocabularyTerms",
} as const;

export type StoredHistoryRun = {
  id: string;
  file: string;
  presets: string[];
  date: string;
  autoFixed: number;
  pending: number;
  pendingLabel: string;
  status: "clean" | "fixed" | "review";
  downloadContent: string;
  format: CaptionFormat;
};

export const demoCaption = `1
00:00:01,000 --> 00:00:03,000
Welcome to CaptionLint.

2
00:00:03,200 --> 00:00:04,000
This caption line is intentionally too long for a compact social preset.

3
00:00:04,500 --> 00:00:06,500
We use ChatG-
PT every day.

4
00:00:06,000 --> 00:00:07,800
This cue overlaps the previous cue.`;

export function createLintRunFromContent(input: {
  filename: string;
  content: string;
  presetId: PresetId;
  vocabularyTerms?: string[];
  now?: string;
}): { run?: LintRun; exportContent?: string; error?: string } {
  const parseResult = parseCaptionFile(input.filename, input.content);
  if (parseResult.warnings.some((warning) => warning.code === "UNSUPPORTED_FORMAT")) {
    return { error: "CaptionLint supports .srt and .vtt files for MVP QA." };
  }
  if (parseResult.cues.length === 0) {
    return { error: parseResult.warnings[0]?.message ?? "No valid caption cues were found." };
  }

  const preset = getCaptionPreset(input.presetId);
  const run = lintCaptions(parseResult.cues, {
    filename: input.filename,
    format: parseResult.format,
    preset,
    vocabularyTerms: input.vocabularyTerms ?? defaultVocabularyTerms,
    now: input.now,
  });
  const fixedCues = applySafeFixes(run.cues, run.findings);
  const exportContent = serializeCaptionFile(run.format, fixedCues);
  return { run, exportContent };
}

export function createDemoLintRun(): { run: LintRun; exportContent: string } {
  const result = createLintRunFromContent({
    filename: "demo-captionlint.srt",
    content: demoCaption,
    presetId: "youtube-shorts",
    vocabularyTerms: defaultVocabularyTerms,
    now: "2026-05-04T00:00:00.000Z",
  });

  if (!result.run || !result.exportContent) {
    throw new Error(result.error ?? "Unable to create demo lint run.");
  }

  return { run: result.run, exportContent: result.exportContent };
}

export function toStoredHistoryRun(run: LintRun, exportContent: string): StoredHistoryRun {
  const pending = run.summary.warn + run.summary.error;
  return {
    id: run.id,
    file: run.filename,
    presets: [getCaptionPreset(run.presetId).label],
    date: run.finishedAt?.replace("T", " ").slice(0, 19) ?? run.createdAt.replace("T", " ").slice(0, 19),
    autoFixed: run.findings.filter((finding) => finding.suggestedFix?.replacementLines).length,
    pending,
    pendingLabel: pending === 0 ? "0 Violations Found" : `${pending} Pending Review`,
    status: run.summary.error > 0 ? "review" : run.summary.warn > 0 ? "fixed" : "clean",
    downloadContent: exportContent,
    format: run.format,
  };
}

export function exportFilename(filename: string, presetId: PresetId, format: CaptionFormat): string {
  const suffix = format.toLowerCase();
  const base = filename.replace(/\.(srt|vtt)$/i, "");
  return `${base}.captionlint.${presetId}.${suffix}`;
}
