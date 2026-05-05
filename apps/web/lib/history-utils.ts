import type { HistoryRun } from "./history-data";

export function mergeAndSortRuns(
  browserRuns: HistoryRun[],
  seedRuns: HistoryRun[],
  limit?: number,
): HistoryRun[] {
  const seen = new Set<string>();
  const merged = [...browserRuns, ...seedRuns].filter((run) => {
    if (seen.has(run.id)) return false;
    seen.add(run.id);
    return true;
  });

  const sorted = merged.sort((a, b) => {
    if (a.isDemo === b.isDemo) return 0;
    return a.isDemo ? 1 : -1;
  });

  return limit !== undefined ? sorted.slice(0, limit) : sorted;
}
