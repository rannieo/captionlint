"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { historyRuns, type HistoryRun } from "@/lib/history-data";
import { mergeAndSortRuns } from "@/lib/history-utils";
import { readHistoryRuns } from "@/lib/workflow-storage";

const statusConfig = {
  fixed: { label: "Fixed", className: "h-auto rounded-full border-[#22c55e33] bg-[#22c55e1a] px-2.5 py-0.5 text-[11px] font-semibold text-[#22c55e]" },
  review: { label: "Needs Review", className: "h-auto rounded-full border-[#f59e0b33] bg-[#f59e0b1a] px-2.5 py-0.5 text-[11px] font-semibold text-[#f59e0b]" },
  clean: { label: "Clean", className: "h-auto rounded-full border-[#1F2937] bg-[#111827] px-2.5 py-0.5 text-[11px] font-semibold text-zinc-400" },
} as const;

export function RecentRunsTable() {
  const [browserRuns, setBrowserRuns] = useState<HistoryRun[]>([]);

  useEffect(() => {
    setBrowserRuns(readHistoryRuns());
  }, []);

  const runs = useMemo(
    () => mergeAndSortRuns(browserRuns, historyRuns, 5),
    [browserRuns],
  );

  return (
    <div className="overflow-hidden rounded-lg border border-[#1F2937] bg-[#111827]">
      <Table>
        <TableHeader className="bg-[#1F2937]">
          <TableRow className="border-b border-[#1F2937] hover:bg-transparent">
            <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Filename</TableHead>
            <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Preset</TableHead>
            <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Date</TableHead>
            <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Fixed</TableHead>
            <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Status</TableHead>
            <TableHead className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.map((run) => {
            const status = statusConfig[run.status];
            return (
              <TableRow key={run.id} className="border-b border-[#1F2937] last:border-0 hover:bg-[#0B0F14]">
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-zinc-100">{run.file}</span>
                    {run.isDemo && (
                      <Badge variant="outline" data-demo="true" className="h-auto rounded border-transparent bg-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-400">
                        Demo
                      </Badge>
                    )}
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
                <TableCell className="px-4 py-3 font-mono text-sm text-zinc-100">{run.autoFixed}</TableCell>
                <TableCell className="px-4 py-3">
                  <Badge variant="outline" className={status.className}>{status.label}</Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <Button
                    variant="link"
                    size="xs"
                    className="px-0 text-zinc-400 hover:text-zinc-100"
                    render={<Link href="/results" />}
                    nativeButton={false}
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
  );
}
