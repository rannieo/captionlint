"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";
import { listHistory, listVocabularyTerms, type HistoryItem } from "@repo/api-client";

const PRESET_LABELS: Record<string, string> = {
  default: "Default",
  tiktok: "TikTok",
  instagram: "Instagram",
  "youtube-shorts": "YouTube Shorts",
};

const statusConfig = {
  review: { label: "Needs Review", className: "h-auto rounded-full border-[#f59e0b33] bg-[#f59e0b1a] px-2.5 py-0.5 text-[11px] font-semibold text-[#f59e0b]" },
  fixed: { label: "Fixed", className: "h-auto rounded-full border-[#22c55e33] bg-[#22c55e1a] px-2.5 py-0.5 text-[11px] font-semibold text-[#22c55e]" },
  clean: { label: "Clean", className: "h-auto rounded-full border-[#1F2937] bg-[#111827] px-2.5 py-0.5 text-[11px] font-semibold text-zinc-400" },
} as const;

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getItemStatus(item: HistoryItem): "review" | "fixed" | "clean" {
  if (item.summary.error > 0) return "review";
  if (item.summary.warn > 0) return "fixed";
  return "clean";
}

function isInLastNDays(dateStr: string, n: number): boolean {
  const d = new Date(dateStr).getTime();
  if (Number.isNaN(d)) return false;
  return d >= Date.now() - n * 86_400_000;
}

function getDayLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export function DashboardClient() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [orgId, setOrgId] = useState<string | undefined>();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [vocabCount, setVocabCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    authClient.organization.list().then((result) => {
      const id = result.data?.[0]?.id;
      if (id) setOrgId(id);
    }).catch(() => {});
  }, [session?.user]);

  useEffect(() => {
    if (!orgId) return;
    setIsLoading(true);
    Promise.all([
      listHistory(orgId),
      listVocabularyTerms(orgId),
    ])
      .then(([historyItems, vocabTerms]) => {
        setItems(historyItems);
        setVocabCount(vocabTerms.length);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [orgId]);

  // Compute last 7 days activity
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const activityByDay = last7Days.map((day) => {
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    const runs = items.filter((item) => {
      const t = new Date(item.createdAt).getTime();
      return t >= day.getTime() && t < nextDay.getTime();
    }).length;
    return { day: getDayLabel(day), runs };
  });

  const totalLast7 = activityByDay.reduce((sum, d) => sum + d.runs, 0);
  const maxRuns = Math.max(...activityByDay.map((d) => d.runs), 1);

  // KPI: this week vs prior week
  const thisWeekRuns = items.filter((i) => isInLastNDays(i.createdAt, 7)).length;
  const priorWeekRuns = items.filter((i) => {
    const t = new Date(i.createdAt).getTime();
    const ago14 = Date.now() - 14 * 86_400_000;
    const ago7 = Date.now() - 7 * 86_400_000;
    return t >= ago14 && t < ago7;
  }).length;
  const runsTrend = thisWeekRuns - priorWeekRuns;

  const totalIssues = items.reduce((sum, i) => sum + i.summary.warn + i.summary.error, 0);
  const priorIssues = items
    .filter((i) => {
      const t = new Date(i.createdAt).getTime();
      return t >= Date.now() - 14 * 86_400_000 && t < Date.now() - 7 * 86_400_000;
    })
    .reduce((sum, i) => sum + i.summary.warn + i.summary.error, 0);
  const issuesTrend = totalIssues - priorIssues;

  const kpiCards = [
    {
      label: "Lint Runs This Week",
      value: String(thisWeekRuns),
      trend: runsTrend >= 0 ? `+${runsTrend}` : String(runsTrend),
      trendLabel: "from last week",
      up: runsTrend >= 0,
    },
    {
      label: "Issues Found",
      value: String(totalIssues),
      trend: issuesTrend >= 0 ? `+${issuesTrend}` : String(issuesTrend),
      trendLabel: "from last week",
      up: issuesTrend <= 0,
    },
    {
      label: "Files Processed",
      value: String(items.length),
      trend: `+${thisWeekRuns}`,
      trendLabel: "this week",
      up: true,
    },
    {
      label: "Vocabulary Terms",
      value: String(vocabCount),
      trend: "—",
      trendLabel: "managed terms",
      up: true,
    },
  ];

  const recentRuns = items.slice(0, 5);

  if (!session?.user) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-zinc-500">
        Sign in to see your dashboard.
      </div>
    );
  }

  return (
    <>
      {/* KPI stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <Card key={card.label} className="border border-[#1F2937] ring-0 p-5">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              {card.label}
            </p>
            <p className="mb-2 font-mono text-3xl font-bold tabular-nums text-zinc-100">
              {isLoading ? "—" : card.value}
            </p>
            <p className="flex items-center gap-1.5 text-xs">
              <span className={card.up ? "font-semibold text-[#22C55E]" : "font-semibold text-[#EF4444]"}>
                {isLoading ? "—" : card.trend}
              </span>
              <span className="text-zinc-500">{card.trendLabel}</span>
            </p>
          </Card>
        ))}
      </div>

      {/* Lint activity chart */}
      <Card className="mb-8 border border-[#1F2937] ring-0">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-100">Lint Activity</h2>
              <p className="mt-0.5 text-xs text-zinc-500">Runs per day — past 7 days</p>
            </div>
            <span className="font-mono text-2xl font-bold tabular-nums text-zinc-100">
              {isLoading ? "—" : totalLast7}
            </span>
          </div>
          <div className="flex h-40 items-end gap-2">
            {activityByDay.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <span className="font-mono text-[10px] text-zinc-500">{isLoading ? "" : d.runs}</span>
                <div className="flex w-full flex-col justify-end rounded-sm bg-[#1F2937]" style={{ height: "120px" }}>
                  <div
                    className="w-full rounded-sm bg-[#22C55E] transition-all"
                    style={{ height: isLoading ? "0%" : `${(d.runs / maxRuns) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-zinc-500">{d.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent runs */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-100">Recent Runs</h2>
          <Button
            variant="link"
            size="sm"
            className="px-0 text-zinc-400 hover:text-zinc-100"
            onClick={() => router.push("/history")}
          >
            View all <span data-icon="inline-end">→</span>
          </Button>
        </div>
        {recentRuns.length === 0 && !isLoading ? (
          <div className="flex min-h-[80px] items-center justify-center rounded-lg border border-[#1F2937] bg-[#111827] text-sm text-zinc-500">
            No runs yet. Upload a file to get started.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-[#1F2937] bg-[#111827]">
            <Table>
              <TableHeader className="bg-[#1F2937]">
                <TableRow className="border-b border-[#1F2937] hover:bg-transparent">
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Filename</TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Preset</TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Date</TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Issues</TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Status</TableHead>
                  <TableHead className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRuns.map((item) => {
                  const st = statusConfig[getItemStatus(item)];
                  return (
                    <TableRow key={item.id} className="border-b border-[#1F2937] last:border-0 hover:bg-[#0B0F14]">
                      <TableCell className="px-4 py-3 font-mono text-sm text-zinc-100">{item.filename}</TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge variant="outline" className="h-auto rounded border-transparent bg-[#1F2937] px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                          {PRESET_LABELS[item.preset] ?? item.preset}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-mono text-xs text-zinc-400">{formatDate(item.createdAt)}</TableCell>
                      <TableCell className="px-4 py-3 font-mono text-sm text-zinc-100">{item.summary.warn + item.summary.error}</TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge variant="outline" className={st.className}>{st.label}</Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <Button
                          variant="link"
                          size="xs"
                          className="px-0 text-zinc-400 hover:text-zinc-100"
                          onClick={() => router.push(`/results/${item.lintRunId}`)}
                        >
                          View <span data-icon="inline-end">→</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
