import { describe, expect, it } from "vitest";
import { parseCaptionFile, serializeCaptionFile } from "../index.js";

describe("caption parser", () => {
  it("parses common SRT cues", () => {
    const result = parseCaptionFile(
      "sample.srt",
      `1\n00:00:01,000 --> 00:00:03,500\nHello world.\n\n2\n00:00:04,000 --> 00:00:05,000\nSecond line\nwraps here.`
    );

    expect(result.format).toBe("SRT");
    expect(result.warnings).toEqual([]);
    expect(result.cues).toHaveLength(2);
    expect(result.cues[0]).toMatchObject({ index: 1, startMs: 1000, endMs: 3500, lines: ["Hello world."] });
    expect(result.cues[1]?.lines).toEqual(["Second line", "wraps here."]);
  });

  it("parses WebVTT and skips header", () => {
    const result = parseCaptionFile(
      "sample.vtt",
      `WEBVTT\n\n00:00:01.000 --> 00:00:02.500\nHello VTT.\n\n00:00:03.000 --> 00:00:04.000\nSecond cue.`
    );

    expect(result.format).toBe("VTT");
    expect(result.warnings).toEqual([]);
    expect(result.cues.map((cue) => cue.index)).toEqual([1, 2]);
  });

  it("warns on malformed timestamps", () => {
    const result = parseCaptionFile("bad.srt", `1\n00:00:99,000 --> 00:00:01,000\nBad time.`);

    expect(result.cues).toHaveLength(0);
    expect(result.warnings[0]).toMatchObject({ code: "MALFORMED_TIMESTAMP", cueIndex: 1 });
  });

  it("serializes SRT with millisecond timestamps", () => {
    const result = parseCaptionFile("sample.srt", `1\n00:00:01,000 --> 00:00:02,000\nHello.`);

    expect(serializeCaptionFile(result.format, result.cues)).toBe("1\n00:00:01,000 --> 00:00:02,000\nHello.\n");
  });
});
