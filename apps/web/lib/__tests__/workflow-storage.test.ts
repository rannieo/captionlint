import { beforeEach, describe, expect, it } from "vitest";
import {
  prependHistoryRun,
  readCurrentRun,
  readHistoryRuns,
  readVocabularyTerms,
  writeCurrentRun,
  writeVocabularyTerms,
} from "../workflow-storage";
import type { StoredHistoryRun } from "../workflow-data";
import type { LintRun } from "@repo/shared-types";

function makeHistoryRun(id: string, rawContent = "1\n00:00:01,000 --> 00:00:02,000\nHello."): StoredHistoryRun {
  return {
    id,
    file: `${id}.srt`,
    presets: ["Default"],
    date: "2026-01-01 00:00:00",
    autoFixed: 0,
    pending: 0,
    pendingLabel: "0 Violations Found",
    status: "clean",
    downloadContent: "fixed content",
    rawContent,
    format: "SRT",
  };
}

function makeLintRun(): LintRun {
  return {
    id: "run-test-1",
    filename: "test.srt",
    format: "SRT",
    presetId: "default",
    engineVersion: "0.1.0",
    status: "PASSED",
    cues: [],
    findings: [],
    summary: { pass: 1, warn: 0, error: 0, total: 1 },
    createdAt: "2026-01-01T00:00:00.000Z",
    finishedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("currentRun storage", () => {
  beforeEach(() => localStorage.clear());

  it("returns undefined when nothing is stored", () => {
    expect(readCurrentRun()).toBeUndefined();
  });

  it("round-trips a stored run including run and exportContent", () => {
    const run = makeLintRun();
    writeCurrentRun({ run, exportContent: "fixed\ncaption" });
    const stored = readCurrentRun();
    expect(stored?.run.id).toBe("run-test-1");
    expect(stored?.exportContent).toBe("fixed\ncaption");
  });
});

describe("historyRuns storage", () => {
  beforeEach(() => localStorage.clear());

  it("returns empty array when nothing is stored", () => {
    expect(readHistoryRuns()).toEqual([]);
  });

  it("prependHistoryRun adds run to front", () => {
    prependHistoryRun(makeHistoryRun("a"));
    prependHistoryRun(makeHistoryRun("b"));
    const runs = readHistoryRuns();
    expect(runs[0]?.id).toBe("b");
    expect(runs[1]?.id).toBe("a");
  });

  it("prependHistoryRun deduplicates by id", () => {
    prependHistoryRun(makeHistoryRun("dup"));
    prependHistoryRun(makeHistoryRun("dup"));
    expect(readHistoryRuns()).toHaveLength(1);
  });

  it("prependHistoryRun preserves rawContent field", () => {
    const raw = "1\n00:00:01,000 --> 00:00:03,000\nOriginal content.";
    prependHistoryRun(makeHistoryRun("x", raw));
    const runs = readHistoryRuns();
    expect(runs[0]?.rawContent).toBe(raw);
  });

  it("caps list at 25 items", () => {
    for (let i = 0; i < 27; i++) {
      prependHistoryRun(makeHistoryRun(`run-${i}`));
    }
    expect(readHistoryRuns()).toHaveLength(25);
  });
});

describe("vocabularyTerms storage", () => {
  beforeEach(() => localStorage.clear());

  it("returns undefined when nothing is stored", () => {
    expect(readVocabularyTerms()).toBeUndefined();
  });

  it("round-trips written terms", () => {
    writeVocabularyTerms(["ChatGPT", "OpenAI"]);
    expect(readVocabularyTerms()).toEqual(["ChatGPT", "OpenAI"]);
  });

  it("overwrites previous terms on second write", () => {
    writeVocabularyTerms(["First"]);
    writeVocabularyTerms(["Second", "Third"]);
    expect(readVocabularyTerms()).toEqual(["Second", "Third"]);
  });
});
