import { captionPresets } from "@repo/config";
import type { CaptionCue } from "@repo/shared-types";
import { describe, expect, it } from "vitest";
import { applySafeFixes, lintCaptions } from "../index.js";

function cue(overrides: Partial<CaptionCue>): CaptionCue {
  return {
    index: 1,
    startMs: 0,
    endMs: 2500,
    text: "Readable caption.",
    lines: ["Readable caption."],
    ...overrides,
  };
}

describe("lint engine", () => {
  it("returns a deterministic pass finding for clean captions", () => {
    const run = lintCaptions([cue({})], {
      filename: "clean.srt",
      presetId: "default",
      now: "2026-01-01T00:00:00.000Z",
    });

    expect(run.summary).toMatchObject({ pass: 1, warn: 0, error: 0, total: 1 });
    expect(run.findings[0]?.ruleCode).toBe("PASS.ALL");
  });

  it("detects line length and CPS issues", () => {
    const text = "This caption line is intentionally too long for a compact social preset.";
    const run = lintCaptions([cue({ endMs: 1000, text, lines: [text] })], {
      presetId: "tiktok",
      now: "2026-01-01T00:00:00.000Z",
    });

    expect(run.findings.map((finding) => finding.ruleCode)).toContain("READABILITY.CPL.MAX");
    expect(run.findings.map((finding) => finding.ruleCode)).toContain("READABILITY.CPS.MAX");
  });

  it("detects overlapping cues", () => {
    const run = lintCaptions(
      [cue({ index: 1, startMs: 0, endMs: 2000 }), cue({ index: 2, startMs: 1500, endMs: 3000 })],
      { presetId: "default", now: "2026-01-01T00:00:00.000Z" }
    );

    expect(run.findings.find((finding) => finding.ruleCode === "TIMING.OVERLAP")?.severity).toBe("ERROR");
  });

  it("detects protected terms split across lines and applies a safe line fix", () => {
    const run = lintCaptions(
      [cue({ text: "We use ChatG-\nPT every day.", lines: ["We use ChatG-", "PT every day."] })],
      { presetId: "default", vocabularyTerms: ["ChatGPT"], now: "2026-01-01T00:00:00.000Z" }
    );

    const finding = run.findings.find((item) => item.ruleCode === "VOCAB.SPLIT.PROTECTED");
    expect(finding?.severity).toBe("ERROR");
    expect(applySafeFixes(run.cues, run.findings)[0]?.text).toContain("ChatGPT");
  });

  it("keeps preset configuration testable", () => {
    expect(captionPresets.map((preset) => preset.id)).toEqual(["default", "tiktok", "instagram", "youtube-shorts"]);
    expect(captionPresets.every((preset) => preset.maxLinesPerCue > 0)).toBe(true);
  });
});
