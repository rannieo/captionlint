import { describe, expect, it } from "vitest";
import { createLintRunFromContent, exportFilename, normalizePresetId, sourceCaptionFilename, toStoredHistoryRun } from "../workflow-data";

const VALID_SRT = `1
00:00:01,000 --> 00:00:03,000
Hello world.

2
00:00:03,500 --> 00:00:05,000
Second cue here.`;

const SPLIT_TERM_SRT = `1
00:00:01,000 --> 00:00:03,000
We use ChatG-
PT every day.`;

describe("createLintRunFromContent", () => {
  it("returns error for unsupported file type", () => {
    const result = createLintRunFromContent({ filename: "video.mp4", content: "garbage", presetId: "default" });
    expect(result.error).toBeTruthy();
    expect(result.run).toBeUndefined();
  });

  it("returns error when no valid cues found", () => {
    const result = createLintRunFromContent({ filename: "empty.srt", content: "not a caption file", presetId: "default" });
    expect(result.error).toBeTruthy();
    expect(result.run).toBeUndefined();
  });

  it("returns run and exportContent for valid SRT", () => {
    const result = createLintRunFromContent({ filename: "sample.srt", content: VALID_SRT, presetId: "default" });
    expect(result.run).toBeDefined();
    expect(result.exportContent).toBeDefined();
    expect(result.error).toBeUndefined();
    expect(result.run?.filename).toBe("sample.srt");
  });

  it("strips prior CaptionLint export suffixes from the run filename", () => {
    const result = createLintRunFromContent({
      filename: "demo-captionlint.captionlint.youtube-shorts.captionlint.instagram.srt",
      content: VALID_SRT,
      presetId: "default",
    });
    expect(result.run?.filename).toBe("demo-captionlint.srt");
  });

  it("is deterministic for a fixed now timestamp", () => {
    const opts = { filename: "f.srt", content: VALID_SRT, presetId: "default" as const, now: "2026-01-01T00:00:00.000Z" };
    const r1 = createLintRunFromContent(opts);
    const r2 = createLintRunFromContent(opts);
    expect(r1.run?.id).toBe(r2.run?.id);
    expect(r1.run?.findings).toEqual(r2.run?.findings);
  });

  it("detects VOCAB.SPLIT.PROTECTED with provided vocabularyTerms", () => {
    const result = createLintRunFromContent({
      filename: "split.srt",
      content: SPLIT_TERM_SRT,
      presetId: "default",
      vocabularyTerms: ["ChatGPT"],
    });
    const codes = result.run?.findings.map((f) => f.ruleCode) ?? [];
    expect(codes).toContain("VOCAB.SPLIT.PROTECTED");
  });

  it("uses defaultVocabularyTerms when vocabularyTerms is omitted", () => {
    const srt = `1\n00:00:01,000 --> 00:00:03,000\nOpenA-\nI is here.`;
    const result = createLintRunFromContent({ filename: "t.srt", content: srt, presetId: "default" });
    const codes = result.run?.findings.map((f) => f.ruleCode) ?? [];
    expect(codes).toContain("VOCAB.SPLIT.PROTECTED");
  });
});

describe("toStoredHistoryRun", () => {
  it("stores rawContent from the third param", () => {
    const result = createLintRunFromContent({ filename: "sample.srt", content: VALID_SRT, presetId: "default", now: "2026-01-01T00:00:00.000Z" });
    const stored = toStoredHistoryRun(result.run!, result.exportContent!, VALID_SRT);
    expect(stored.rawContent).toBe(VALID_SRT);
  });

  it("sets status=clean when no warn or error findings", () => {
    const result = createLintRunFromContent({ filename: "clean.srt", content: VALID_SRT, presetId: "default", now: "2026-01-01T00:00:00.000Z" });
    const stored = toStoredHistoryRun(result.run!, result.exportContent!, VALID_SRT);
    expect(stored.status).toBe("clean");
  });

  it("sets status=review when summary.error > 0", () => {
    const result = createLintRunFromContent({ filename: "err.srt", content: SPLIT_TERM_SRT, presetId: "default", vocabularyTerms: ["ChatGPT"], now: "2026-01-01T00:00:00.000Z" });
    const stored = toStoredHistoryRun(result.run!, result.exportContent!, SPLIT_TERM_SRT);
    expect(stored.status).toBe("review");
  });

  it("formats date from finishedAt", () => {
    const result = createLintRunFromContent({ filename: "f.srt", content: VALID_SRT, presetId: "default", now: "2026-05-01T14:30:00.000Z" });
    const stored = toStoredHistoryRun(result.run!, result.exportContent!, VALID_SRT);
    expect(stored.date).toBe("2026-05-01 14:30:00");
  });
});

describe("exportFilename", () => {
  it("produces base.captionlint.presetId.srt for SRT files", () => {
    expect(exportFilename("my-video.srt", "tiktok", "SRT")).toBe("my-video.captionlint.tiktok.srt");
  });

  it("produces base.captionlint.presetId.vtt for VTT files", () => {
    expect(exportFilename("sub.vtt", "instagram", "VTT")).toBe("sub.captionlint.instagram.vtt");
  });

  it("does not stack CaptionLint suffixes across repeated exports", () => {
    expect(
      exportFilename(
        "demo-captionlint.captionlint.youtube-shorts.captionlint.instagram.captionlint.default.srt",
        "default",
        "SRT",
      ),
    ).toBe("demo-captionlint.captionlint.default.srt");
  });
});

describe("sourceCaptionFilename", () => {
  it("preserves a source basename that includes captionlint", () => {
    expect(sourceCaptionFilename("demo-captionlint.captionlint.youtube-shorts.srt")).toBe("demo-captionlint.srt");
  });
});

describe("normalizePresetId", () => {
  it("accepts stored labels from old local history runs", () => {
    expect(normalizePresetId("YouTube Shorts")).toBe("youtube-shorts");
  });
});
