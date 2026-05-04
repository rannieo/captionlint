import type { Metadata } from "next";
import Link from "next/link";
import { WorkspaceShell } from "../_components/workspace-shell";
import { WorkspaceTopbar } from "../_components/workspace-topbar";
import { historyRuns } from "../../lib/history-data";

export const metadata: Metadata = {
  title: "CaptionLint | Dashboard",
  description: "Overview of your recent lint runs and caption QA activity.",
};

const kpiCards = [
  {
    label: "Lint Runs This Week",
    value: "12",
    trend: "+3",
    trendLabel: "from last week",
    up: true,
  },
  {
    label: "Issues Resolved",
    value: "84",
    trend: "+21",
    trendLabel: "from last week",
    up: true,
  },
  {
    label: "Files Processed",
    value: "7",
    trend: "-2",
    trendLabel: "from last week",
    up: false,
  },
  {
    label: "Vocabulary Terms",
    value: "24",
    trend: "+4",
    trendLabel: "added this week",
    up: true,
  },
];

export default function DashboardPage() {
  return (
    <WorkspaceShell>
      <WorkspaceTopbar
        left={<span className="text-sm font-semibold text-zinc-100">Dashboard</span>}
      />

      <div className="min-h-screen bg-[#0B0F14] px-6 pb-16 pt-20">
        <div className="mx-auto w-full max-w-6xl">

          {/* Page header */}
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-100">
                Dashboard
              </h1>
              <p className="text-sm text-zinc-400">
                Caption QA activity for your workspace.
              </p>
            </div>
            <Link
              href="/upload"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-[#22C55E] px-4 text-sm font-medium text-[#003915] hover:bg-[#4BE277]"
            >
              New Lint Run <span aria-hidden>→</span>
            </Link>
          </div>

          {/* KPI stat cards */}
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {kpiCards.map((card) => (
              <div
                key={card.label}
                className="rounded-lg border border-[#1F2937] bg-[#111827] p-5"
              >
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  {card.label}
                </p>
                <p className="mb-2 font-mono text-3xl font-bold tabular-nums text-zinc-100">
                  {card.value}
                </p>
                <p className="flex items-center gap-1.5 text-xs">
                  <span
                    className={
                      card.up
                        ? "font-semibold text-[#22C55E]"
                        : "font-semibold text-[#EF4444]"
                    }
                  >
                    {card.trend}
                  </span>
                  <span className="text-zinc-500">{card.trendLabel}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Recent runs */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-100">Recent Runs</h2>
              <Link
                href="/history"
                className="text-xs text-zinc-400 hover:text-zinc-100"
              >
                View all →
              </Link>
            </div>
            <div className="overflow-hidden rounded-lg border border-[#1F2937] bg-[#111827]">
              <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#1F2937]">
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Filename
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Preset
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Date
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Fixed
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {historyRuns.map((run) => {
                    const statusConfig = {
                      fixed: {
                        label: "Fixed",
                        className:
                          "inline-flex rounded-full border border-[#22c55e33] bg-[#22c55e1a] px-2.5 py-0.5 text-[11px] font-semibold text-[#22c55e]",
                      },
                      review: {
                        label: "Needs Review",
                        className:
                          "inline-flex rounded-full border border-[#f59e0b33] bg-[#f59e0b1a] px-2.5 py-0.5 text-[11px] font-semibold text-[#f59e0b]",
                      },
                      clean: {
                        label: "Clean",
                        className:
                          "inline-flex rounded-full border border-[#1F2937] bg-[#111827] px-2.5 py-0.5 text-[11px] font-semibold text-zinc-400",
                      },
                    } as const;
                    const status = statusConfig[run.status];
                    return (
                      <tr
                        key={run.file}
                        className="border-b border-[#1F2937] last:border-0 hover:bg-[#0B0F14]"
                      >
                        <td className="px-4 py-3 font-mono text-sm text-zinc-100">
                          {run.file}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {run.presets.map((preset) => (
                              <span
                                key={preset}
                                className="rounded bg-[#1F2937] px-2 py-0.5 text-[10px] font-semibold text-zinc-300"
                              >
                                {preset}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                          {run.date}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-zinc-100">
                          {run.autoFixed}
                        </td>
                        <td className="px-4 py-3">
                          <span className={status.className}>{status.label}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href="/results"
                            className="text-xs text-zinc-400 hover:text-zinc-100"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-6">
              <div className="mb-3 flex size-9 items-center justify-center rounded-md border border-[#1F2937] bg-[#0B0F14] text-base">
                ↑
              </div>
              <h3 className="mb-1 text-sm font-semibold text-zinc-100">
                New Lint Run
              </h3>
              <p className="mb-4 text-xs text-zinc-400">
                Upload an SRT or VTT file and run caption QA checks.
              </p>
              <Link
                href="/upload"
                className="inline-flex h-8 items-center rounded-md bg-[#22C55E] px-3 text-xs font-medium text-[#003915] hover:bg-[#4BE277]"
              >
                Upload File
              </Link>
            </div>

            <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-6">
              <div className="mb-3 flex size-9 items-center justify-center rounded-md border border-[#1F2937] bg-[#0B0F14] text-base">
                ⊟
              </div>
              <h3 className="mb-1 text-sm font-semibold text-zinc-100">
                Vocabulary Rules
              </h3>
              <p className="mb-4 text-xs text-zinc-400">
                Protect brand names and technical terms from awkward line breaks.
              </p>
              <Link
                href="/rulesets"
                className="inline-flex h-8 items-center rounded-md border border-[#1F2937] bg-[#0B0F14] px-3 text-xs font-medium text-zinc-100 hover:bg-[#1F2937]"
              >
                Manage Terms
              </Link>
            </div>

            <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-6">
              <div className="mb-3 flex size-9 items-center justify-center rounded-md border border-[#1F2937] bg-[#0B0F14] text-base">
                ↺
              </div>
              <h3 className="mb-1 text-sm font-semibold text-zinc-100">
                Re-fix from History
              </h3>
              <p className="mb-4 text-xs text-zinc-400">
                Apply a different platform preset to a previous caption run.
              </p>
              <Link
                href="/history"
                className="inline-flex h-8 items-center rounded-md border border-[#1F2937] bg-[#0B0F14] px-3 text-xs font-medium text-zinc-100 hover:bg-[#1F2937]"
              >
                Open History
              </Link>
            </div>
          </div>

        </div>
      </div>
    </WorkspaceShell>
  );
}
