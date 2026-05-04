import type { Metadata } from "next";
import { WorkspaceShell } from "../_components/workspace-shell";
import { WorkspaceTopbar } from "../_components/workspace-topbar";
import { resultFindings, resultSeverityMetrics, editorLines } from "../../lib/results-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "CaptionLint | Lint Results",
  description: "Inspect PASS, WARN, and ERROR caption findings with technical context.",
};

export default function ResultsPage() {
  return (
    <WorkspaceShell>
      <WorkspaceTopbar
        left={
          <>
            <span className="font-mono text-sm font-semibold text-zinc-100">video_final.srt</span>
            <Badge variant="outline" className="hidden h-auto rounded border-[#1F2937] bg-[#1F2937] px-2 py-0.5 font-mono text-[10px] text-zinc-300 sm:inline-flex">
              English (US)
            </Badge>
            <Badge variant="outline" className="h-auto rounded border-transparent bg-[#93000a] px-2 py-0.5 font-mono text-[10px] text-[#ffb4ab]">
              12 Issues
            </Badge>
          </>
        }
      />

      {/* Severity summary bar */}
      <div className="fixed left-0 right-0 top-12 z-30 flex items-center gap-4 border-b border-[#1E293B] bg-[#111112] px-4 py-3 md:left-[280px] md:gap-6 md:px-6">
        {resultSeverityMetrics.map((metric) => {
          const colorClass =
            metric.severity === "ERROR"
              ? "text-[#ef4444]"
              : metric.severity === "WARN"
                ? "text-[#f59e0b]"
                : "text-[#22C55E]";
          return (
            <div key={metric.severity} className="flex items-center gap-2">
              <span className={cn("font-mono text-lg font-bold tabular-nums md:text-xl", colorClass)}>
                {metric.value}
              </span>
              <div>
                <span className={cn("block text-[10px] font-semibold uppercase tracking-wider", colorClass)}>
                  {metric.severity}
                </span>
                <span className="hidden text-[11px] text-zinc-500 sm:block">{metric.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main content */}
      <div className="mt-[88px] flex h-[calc(100vh-88px)] flex-col overflow-hidden md:flex-row">

        {/* Findings panel */}
        <aside className="flex h-full w-full flex-col border-b border-[#1E293B] bg-[#111112] md:w-[320px] md:shrink-0 md:border-b-0 md:border-r">
          <div className="flex items-center justify-between border-b border-[#1E293B] p-4">
            <h2 className="text-base font-semibold tracking-tight text-zinc-100 md:text-lg">Findings</h2>
            <Button type="button" size="icon-sm" variant="ghost" className="text-zinc-400 hover:text-zinc-100" title="Filter">
              ⊟
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {resultFindings.map((finding, i) => {
              const isActive = i === 0;
              const severityClass =
                finding.severity === "ERROR"
                  ? "text-[#ef4444]"
                  : finding.severity === "WARN"
                    ? "text-[#f59e0b]"
                    : "text-[#3b82f6]";
              return (
                <div
                  key={finding.id}
                  className={cn(
                    "relative border-b border-[#1E293B] px-4 py-4 transition-colors hover:bg-zinc-900",
                    isActive && "border-l-2 border-l-[#ef4444] bg-zinc-900"
                  )}
                >
                  <div className="mb-1 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className={severityClass}>
                        {finding.severity === "ERROR" ? "⊗" : finding.severity === "WARN" ? "⚠" : "ℹ"}
                      </span>
                      <span className="font-mono text-[13px] text-zinc-400">Line {finding.line}</span>
                    </div>
                    <Badge variant="outline" className={cn("h-auto rounded border-transparent bg-transparent px-0 py-0 text-[10px] uppercase tracking-wider", severityClass)}>
                      {finding.category}
                    </Badge>
                  </div>
                  <p className="mb-2 text-sm text-zinc-100">{finding.message}</p>
                  {finding.action && (
                    <Button type="button" variant="link" size="xs" className="h-auto px-0 text-xs text-[#22C55E] underline underline-offset-2">
                      {finding.action}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Caption preview */}
        <section className="relative hidden flex-1 flex-col bg-[#0A0A0B] md:flex">
          <div className="flex h-10 items-center justify-between border-b border-[#1E293B] bg-[#111112] px-4">
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <Button type="button" variant="ghost" size="xs" className="h-auto px-0 text-xs text-zinc-500 hover:text-zinc-100">
                Wrap text
              </Button>
              <Button type="button" variant="ghost" size="xs" className="h-auto px-0 text-xs text-zinc-500 hover:text-zinc-100">
                Show hidden chars
              </Button>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs text-zinc-500">
              <span>Ln 42, Col 18</span>
              <span>UTF-8</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed text-zinc-300">
            {editorLines.map((line) => (
              <div
                key={line.num}
                className={cn(
                  "relative mb-4 flex rounded px-1 py-1 transition-colors hover:bg-[#111112]",
                  line.error && "border border-[#ef444433] bg-[#ef44440f]"
                )}
              >
                {line.error && (
                  <div className="absolute -left-px top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-[#ef4444]" />
                )}
                <div className={cn("w-12 shrink-0 pr-4 text-right text-zinc-600", line.error && "font-medium text-[#ef4444]")}>
                  {line.num}
                </div>
                <div className="flex-1">
                  <span className="text-zinc-500">{line.timecode}</span>
                  <br />
                  {line.error ? (
                    <span className="underline decoration-[#ef4444] underline-offset-2">{line.text}</span>
                  ) : (
                    line.text.split("\n").map((t, ti, arr) => (
                      <span key={ti}>
                        {t}
                        {ti < arr.length - 1 ? <br /> : null}
                      </span>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}
