import type { Metadata } from "next";
import Link from "next/link";
import { WorkspaceShell } from "../_components/workspace-shell";
import { WorkspaceTopbar } from "../_components/workspace-topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecentRunsTable } from "./recent-runs-table";

export const metadata: Metadata = {
  title: "CaptionLint | Dashboard",
  description: "Overview of your recent lint runs and caption QA activity.",
};

const kpiCards = [
  { label: "Lint Runs This Week", value: "12", trend: "+3", trendLabel: "from last week", up: true },
  { label: "Issues Resolved", value: "84", trend: "+21", trendLabel: "from last week", up: true },
  { label: "Files Processed", value: "7", trend: "-2", trendLabel: "from last week", up: false },
  { label: "Vocabulary Terms", value: "24", trend: "+4", trendLabel: "added this week", up: true },
];

const lintActivity = [
  { day: "Mon", runs: 2 },
  { day: "Tue", runs: 5 },
  { day: "Wed", runs: 3 },
  { day: "Thu", runs: 7 },
  { day: "Fri", runs: 4 },
  { day: "Sat", runs: 1 },
  { day: "Sun", runs: 3 },
];
const maxRuns = Math.max(...lintActivity.map((d) => d.runs));


export default function DashboardPage() {
  return (
    <WorkspaceShell>
      <WorkspaceTopbar
        left={<span className="text-sm font-semibold text-zinc-100">Dashboard</span>}
        showShare={false}
        showExport={false}
      />

      <div className="min-h-screen bg-[#0B0F14] px-4 pb-16 pt-20 md:px-6">
        <div className="mx-auto w-full max-w-6xl">

          {/* Page header */}
          <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-100">Dashboard</h1>
              <p className="text-sm text-zinc-400">Caption QA activity for your workspace.</p>
            </div>
            <Button
              size="lg"
              className="shrink-0"
              render={<Link href="/upload" />}
              nativeButton={false}
            >
              New Lint Run <span data-icon="inline-end">→</span>
            </Button>
          </div>

          {/* KPI stat cards */}
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {kpiCards.map((card) => (
              <Card key={card.label} className="border border-[#1F2937] ring-0 p-5">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  {card.label}
                </p>
                <p className="mb-2 font-mono text-3xl font-bold tabular-nums text-zinc-100">
                  {card.value}
                </p>
                <p className="flex items-center gap-1.5 text-xs">
                  <span className={card.up ? "font-semibold text-[#22C55E]" : "font-semibold text-[#EF4444]"}>
                    {card.trend}
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
                <span className="font-mono text-2xl font-bold tabular-nums text-zinc-100">25</span>
              </div>
              <div className="flex h-40 items-end gap-2">
                {lintActivity.map((d) => (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                    <span className="font-mono text-[10px] text-zinc-500">{d.runs}</span>
                    <div className="flex w-full flex-col justify-end rounded-sm bg-[#1F2937]" style={{ height: "120px" }}>
                      <div
                        className="w-full rounded-sm bg-[#22C55E] transition-all"
                        style={{ height: `${(d.runs / maxRuns) * 100}%` }}
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
                render={<Link href="/history" />}
                nativeButton={false}
              >
                View all <span data-icon="inline-end">→</span>
              </Button>
            </div>
            <RecentRunsTable />
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="border border-[#1F2937] ring-0">
              <CardContent className="p-6">
                <div className="mb-3 flex size-9 items-center justify-center rounded-md border border-[#1F2937] bg-[#0B0F14] text-base">↑</div>
                <h3 className="mb-1 text-sm font-semibold text-zinc-100">New Lint Run</h3>
                <p className="mb-4 text-xs text-zinc-400">Upload an SRT or VTT file and run caption QA checks.</p>
                <Button size="sm" render={<Link href="/upload" />} nativeButton={false}>
                  Upload File
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-[#1F2937] ring-0">
              <CardContent className="p-6">
                <div className="mb-3 flex size-9 items-center justify-center rounded-md border border-[#1F2937] bg-[#0B0F14] text-base">⊟</div>
                <h3 className="mb-1 text-sm font-semibold text-zinc-100">Vocabulary Rules</h3>
                <p className="mb-4 text-xs text-zinc-400">Protect brand names and technical terms from awkward line breaks.</p>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href="/rulesets" />}
                  nativeButton={false}
                >
                  Manage Terms
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-[#1F2937] ring-0">
              <CardContent className="p-6">
                <div className="mb-3 flex size-9 items-center justify-center rounded-md border border-[#1F2937] bg-[#0B0F14] text-base">↺</div>
                <h3 className="mb-1 text-sm font-semibold text-zinc-100">Re-fix from History</h3>
                <p className="mb-4 text-xs text-zinc-400">Apply a different platform preset to a previous caption run.</p>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href="/history" />}
                  nativeButton={false}
                >
                  Open History
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </WorkspaceShell>
  );
}
