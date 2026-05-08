"use client";

import { useEffect, useMemo, useState } from "react";
import posthog from "posthog-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createDemoLintRun, createLintRunFromContent, exportFilename, normalizePresetId } from "@/lib/workflow-data";
import { readCurrentRun, readHistoryRuns } from "@/lib/workflow-storage";
import { defaultVocabularyTerms } from "@repo/config";
import type { PresetId } from "@repo/shared-types";
import { WorkspaceTopbar } from "@/app/_components/workspace-topbar";
import type { LintFinding, LintRun, Severity } from "@repo/shared-types";
import { exportLintRun, getLintRun, getLintRunFindings } from "@repo/api-client";

type ResultsClientProps = {
  runId?: string;
  localRunId?: string;
  fallbackRun: LintRun;
  fallbackExportContent: string;
};

const severityFilters: Array<Severity | "ALL"> = ["ALL", "ERROR", "WARN", "PASS"];

export function ResultsClient({ runId, localRunId, fallbackRun, fallbackExportContent }: ResultsClientProps) {
  const [run, setRun] = useState(fallbackRun);
  const [exportContent, setExportContent] = useState(fallbackExportContent);
  const [activeSeverity, setActiveSeverity] = useState<Severity | "ALL">("ALL");
  const [activeCueIndex, setActiveCueIndex] = useState<number | undefined>(fallbackRun.findings[0]?.cueIndex);
  const [isApiRun, setIsApiRun] = useState(false);

  useEffect(() => {
    if (runId) {
      Promise.all([getLintRun(runId), getLintRunFindings(runId)])
        .then(([apiRun, apiFindings]) => {
          const fullRun: LintRun = { ...apiRun, findings: apiFindings };
          setRun(fullRun);
          setActiveCueIndex(apiFindings[0]?.cueIndex);
          setIsApiRun(true);
        })
        .catch(() => {});
      return;
    }

    if (localRunId) {
      const stored = readHistoryRuns().find((r) => r.id === localRunId);
      if (stored?.rawContent) {
        const result = createLintRunFromContent({
          filename: stored.file,
          content: stored.rawContent,
          presetId: normalizePresetId(stored.presets[0]),
          vocabularyTerms: defaultVocabularyTerms,
        });
        if (result.run && result.exportContent) {
          setRun(result.run);
          setExportContent(result.exportContent);
          setActiveCueIndex(result.run.findings[0]?.cueIndex);
        }
      }
      return;
    }

    const stored = readCurrentRun();
    if (stored) {
      setRun(stored.run);
      setExportContent(stored.exportContent);
      setActiveCueIndex(stored.run.findings[0]?.cueIndex);
      return;
    }

    const demo = createDemoLintRun();
    setRun(demo.run);
    setExportContent(demo.exportContent);
  }, [runId, localRunId]);

  const filteredFindings = useMemo(() => {
    if (activeSeverity === "ALL") return run.findings;
    return run.findings.filter((finding) => finding.severity === activeSeverity);
  }, [activeSeverity, run.findings]);

  async function downloadExport() {
    if (isApiRun && runId) {
      try {
        const result = await exportLintRun(runId, run.format as "SRT" | "VTT");
        posthog.capture("caption_export_downloaded", {
          preset_id: run.presetId,
          format: run.format,
          run_mode: "api",
          errors: run.summary.error,
          warnings: run.summary.warn,
        });
        triggerDownload(result.content, result.filename, run.format);
        return;
      } catch {
        // fall through to local export
      }
    }
    posthog.capture("caption_export_downloaded", {
      preset_id: run.presetId,
      format: run.format,
      run_mode: "local",
      errors: run.summary.error,
      warnings: run.summary.warn,
    });
    triggerDownload(exportContent, exportFilename(run.filename, run.presetId, run.format), run.format);
  }

  return (
    <>
      <WorkspaceTopbar
        showShare={false}
        showExport={false}
        left={
          <>
            <span className="font-mono text-sm font-semibold text-zinc-100">{run.filename}</span>
            <Badge variant="outline" className="hidden h-auto rounded border-[#1F2937] bg-[#1F2937] px-2 py-0.5 font-mono text-[10px] text-zinc-300 sm:inline-flex">
              {run.format}
            </Badge>
            <Badge variant="outline" className="h-auto rounded border-transparent bg-[#93000a] px-2 py-0.5 font-mono text-[10px] text-[#ffb4ab]">
              {run.summary.warn + run.summary.error} Issues
            </Badge>
          </>
        }
      />
      <div className="sticky top-12 z-30 mt-12 flex flex-wrap items-center gap-3 border-b border-[#1E293B] bg-[#111112] px-4 py-3 md:gap-6 md:px-6">
        <SeverityMetric severity="PASS" value={run.summary.pass} label="checks passed" />
        <SeverityMetric severity="WARN" value={run.summary.warn} label="review suggested" />
        <SeverityMetric severity="ERROR" value={run.summary.error} label="blocking issues" />
        <div className="ml-auto flex items-center gap-2">
          {severityFilters.map((severity) => (
            <Button
              key={severity}
              type="button"
              size="sm"
              variant={activeSeverity === severity ? "secondary" : "outline"}
              className="h-7 border-[#1F2937] bg-[#0B0F14] text-xs text-zinc-100"
              onClick={() => setActiveSeverity(severity)}
            >
              {severity}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:h-[calc(100vh-104px)] md:overflow-hidden md:flex-row">
        <aside data-findings-panel className="flex w-full flex-col border-b border-[#1E293B] bg-[#111112] md:h-full md:w-[360px] md:shrink-0 md:border-b-0 md:border-r">
          <div className="flex items-center justify-between border-b border-[#1E293B] p-4">
            <h2 className="text-base font-semibold tracking-tight text-zinc-100 md:text-lg">Findings</h2>
            <span className="font-mono text-xs text-zinc-500">{filteredFindings.length} shown</span>
          </div>
          <div className="md:flex-1 md:overflow-y-auto">
            {filteredFindings.map((finding) => (
              <FindingRow
                key={finding.id}
                finding={finding}
                isActive={finding.cueIndex === activeCueIndex}
                onSelect={() => setActiveCueIndex(finding.cueIndex)}
              />
            ))}
          </div>
          <div className="border-t border-[#1E293B] p-4">
            <Button className="w-full bg-[#22C55E] text-[#003915] hover:bg-[#4BE277]" onClick={downloadExport}>
              Export Fixed File
            </Button>
          </div>
        </aside>

        <section className="flex min-h-[50vh] flex-1 flex-col bg-[#0A0A0B] md:min-h-0">
          <div className="flex h-10 items-center justify-between gap-3 border-b border-[#1E293B] bg-[#111112] px-4">
            <div className="min-w-0 truncate font-mono text-xs text-zinc-500" title={run.filename}>
              {run.filename}
            </div>
            <div className="shrink-0 font-mono text-xs text-zinc-500">engine {run.engineVersion}</div>
          </div>
          <div className="p-4 font-mono text-[13px] leading-relaxed text-zinc-300 md:flex-1 md:overflow-y-auto">
            {run.cues.map((cue) => {
              const isActive = cue.index === activeCueIndex;
              const cueFindings = run.findings.filter((finding) => finding.cueIndex === cue.index);
              return (
                <div
                  key={cue.index}
                  className={cn(
                    "relative mb-4 flex rounded border border-transparent px-1 py-2 transition-colors hover:bg-[#111112]",
                    isActive && "border-[#22C55E55] bg-[#22C55E0f]",
                    cueFindings.some((finding) => finding.severity === "ERROR") && "border-[#ef444433]"
                  )}
                >
                  <div className={cn("w-12 shrink-0 pr-4 text-right text-zinc-600", isActive && "text-[#22C55E]")}>{cue.index}</div>
                  <div className="flex-1">
                    <span className="text-zinc-500">{formatTimeRange(cue.startMs, cue.endMs)}</span>
                    <br />
                    {cue.lines.map((line, index) => (
                      <span key={`${cue.index}-${index}`}>
                        {line}
                        {index < cue.lines.length - 1 ? <br /> : null}
                      </span>
                    ))}
                    {cueFindings.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {cueFindings.map((finding) => (
                          <Badge key={finding.id} variant="outline" className={cn("h-auto rounded border-transparent bg-transparent px-2 py-0.5 text-[10px]", severityTextClass(finding.severity))}>
                            {finding.ruleCode}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}

function triggerDownload(content: string, filename: string, format: string) {
  const blob = new Blob([content], { type: format === "VTT" ? "text/vtt" : "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function SeverityMetric({ severity, value, label }: { severity: Severity; value: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("font-mono text-lg font-bold tabular-nums md:text-xl", severityTextClass(severity))}>{value}</span>
      <div>
        <span className={cn("block text-[10px] font-semibold uppercase tracking-wider", severityTextClass(severity))}>{severity}</span>
        <span className="hidden text-[11px] text-zinc-500 sm:block">{label}</span>
      </div>
    </div>
  );
}

function FindingRow({ finding, isActive, onSelect }: { finding: LintFinding; isActive: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      className={cn(
        "block w-full border-b border-[#1E293B] px-4 py-4 text-left transition-colors hover:bg-zinc-900",
        isActive && "border-l-2 border-l-[#22C55E] bg-zinc-900"
      )}
      onClick={onSelect}
    >
      <div className="mb-1 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={severityTextClass(finding.severity)}>{finding.severity === "ERROR" ? "⊗" : finding.severity === "WARN" ? "⚠" : "✓"}</span>
          <span className="font-mono text-[13px] text-zinc-400">{finding.cueIndex ? `Cue ${finding.cueIndex}` : "Run"}</span>
        </div>
        <Badge variant="outline" className={cn("h-auto rounded border-transparent bg-transparent px-0 py-0 text-[10px] uppercase tracking-wider", severityTextClass(finding.severity))}>
          {finding.category}
        </Badge>
      </div>
      <p className="mb-2 text-sm text-zinc-100">{finding.message}</p>
      {finding.suggestedFix ? <p className="text-xs text-[#22C55E]">Suggested fix: {finding.suggestedFix.label}</p> : null}
    </button>
  );
}

function severityTextClass(severity: Severity): string {
  if (severity === "ERROR") return "text-[#ef4444]";
  if (severity === "WARN") return "text-[#f59e0b]";
  return "text-[#22C55E]";
}

function formatTimeRange(startMs: number, endMs: number): string {
  return `${formatMs(startMs)} --> ${formatMs(endMs)}`;
}

function formatMs(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  const millis = ms % 1000;
  return `00:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
}
