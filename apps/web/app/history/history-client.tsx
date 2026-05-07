"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { WorkspaceShell } from "../_components/workspace-shell";
import { WorkspaceTopbar } from "../_components/workspace-topbar";
import type { HistoryRun } from "@/lib/history-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { listHistory, refixHistory, exportLintRun, type HistoryItem } from "@repo/api-client";

const PRESET_LABELS: Record<string, string> = {
  default: "Default",
  tiktok: "TikTok",
  instagram: "Instagram",
  "youtube-shorts": "YouTube Shorts",
};

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type HistoryClientProps = {
  runs: HistoryRun[];
};

function parseHistoryDate(value: string): number {
  const parsed = new Date(value.replace(" ", "T") + (value.includes("Z") ? "" : "Z")).getTime();
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
    date: item.createdAt,
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
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [presetFilter, setPresetFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<"all" | "7d">("all");

  useEffect(() => {
    setBrowserRuns(readHistoryRuns());
  }, []);

  // Resolve orgId once when session is available
  useEffect(() => {
    if (!session?.user) return;
    authClient.organization.list().then((result) => {
      const id = result.data?.[0]?.id;
      if (id) setOrgId(id);
    }).catch(() => {});
  }, [session?.user]);

  // Re-fetch from API whenever orgId, search query, or preset filter changes
  const fetchApiRuns = useCallback((id: string, filename?: string, preset?: string) => {
    setIsLoading(true);
    listHistory(id, {
      filename: filename || undefined,
      preset: preset && preset !== "all" ? preset : undefined,
    })
      .then((items) => setApiRuns(items.map(apiItemToHistoryRun)))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Debounce query changes; immediate on preset/orgId changes
  useEffect(() => {
    if (!orgId) return;
    const delay = query ? 300 : 0;
    const timer = setTimeout(() => fetchApiRuns(orgId, query, presetFilter), delay);
    return () => clearTimeout(timer);
  }, [orgId, query, presetFilter, fetchApiRuns]);

  const allRuns = useMemo(
    () => mergeAndSortRuns(browserRuns, session?.user ? apiRuns : [...apiRuns, ...runs]),
    [browserRuns, apiRuns, runs, session?.user],
  );

  // Preset options derived from all loaded runs (for browser runs; API runs are already server-filtered)
  const presetOptions = useMemo(
    () => Array.from(new Set(allRuns.flatMap((run) => run.presets))).sort((a, b) => a.localeCompare(b)),
    [allRuns],
  );

  const hasActiveFilters = query.trim().length > 0 || presetFilter !== "all" || dateFilter !== "all";

  // Date filter is client-side only (API doesn't support it); query/preset already applied server-side for API runs
  const filteredRuns = useMemo(() => {
    const dateCutoffMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const normalizedQuery = query.trim().toLowerCase();

    return allRuns.filter((run) => {
      const matchesQuery = !normalizedQuery || run.file.toLowerCase().includes(normalizedQuery);
      const matchesPreset = presetFilter === "all" || run.presets.includes(presetFilter);
      const matchesDate = dateFilter === "all" || parseHistoryDate(run.date) >= dateCutoffMs;
      return matchesQuery && matchesPreset && matchesDate;
    });
  }, [allRuns, dateFilter, presetFilter, query]);

  async function downloadHistoryRun(run: HistoryRun) {
    const format = run.format ?? (run.file.toLowerCase().endsWith(".vtt") ? "VTT" : "SRT");
    const extension = format.toLowerCase();
    const base = run.file.replace(/\.(srt|vtt)$/i, "");

    let content: string;
    if (run.isApiRun && run.lintRunId) {
      const result = await exportLintRun(run.lintRunId, format);
      content = result.content;
    } else if (run.downloadContent) {
      content = run.downloadContent;
    } else {
      return;
    }

    const blob = new Blob([content], { type: format === "VTT" ? "text/vtt" : "text/plain" });
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
    router.push(`/results/${result.runId}`);
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
                <svg className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-8 w-48 border-[#1F2937] bg-[#0B0F14] pl-7 font-mono text-xs md:w-56"
                  placeholder="Search by filename..."
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200"
                    aria-label="Clear search"
                  >
                    <svg className="size-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <Select value={presetFilter} onValueChange={(value) => setPresetFilter(value ?? "all")}>
                <SelectTrigger className="h-8 w-40 border-[#1F2937] bg-[#111827] text-xs text-zinc-100">
                  <SelectValue placeholder="All Presets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Presets</SelectItem>
                  {presetOptions.map((preset) => (
                    <SelectItem key={preset} value={preset}>
                      {PRESET_LABELS[preset] ?? preset}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant={dateFilter === "7d" ? "secondary" : "outline"}
                className="h-8 border-[#1F2937] bg-[#111827] text-zinc-100"
                onClick={() => setDateFilter((prev) => (prev === "7d" ? "all" : "7d"))}
              >
                Last 7 Days{dateFilter === "7d" ? " ✓" : ""}
              </Button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => { setQuery(""); setPresetFilter("all"); setDateFilter("all"); }}
                  className="text-xs text-zinc-500 hover:text-zinc-200"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#1F2937] hover:bg-transparent">
                  <TableHead className="px-0 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Filename</TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Preset</TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Date</TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Issues</TableHead>
                  <TableHead className="px-0 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRuns.length > 0 ? (
                  filteredRuns.map((run) => (
                    <TableRow key={run.id} className="border-b border-[#1F2937] last:border-0 hover:bg-[#111827]/60">
                      <TableCell className="px-0 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-1.5 shrink-0 rounded-full"
                            style={{
                              background:
                                run.status === "fixed" ? "#22c55e"
                                : run.status === "review" ? "#ef4444"
                                : "#4b5563",
                            }}
                          />
                          <span className="font-mono text-sm text-zinc-100">{run.file}</span>
                          {run.isDemo && (
                            <span className="rounded bg-[#1F2937] px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">demo</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3.5">
                        <span className="text-xs text-zinc-400">
                          {run.presets.map((p) => PRESET_LABELS[p] ?? p).join(", ")}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3.5 font-mono text-xs text-zinc-500">{formatDate(run.date)}</TableCell>
                      <TableCell className="px-4 py-3.5">
                        {run.status === "clean" ? (
                          <span className="text-xs text-zinc-500">Clean</span>
                        ) : run.status === "review" ? (
                          <span className="text-xs text-[#ef4444]">{run.pending} to review</span>
                        ) : (
                          <span className="text-xs text-[#22c55e]">{run.autoFixed} fixed</span>
                        )}
                      </TableCell>
                      <TableCell className="px-0 py-3.5 text-right">
                        <div className="flex justify-end gap-0.5">
                          {run.isApiRun ? (
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="ghost"
                              className="size-7 text-zinc-500 hover:text-[#22c55e]"
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
                              className="size-7 text-zinc-500 hover:text-[#22c55e]"
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
                              className="size-7 cursor-not-allowed text-zinc-700"
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
                            className="size-7 text-zinc-500 hover:text-zinc-100 disabled:opacity-30"
                            disabled={!run.downloadContent && !(run.isApiRun && run.lintRunId)}
                            title="Download fixed file"
                            onClick={() => downloadHistoryRun(run)}
                          >
                            ⇩
                          </Button>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            className="size-7 text-zinc-500 hover:text-zinc-100"
                            render={
                              <Link
                                href={
                                  run.isApiRun && run.lintRunId
                                    ? `/results/${run.lintRunId}`
                                    : `/history/${run.id}`
                                }
                              />
                            }
                            nativeButton={false}
                            title="View Results"
                          >
                            →
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="px-0 py-16 text-center text-sm text-zinc-500">
                      {isLoading
                        ? "Loading…"
                        : hasActiveFilters
                          ? "No runs match your search."
                          : session?.user
                            ? "No runs yet — upload a caption file to get started."
                            : "No history yet."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <p className="mt-4 font-mono text-xs text-zinc-600">
              {filteredRuns.length} of {allRuns.length} {allRuns.length === 1 ? "run" : "runs"}
            </p>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
