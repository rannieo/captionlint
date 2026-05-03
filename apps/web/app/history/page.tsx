import type { Metadata } from "next";
import { WorkspaceShell } from "../_components/workspace-shell";
import { WorkspaceTopbar } from "../_components/workspace-topbar";
import { historyRuns } from "../../lib/history-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "CaptionLint | Linting History",
  description: "Review historical linting runs, applied presets, and fixed violations across your workspace.",
};

export default function HistoryPage() {
  return (
    <WorkspaceShell>
      <WorkspaceTopbar
        left={<span className="font-mono text-sm font-semibold text-[#22C55E]">video_final.srt</span>}
      />

      <div className="min-h-screen bg-[#131314] px-6 pb-8 pt-20">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-100">Execution Log</h1>
              <p className="text-sm text-zinc-400">
                Review historical linting runs, applied presets, and fixed violations across your workspace.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400">⌕</span>
                <Input
                  className="h-8 w-56 border-[#3d4a3d] bg-[#1c1b1c] pl-7 font-mono text-xs"
                  placeholder="Filter by filename..."
                />
              </div>
              <Button size="sm" variant="outline" className="h-8 border-[#3d4a3d] bg-[#1c1b1c] text-zinc-100">
                Last 7 Days
              </Button>
              <Button size="sm" variant="outline" className="h-8 border-[#3d4a3d] bg-[#1c1b1c] text-zinc-100">
                All Presets
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-[#3d4a3d] bg-[#201f20]">
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#3d4a3d] bg-[#353436]">
                    <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-zinc-400">Filename</th>
                    <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-zinc-400">Platform Preset</th>
                    <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-zinc-400">Date Executed</th>
                    <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-zinc-400">Violations Fixed</th>
                    <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-zinc-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRuns.map((run) => (
                    <tr key={run.file} className="border-b border-[#353436] hover:bg-[#1c1b1c]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={run.status === "fixed" ? "text-[#22c55e]" : "text-[#353436]"}>⬛</span>
                          <span className="font-mono text-sm text-zinc-100">{run.file}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {run.presets.map((preset) => (
                            <span
                              key={preset}
                              className={
                                run.status === "fixed"
                                  ? "rounded bg-[#3e495d] px-2 py-0.5 text-[10px] font-semibold text-[#aeb9d0]"
                                  : "rounded bg-[#353436] px-2 py-0.5 text-[10px] font-semibold text-zinc-100"
                              }
                            >
                              {preset}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">{run.date}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center text-sm">
                          <span
                            className="mr-2 inline-block size-1.5 rounded-full"
                            style={{
                              background:
                                run.status === "fixed"
                                  ? "#22c55e"
                                  : run.status === "review"
                                    ? "#ef4444"
                                    : "#353436",
                            }}
                          />
                          <span className="font-mono text-xs text-zinc-200">{run.autoFixed} Auto-fixed</span>
                          <span className="mx-2 text-zinc-600">|</span>
                          <span
                            className={
                              run.status === "review"
                                ? "font-mono text-xs text-[#ef4444]"
                                : "font-mono text-xs text-zinc-400"
                            }
                          >
                            {run.pendingLabel}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            className="grid size-7 place-items-center rounded hover:bg-[#353436] hover:text-[#22c55e]"
                            title="Re-run"
                          >
                            ↺
                          </button>
                          <button
                            type="button"
                            className="grid size-7 place-items-center rounded text-zinc-400 hover:bg-[#353436] hover:text-zinc-100"
                            title="Download Log"
                          >
                            ↓
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-[#3d4a3d] bg-[#353436] px-4 py-3">
              <span className="font-mono text-xs text-zinc-400">
                Showing 1 to {historyRuns.length} of 128 entries
              </span>
              <div className="flex items-center gap-1">
                <button type="button" className="grid size-7 place-items-center rounded text-zinc-600">
                  ‹
                </button>
                <button
                  type="button"
                  className="grid size-7 place-items-center rounded bg-[#22c55e] font-mono text-xs font-semibold text-[#003915]"
                >
                  1
                </button>
                <button
                  type="button"
                  className="grid size-7 place-items-center rounded font-mono text-xs text-zinc-100 hover:bg-[#3a393a]"
                >
                  2
                </button>
                <button
                  type="button"
                  className="grid size-7 place-items-center rounded font-mono text-xs text-zinc-100 hover:bg-[#3a393a]"
                >
                  3
                </button>
                <span className="px-1 text-zinc-400">...</span>
                <button
                  type="button"
                  className="grid size-7 place-items-center rounded font-mono text-xs text-zinc-100 hover:bg-[#3a393a]"
                >
                  32
                </button>
                <button
                  type="button"
                  className="grid size-7 place-items-center rounded font-mono text-xs text-zinc-100 hover:bg-[#3a393a]"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
