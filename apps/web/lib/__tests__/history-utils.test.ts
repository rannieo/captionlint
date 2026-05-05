import { describe, expect, it } from "vitest";
import { mergeAndSortRuns } from "../history-utils";
import type { HistoryRun } from "../history-data";

function run(overrides: Partial<HistoryRun> & { id: string }): HistoryRun {
  return {
    file: `${overrides.id}.srt`,
    presets: ["Default"],
    date: "2026-01-01 00:00:00",
    autoFixed: 0,
    pending: 0,
    pendingLabel: "0 Violations Found",
    status: "clean",
    ...overrides,
  };
}

describe("mergeAndSortRuns", () => {
  it("real runs appear before demo runs regardless of insertion order", () => {
    const result = mergeAndSortRuns(
      [run({ id: "browser-1" })],
      [run({ id: "seed-1", isDemo: true })],
    );
    expect(result[0]?.id).toBe("browser-1");
    expect(result[1]?.id).toBe("seed-1");
  });

  it("demo runs stay last even when passed as browserRuns", () => {
    const result = mergeAndSortRuns(
      [run({ id: "demo-a", isDemo: true }), run({ id: "real-b" })],
      [],
    );
    expect(result[0]?.id).toBe("real-b");
    expect(result[1]?.id).toBe("demo-a");
  });

  it("deduplicates by id — browser run wins over seed run", () => {
    const browserVersion = run({ id: "run-001", file: "real.srt" });
    const seedVersion = run({ id: "run-001", file: "seed.srt", isDemo: true });
    const result = mergeAndSortRuns([browserVersion], [seedVersion]);
    expect(result).toHaveLength(1);
    expect(result[0]?.file).toBe("real.srt");
  });

  it("applies limit via slice", () => {
    const seeds = [1, 2, 3, 4].map((n) => run({ id: `seed-${n}`, isDemo: true }));
    const result = mergeAndSortRuns([], seeds, 2);
    expect(result).toHaveLength(2);
  });

  it("returns all runs when limit is omitted", () => {
    const seeds = [1, 2, 3].map((n) => run({ id: `s${n}`, isDemo: true }));
    expect(mergeAndSortRuns([], seeds)).toHaveLength(3);
  });

  it("returns empty array when both inputs are empty", () => {
    expect(mergeAndSortRuns([], [])).toEqual([]);
  });
});
