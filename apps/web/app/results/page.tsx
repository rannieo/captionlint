import type { Metadata } from "next";
import { WorkspaceShell } from "../_components/workspace-shell";
import { WorkspaceTopbar } from "../_components/workspace-topbar";
import { resultFindings, editorLines } from "../../lib/results-data";
import { Button } from "@/components/ui/button";
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
            <span className="text-sm text-zinc-400">⬛</span>
            <span className="font-mono text-sm font-semibold text-zinc-100">video_final.srt</span>
            <span className="mx-1 h-4 w-px bg-[#1F2937]" />
            <span className="inline-flex rounded bg-[#1F2937] px-2 py-0.5 font-mono text-[10px] text-zinc-300">
              English (US)
            </span>
            <span className="inline-flex rounded bg-[#93000a] px-2 py-0.5 font-mono text-[10px] text-[#ffb4ab]">
              12 Issues
            </span>
          </>
        }
        rightSlot={
          <div className="flex rounded border border-[#1F2937] bg-[#0A0A0B] p-0.5">
            <Button size="xs" variant="ghost" className="bg-zinc-900 text-zinc-100">
              Lint Mode
            </Button>
            <Button size="xs" variant="ghost" className="text-zinc-500">
              Edit Mode
            </Button>
          </div>
        }
      />

      <div className="mt-12 flex h-[calc(100vh-48px)] overflow-hidden">
        <aside className="z-10 flex h-full w-[320px] shrink-0 flex-col border-r border-[#1E293B] bg-[#111112]">
          <div className="flex items-center justify-between border-b border-[#1E293B] p-4">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-100">Findings</h2>
            <button type="button" className="text-zinc-400 hover:text-zinc-100" title="Filter">
              ⊟
            </button>
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
                    <span className={cn("text-[10px] uppercase tracking-wider", severityClass)}>
                      {finding.category}
                    </span>
                  </div>
                  <p className="mb-2 text-sm text-zinc-100">{finding.message}</p>
                  {finding.action && (
                    <button type="button" className="text-xs text-[#22C55E] underline underline-offset-2">
                      {finding.action}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <section className="relative flex flex-1 flex-col bg-[#0A0A0B]">
          <div className="flex h-10 items-center justify-between border-b border-[#1E293B] bg-[#111112] px-4">
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <button type="button" className="hover:text-zinc-100">
                Wrap text
              </button>
              <button type="button" className="hover:text-zinc-100">
                Show hidden chars
              </button>
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
                <div
                  className={cn(
                    "w-12 shrink-0 pr-4 text-right text-zinc-600",
                    line.error && "font-medium text-[#ef4444]"
                  )}
                >
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
