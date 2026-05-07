"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { WorkspaceShell } from "../_components/workspace-shell";
import { WorkspaceTopbar } from "../_components/workspace-topbar";
import type { HistoryRun } from "@/lib/history-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { readHistoryRuns } from "@/lib/workflow-storage";
import { mergeAndSortRuns } from "@/lib/history-utils";
import { authClient } from "@/lib/auth-client";
import { listHistory, refixHistory, type HistoryItem } from "@repo/api-client";

type HistoryClientProps = {
  runs: HistoryRun[];
};

function parseHistoryDate(value: string): number {
  const parsed = new Date(value.replace(" ", "T")).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function apiItemToHistoryRun(item: HistoryItem): HistoryRun {
  const { pass: _pass, warn, error, total } = item.summary;
  const pending = warn + error;
  return {
    id: item.id,
    lintRunId: item.lintRunId,
    isApiRun: true,
    file: item.filename,
    presets: [item.preset],
    date: item.createdAt.replace("T", " ").slice(0, 19),
    autoFixed: total - pending,
    pending,
    pendingLabel: pending === 0 ? "0 Violations Found" : `${pending} Pending Review`,
    status: error > 0 ? "review" : warn > 0 ? "fixed" : "clean",
  };
}

export function HistoryClient({ runs }: HistoryClientProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [orgId, setOrgId] = useState<string | undefined>();
  const [browserRuns, setBrowserRuns] = useState<HistoryRun[]>([]);
  const [apiRuns, setApiRuns] = useState<HistoryRun[]>([]);
  const [query, setQuery] = useState("");
  const [presetFilter, setPresetFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<"all" | "7d">("all");
  const allRuns = useMemo(() => mergeAndSortRuns(browserRuns, [...apiRuns, ...runs]), [browserRuns, apiRuns, runs]);

  useEffect(() => {
    setBrowserRuns(readHistoryRuns());
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    authClient.organization.list().then((result) => {
      const orgs = result.data;
      const id = orgs?.[0]?.id;
      if (!id) return;
      setOrgId(id);
      listHistory(id).then((items) => setApiRuns(items.map(apiItemToHistoryRun))).catch(() => {});
    }).catch(() => {});
  }, [session?.user]);

  const presetOptions = useMemo(
    () => Array.from(new Set(allRuns.flatMap((run) => run.presets))).sort((a, b) => a.localeCompare(b)),
    [allRuns]
  );

  const newestRunDate = useMemo(() => {
    return allRuns.reduce((latest, run) => Math.max(latest, parseHistoryDate(run.date)), 0);
  }, [allRuns]);

  const filteredRuns = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const dateCutoffMs = newestRunDate - 7 * 24 * 60 * 60 * 1000;

    return allRuns.filter((run) => {
      const matchesQuery = normalizedQuery.length === 0 || run.file.toLowerCase().includes(normalizedQuery);
      const matchesPreset = presetFilter === "all" || run.presets.includes(presetFilter);
      const matchesDateWindow =
        dateFilter === "all" || parseHistoryDate(run.date) >= dateCutoffMs;

      return matchesQuery && matchesPreset && matchesDateWindow;
    });
  }, [allRuns, dateFilter, newestRunDate, presetFilter, query]);

  function downloadHistoryRun(run: HistoryRun) {
    if (!run.downloadContent) return;
    const format = run.format ?? (run.file.toLowerCase().endsWith(".vtt") ? "VTT" : "SRT");
    const extension = format.toLowerCase();
    const base = run.file.replace(/\.(srt|vtt)$/i, "");
    const blob = new Blob([run.downloadContent], { type: format === "VTT" ? "text/vtt" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${base}.captionlint.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function refixApiRun(run: HistoryRun) {
    if (!run.isApiRun) return;
    const presetId = run.presets[0] ?? "default";
    const result = await refixHistory(run.id, presetId);
    router.push(`/results?runId=${result.runId}`);
  }

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
                Review previous caption QA runs, applied presets, and files ready for re-fix.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400">⌕</span>
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-8 w-48 border-[#1F2937] bg-[#0B0F14] pl-7 font-mono text-xs md:w-56"
                  placeholder="Filter by filename..."
                />
              </div>
              <Button
                size="sm"
                variant={dateFilter === "7d" ? "secondary" : "outline"}
                className="h-8 border-[#1F2937] bg-[#111827] text-zinc-100"
                onClick={() => setDateFilter((prev) => (prev === "7d" ? "all" : "7d"))}
              >
                {dateFilter === "7d" ? "Last 7 Days ✓" : "Last 7 Days"}
              </Button>
              <Select value={presetFilter} onValueChange={(value) => setPresetFilter(value ?? "all")}>
                <SelectTrigger className="h-8 w-40 border-[#1F2937] bg-[#111827] text-xs text-zinc-100">
                  <SelectValue placeholder="All Presets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Presets</SelectItem>
                  {presetOptions.map((preset) => (
                    <SelectItem key={preset} value={preset}>
                      {preset}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                {filteredRuns.length > 0 ? (
                  filteredRuns.map((run) => (
                    <TableRow key={run.id} className="border-b border-[#1F2937] hover:bg-[#0B0F14]">
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={run.status === "fixed" ? "text-[#22c55e]" : "text-[#1F2937]"}>⬛</span>
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
                            <Badge
                              key={preset}
                              variant="outline"
                              className="h-auto rounded border-transparent bg-[#1F2937] px-2 py-0.5 text-[10px] font-semibold text-zinc-300"
                            >
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
                                run.status === "fixed"
                                  ? "#22c55e"
                                  : run.status === "review"
                                    ? "#ef4444"
                                    : "#6b7280",
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
                          {run.isApiRun ? (
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="ghost"
                              className="text-zinc-400 hover:text-[#22c55e]"
                              title="Re-run"
                              onClick={() => refixApiRun(run)}
                            >
                              ↺
                            </Button>
                          ) : run.rawContent ? (
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="ghost"
                              className="text-zinc-400 hover:text-[#22c55e]"
                              render={<Link href={`/upload?runId=${encodeURIComponent(run.id)}`} />}
                              nativeButton={false}
                              title="Re-run"
                            >
                              ↺
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="ghost"
                              className="cursor-not-allowed text-zinc-600 opacity-40"
                              disabled
                              title="Demo run — upload the file to re-fix"
                            >
                              ↺
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            className="text-zinc-400 hover:text-zinc-100 disabled:opacity-40"
                            disabled={!run.downloadContent}
                            title="Download fixed file"
                            onClick={() => downloadHistoryRun(run)}
                          >
                            ⇩
                          </Button>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            className="text-zinc-400 hover:text-zinc-100"
                            render={
                              <Link
                                href={
                                  run.isApiRun && run.lintRunId
                                    ? `/results?runId=${run.lintRunId}`
                                    : `/history/${run.id}`
                                }
                              />
                            }
                            nativeButton={false}
                            title="View Results"
                          >
                            ✎
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-b border-[#1F2937]">
                    <TableCell colSpan={5} className="px-4 py-10 text-center text-sm text-zinc-400">
                      No history runs match your current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between border-t border-[#1F2937] bg-[#1F2937] px-4 py-3">
              <span className="font-mono text-xs text-zinc-400">
                Showing {filteredRuns.length} of {allRuns.length} entries
              </span>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
