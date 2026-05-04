import type { Metadata } from "next";
import { WorkspaceShell } from "../_components/workspace-shell";
import { WorkspaceTopbar } from "../_components/workspace-topbar";
import { historyRuns } from "../../lib/history-data";
import { Input } from "@/components/ui/input";
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

export const metadata: Metadata = {
  title: "CaptionLint | Linting History",
  description: "Review historical linting runs, applied presets, and fixed violations across your workspace.",
};

export default function HistoryPage() {
  return (
    <WorkspaceShell>
      <WorkspaceTopbar
        left={<span className="text-sm font-semibold text-zinc-100">Linting History</span>}
        showShare={false}
        showExport={false}
      />

      <div className="min-h-screen bg-[#0B0F14] px-4 pb-8 pt-20 md:px-6">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-100">Linting History</h1>
              <p className="text-sm text-zinc-400">
                Review historical linting runs, applied presets, and fixed violations across your workspace.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400">⌕</span>
                <Input
                  className="h-8 w-48 border-[#1F2937] bg-[#0B0F14] pl-7 font-mono text-xs md:w-56"
                  placeholder="Filter by filename..."
                />
              </div>
              <Button size="sm" variant="outline" className="h-8 border-[#1F2937] bg-[#111827] text-zinc-100">
                Last 7 Days
              </Button>
              <Button size="sm" variant="outline" className="h-8 border-[#1F2937] bg-[#111827] text-zinc-100">
                All Presets
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#1F2937] bg-[#111827]">
            <Table>
              <TableHeader className="bg-[#1F2937]">
                <TableRow className="border-b border-[#1F2937] hover:bg-transparent">
                  <TableHead className="px-4 py-3 text-[11px] uppercase tracking-wider text-zinc-400">Filename</TableHead>
                  <TableHead className="px-4 py-3 text-[11px] uppercase tracking-wider text-zinc-400">Platform Preset</TableHead>
                  <TableHead className="px-4 py-3 text-[11px] uppercase tracking-wider text-zinc-400">Date Executed</TableHead>
                  <TableHead className="px-4 py-3 text-[11px] uppercase tracking-wider text-zinc-400">Violations Fixed</TableHead>
                  <TableHead className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyRuns.map((run) => (
                  <TableRow key={run.file} className="border-b border-[#1F2937] hover:bg-[#0B0F14]">
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={run.status === "fixed" ? "text-[#22c55e]" : "text-[#1F2937]"}>⬛</span>
                        <span className="font-mono text-sm text-zinc-100">{run.file}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {run.presets.map((preset) => (
                          <Badge key={preset} variant="outline" className="h-auto rounded border-transparent bg-[#1F2937] px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                            {preset}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 font-mono text-xs text-zinc-400">{run.date}</TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center text-sm">
                        <span
                          className="mr-2 inline-block size-1.5 rounded-full"
                          style={{
                            background:
                              run.status === "fixed" ? "#22c55e" : run.status === "review" ? "#ef4444" : "#6b7280",
                          }}
                        />
                        <span className="font-mono text-xs text-zinc-200">{run.autoFixed} Auto-fixed</span>
                        <span className="mx-2 text-zinc-600">|</span>
                        <span className={run.status === "review" ? "font-mono text-xs text-[#ef4444]" : "font-mono text-xs text-zinc-400"}>
                          {run.pendingLabel}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          className="text-zinc-400 hover:text-[#22c55e]"
                          title="Re-run"
                        >
                          ↺
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          className="text-zinc-400 hover:text-zinc-100"
                          title="Download Log"
                        >
                          ↓
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between border-t border-[#1F2937] bg-[#1F2937] px-4 py-3">
              <span className="font-mono text-xs text-zinc-400">
                Showing 1 to {historyRuns.length} of 128 entries
              </span>
              <div className="flex items-center gap-1">
                <Button type="button" size="icon-sm" variant="ghost" className="text-zinc-600">
                  ‹
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  className="font-mono text-xs font-semibold text-[#003915]"
                >
                  1
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="font-mono text-xs text-zinc-100 hover:bg-zinc-700"
                >
                  2
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="font-mono text-xs text-zinc-100 hover:bg-zinc-700"
                >
                  3
                </Button>
                <span className="px-1 text-zinc-400">...</span>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="font-mono text-xs text-zinc-100 hover:bg-zinc-700"
                >
                  32
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="font-mono text-xs text-zinc-100 hover:bg-zinc-700"
                >
                  ›
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
