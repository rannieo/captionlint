import type { HistoryItem } from "@repo/api-client";

export const FREE_PLAN = {
  minutesPerMonth: Number(process.env.NEXT_PUBLIC_FREE_PLAN_MINUTES ?? 100),
  rulesetTerms: Number(process.env.NEXT_PUBLIC_FREE_PLAN_RULESETS ?? 5),
  seats: Number(process.env.NEXT_PUBLIC_FREE_PLAN_SEATS ?? 1),
  // Avg seconds of video each caption cue represents — used to estimate duration
  secsPerCue: Number(process.env.NEXT_PUBLIC_SECS_PER_CUE ?? 5),
  // Fallback when cue count isn't available (local browser runs)
  avgMinutesPerRun: Number(process.env.NEXT_PUBLIC_AVG_MINUTES_PER_RUN ?? 10),
} as const;

export function getMonthStart(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function estimateMinutesFromCues(totalCues: number): number {
  return (totalCues * FREE_PLAN.secsPerCue) / 60;
}

export function sumMonthlyMinutes(items: HistoryItem[]): number {
  const monthStart = getMonthStart().getTime();
  return items
    .filter((item) => new Date(item.createdAt).getTime() >= monthStart)
    .reduce((sum, item) => sum + estimateMinutesFromCues(item.summary.total), 0);
}
