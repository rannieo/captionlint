import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { createDemoLintRun } from "@/lib/workflow-data";
import { WorkspaceShell } from "../_components/workspace-shell";
import { WorkspaceTopbar } from "../_components/workspace-topbar";
import { ResultsClient } from "./results-client";

export const metadata: Metadata = {
  title: "CaptionLint | Lint Results",
  description: "Inspect PASS, WARN, and ERROR caption findings with cue-level context.",
};

export default function ResultsPage() {
  const fallback = createDemoLintRun();

  return (
    <WorkspaceShell>
      <WorkspaceTopbar
        left={
          <>
            <span className="font-mono text-sm font-semibold text-zinc-100">{fallback.run.filename}</span>
            <Badge variant="outline" className="hidden h-auto rounded border-[#1F2937] bg-[#1F2937] px-2 py-0.5 font-mono text-[10px] text-zinc-300 sm:inline-flex">
              {fallback.run.format}
            </Badge>
            <Badge variant="outline" className="h-auto rounded border-transparent bg-[#93000a] px-2 py-0.5 font-mono text-[10px] text-[#ffb4ab]">
              {fallback.run.summary.warn + fallback.run.summary.error} Issues
            </Badge>
          </>
        }
      />
      <ResultsClient fallbackRun={fallback.run} fallbackExportContent={fallback.exportContent} />
    </WorkspaceShell>
  );
}
